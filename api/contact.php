<?php
/**
 * FluentLanguage.net - Contact Form API
 * Handles contact form submissions using Resend API
 */

require_once __DIR__ . '/config.php';

// Set CORS and content type
setCorsHeaders();
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Create data directory if needed
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
    exit;
}

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
$rate_limit_file = DATA_DIR . '/contact_rate_limit.json';
$client_ip = $_SERVER['REMOTE_ADDR'];
if (!checkRateLimit($client_ip, $rate_limit_file, 3)) {
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

if (empty($name) || strlen($name) > 200) {
    $errors[] = 'Name is required (max 200 characters)';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Valid email is required';
}

$allowed_subjects = ['translation', 'interpretation', 'legal', 'medical', 'other'];
if (empty($subject) || !in_array($subject, $allowed_subjects, true)) {
    $errors[] = 'Please select a valid subject';
}

if (empty($message) || strlen($message) < 10) {
    $errors[] = 'Message must be at least 10 characters';
}

if (strlen($message) > 5000) {
    $errors[] = 'Message must be under 5000 characters';
}

if (!empty($errors)) {
    echo json_encode([
        'success' => false,
        'message' => implode('. ', $errors)
    ]);
    exit;
}

// Sanitize for logging/email
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

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

// Log submission (with file locking)
$log_file = DATA_DIR . '/contact_log.json';
$log = [];
if (file_exists($log_file)) {
    $fp = fopen($log_file, 'r');
    if ($fp && flock($fp, LOCK_SH)) {
        $log = json_decode(stream_get_contents($fp), true) ?: [];
        flock($fp, LOCK_UN);
    }
    if ($fp) fclose($fp);
}

$log[] = [
    'name' => $name,
    'email' => $email,
    'subject' => $subject,
    'sent' => $mail_sent,
    'created_at' => date('Y-m-d H:i:s')
];

$fp = fopen($log_file, 'c');
if ($fp && flock($fp, LOCK_EX)) {
    ftruncate($fp, 0);
    fwrite($fp, json_encode($log, JSON_PRETTY_PRINT));
    fflush($fp);
    flock($fp, LOCK_UN);
}
if ($fp) fclose($fp);

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
