<?php
/**
 * FluentLanguage.net - Reviews API
 * Handles review submissions and retrieval using Resend API
 */

// Load configuration
require_once '/home/fluentl/config/env.php';

// Configuration
define('DATA_DIR', '/home/fluentl/data');
define('REVIEWS_FILE', DATA_DIR . '/reviews.json');
define('RESEND_API_URL', 'https://api.resend.com/emails');

// Enable CORS for development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Content-Type: application/json');

// Create data directory if it doesn't exist
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

// Initialize reviews file if it doesn't exist
if (!file_exists(REVIEWS_FILE)) {
    file_put_contents(REVIEWS_FILE, json_encode([]));
}

// Rate limiting
session_start();
$rate_limit_file = DATA_DIR . '/rate_limit.json';
$rate_limit = getRateLimit($rate_limit_file);

function getRateLimit($file) {
    $now = time();
    $data = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
    
    // Clean old entries (older than 1 hour) for each IP
    foreach ($data as $ip => $timestamps) {
        $data[$ip] = array_filter($timestamps, function($timestamp) use ($now) {
            return ($now - $timestamp) < 3600;
        });
        $data[$ip] = array_values($data[$ip]);
    }
    
    return $data;
}

function checkRateLimit($ip, $file, $max = 5) {
    global $rate_limit;
    $now = time();
    
    // Initialize IP array if not exists
    if (!isset($rate_limit[$ip])) {
        $rate_limit[$ip] = [];
    }
    
    // Clean old entries (older than 1 hour)
    $rate_limit[$ip] = array_filter($rate_limit[$ip], function($timestamp) use ($now) {
        return ($now - $timestamp) < 3600;
    });
    $rate_limit[$ip] = array_values($rate_limit[$ip]);
    
    // Count submissions in last hour
    $count = count($rate_limit[$ip]);
    
    if ($count >= $max) {
        return false;
    }
    
    // Record this submission
    $rate_limit[$ip][] = $now;
    file_put_contents($file, json_encode($rate_limit));
    
    return true;
}

function sendEmailViaResend($to, $subject, $text) {
    $payload = [
        'from' => 'FluentLanguage.net <noreply@send.fluentlanguage.net>',
        'to' => [$to],
        'subject' => $subject,
        'text' => $text
    ];
    
    $ch = curl_init(RESEND_API_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . RESEND_API_KEY,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return $httpCode >= 200 && $httpCode < 300;
}

// Handle request
$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');

if ($_SERVER['REQUEST_METHOD'] === 'GET' || $action === 'list') {
    // List reviews
    $reviews = json_decode(file_get_contents(REVIEWS_FILE), true) ?? [];
    
    // Sort by date, newest first
    usort($reviews, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
    
    echo json_encode([
        'success' => true,
        'reviews' => $reviews
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Rate limit check
    $client_ip = $_SERVER['REMOTE_ADDR'];
    if (!checkRateLimit($client_ip, $rate_limit_file)) {
        echo json_encode([
            'success' => false,
            'message' => 'Too many submissions. Please try again later.'
        ]);
        exit;
    }
    
    // Honeypot check
    if (!empty($_POST['website'])) {
        echo json_encode(['success' => true]);
        exit;
    }
    
    // Validate input
    $rating = intval($_POST['rating'] ?? 0);
    $comment = trim($_POST['comment'] ?? '');
    $name = trim($_POST['name'] ?? '');
    
    if ($rating < 1 || $rating > 5) {
        echo json_encode([
            'success' => false,
            'message' => 'Please select a rating.'
        ]);
        exit;
    }
    
    if (empty($comment)) {
        echo json_encode([
            'success' => false,
            'message' => 'Please write a review comment.'
        ]);
        exit;
    }
    
    // Save review
    $reviews = json_decode(file_get_contents(REVIEWS_FILE), true) ?? [];
    
    $review = [
        'id' => uniqid(),
        'name' => htmlspecialchars($name),
        'rating' => $rating,
        'comment' => htmlspecialchars($comment),
        'sentiment' => getSentiment($rating),
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    array_unshift($reviews, $review);
    file_put_contents(REVIEWS_FILE, json_encode($reviews, JSON_PRETTY_PRINT));
    
    // Send notification email via Resend
    sendReviewNotification($review);
    
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your review!'
    ]);
    exit;
}

function getSentiment($rating) {
    if ($rating >= 4) return 'positive';
    if ($rating == 3) return 'neutral';
    return 'negative';
}

function sendReviewNotification($review) {
    $sentiment_emoji = $review['sentiment'] === 'positive' ? '🙂' : ($review['sentiment'] === 'neutral' ? '😐' : '☹️');
    
    $subject = "New Review on FluentLanguage.net - {$sentiment_emoji} {$review['rating']}/5 stars";
    
    $body = "New review submitted on FluentLanguage.net:\n\n";
    $body .= "Rating: {$review['rating']}/5 stars {$sentiment_emoji}\n";
    $body .= "Name: " . ($review['name'] ?: 'Anonymous') . "\n";
    $body .= "Date: {$review['created_at']}\n\n";
    $body .= "Review:\n{$review['comment']}\n";
    
    sendEmailViaResend(NOTIFY_EMAIL, $subject, $body);
}
