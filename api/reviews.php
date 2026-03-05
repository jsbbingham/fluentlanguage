<?php
/**
 * FluentLanguage.net - Reviews API
 * Handles review submissions and retrieval using Resend API
 */

require_once __DIR__ . '/config.php';

// Set CORS and content type
setCorsHeaders();
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Create data directory if it doesn't exist
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

define('REVIEWS_FILE', DATA_DIR . '/reviews.json');

// Initialize reviews file if it doesn't exist
if (!file_exists(REVIEWS_FILE)) {
    file_put_contents(REVIEWS_FILE, json_encode([]));
}

// Handle request
$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');

if ($_SERVER['REQUEST_METHOD'] === 'GET' || $action === 'list') {
    // List reviews (read with shared lock)
    $reviews = [];
    $fp = fopen(REVIEWS_FILE, 'r');
    if ($fp && flock($fp, LOCK_SH)) {
        $reviews = json_decode(stream_get_contents($fp), true) ?? [];
        flock($fp, LOCK_UN);
    }
    if ($fp) fclose($fp);

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
    // CSRF check
    $csrf_token = $_POST['csrf_token'] ?? '';
    if (!validateCsrfToken($csrf_token)) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid form submission. Please reload the page and try again.'
        ]);
        exit;
    }

    // Honeypot check
    if (!empty($_POST['website'])) {
        echo json_encode(['success' => true]);
        exit;
    }

    // Rate limit check
    $rate_limit_file = DATA_DIR . '/rate_limit.json';
    $client_ip = $_SERVER['REMOTE_ADDR'];
    if (!checkRateLimit($client_ip, $rate_limit_file, 5)) {
        echo json_encode([
            'success' => false,
            'message' => 'Too many submissions. Please try again later.'
        ]);
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

    if (strlen($comment) > 2000) {
        echo json_encode([
            'success' => false,
            'message' => 'Review must be under 2000 characters.'
        ]);
        exit;
    }

    if (strlen($name) > 200) {
        echo json_encode([
            'success' => false,
            'message' => 'Name must be under 200 characters.'
        ]);
        exit;
    }

    // Save review (with file locking)
    $reviews = [];
    $fp = fopen(REVIEWS_FILE, 'r');
    if ($fp && flock($fp, LOCK_SH)) {
        $reviews = json_decode(stream_get_contents($fp), true) ?? [];
        flock($fp, LOCK_UN);
    }
    if ($fp) fclose($fp);

    $review = [
        'id' => uniqid(),
        'name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
        'rating' => $rating,
        'comment' => htmlspecialchars($comment, ENT_QUOTES, 'UTF-8'),
        'sentiment' => getSentiment($rating),
        'created_at' => date('Y-m-d H:i:s')
    ];

    array_unshift($reviews, $review);

    $fp = fopen(REVIEWS_FILE, 'c');
    if ($fp && flock($fp, LOCK_EX)) {
        ftruncate($fp, 0);
        fwrite($fp, json_encode($reviews, JSON_PRETTY_PRINT));
        fflush($fp);
        flock($fp, LOCK_UN);
    }
    if ($fp) fclose($fp);

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
