<?php
/**
 * FluentLanguage.net - Contact Form API
 * Handles contact form submissions using Resend API
 */

// Load configuration
require_once '/home/fluentl/config/env.php';

// Configuration
define('DATA_DIR', '/home/fluentl/data');
define('RESEND_API_URL', 'https://api.resend.com/emails');

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Content-Type: application/json');

// Create data directory if needed
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

// Rate limiting
$rate_limit_file = DATA_DIR . '/contact_rate_limit.json';

function checkContactRateLimit($ip, $file, $max = 3) {
    $now = time();
    $data = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
    
    // Initialize IP array if not exists
    if (!isset($data[$ip])) {
        $data[$ip] = [];
    }
    
    // Clean old entries (older than 1 hour) for this IP
    $data[$ip] = array_filter($data[$ip], function($timestamp) use ($now) {
        return ($now - $timestamp) < 3600;
    });
    
    // Re-index array after filter
    $data[$ip] = array_values($data[$ip]);
    
    $count = count($data[$ip]);
    
    if ($count >= $max) {
        return false;
    }
    
    $data[$ip][] = $now;
    file_put_contents($file, json_encode($data));
    
    return true;
}

function sendEmailViaResend($to, $subject, $text, $replyTo = null) {
    $payload = [
        'from' => 'FluentLanguage.net <noreply@send.fluentlanguage.net>',
        'to' => [$to],
        'subject' => $subject,
        'text' => $text
    ];
    
    if ($replyTo) {
        $payload['reply_to'] = $replyTo;
    }
    
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

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
    exit;
}

// Honeypot check
if (!empty($_POST['website'])) {
    echo json_encode(['success' => true]);
    exit;
}

// Rate limit check
$client_ip = $_SERVER['REMOTE_ADDR'];
if (!checkContactRateLimit($client_ip, $rate_limit_file)) {
    echo json_encode([
        'success' => false,
        'message' => 'Too many submissions. Please try again later.'
    ]);
    exit;
}

// Validate input
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$subject = $_POST['subject'] ?? '';
$message = trim($_POST['message'] ?? '');

$errors = [];

if (empty($name)) {
    $errors[] = 'Name is required';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Valid email is required';
}

if (empty($subject)) {
    $errors[] = 'Please select a subject';
}

if (empty($message)) {
    $errors[] = 'Message is required';
}

if (strlen($message) < 10) {
    $errors[] = 'Message must be at least 10 characters';
}

if (!empty($errors)) {
    echo json_encode([
        'success' => false,
        'message' => implode('. ', $errors)
    ]);
    exit;
}

// Send email notification via Resend
$subject_line = "FluentLanguage.net Contact: " . getSubjectLabel($subject);

$email_body = "New contact form submission from FluentLanguage.net\n";
$email_body .= "===============================================\n\n";
$email_body .= "Name: {$name}\n";
$email_body .= "Email: {$email}\n";
$email_body .= "Service: " . getSubjectLabel($subject) . "\n";
$email_body .= "Date: " . date('Y-m-d H:i:s') . "\n\n";
$email_body .= "Message:\n--------------\n{$message}\n";

$mail_sent = sendEmailViaResend(NOTIFY_EMAIL, $subject_line, $email_body, $email);

// Log submission
$log_file = DATA_DIR . '/contact_log.json';
$log = file_exists($log_file) ? json_decode(file_get_contents($log_file), true) : [];
$log[] = [
    'name' => $name,
    'email' => $email,
    'subject' => $subject,
    'sent' => $mail_sent,
    'created_at' => date('Y-m-d H:i:s')
];
file_put_contents($log_file, json_encode($log, JSON_PRETTY_PRINT));

if ($mail_sent) {
    echo json_encode([
        'success' => true,
        'message' => 'Message sent successfully!'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to send message. Please try again or email directly.'
    ]);
}

function getSubjectLabel($value) {
    $labels = [
        'translation' => 'Document Translation',
        'interpretation' => 'Interpretation Services',
        'legal' => 'Legal / Workers\' Compensation',
        'medical' => 'Medical / Healthcare',
        'other' => 'Other'
    ];
    return $labels[$value] ?? ucfirst($value);
}
