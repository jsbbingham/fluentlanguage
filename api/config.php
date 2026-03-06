<?php
/**
 * FluentLanguage.net - Shared Configuration
 *
 * IMPORTANT: On the server, create /home/fluentl/config/env.php with:
 *   <?php
 *   define('RESEND_API_KEY', 'your-new-api-key-here');
 *   define('NOTIFY_EMAIL', 'ibingham@compuprotech.com');
 *
 * That file lives OUTSIDE the web root and is never committed to git.
 */

// Secure session cookie configuration — must be set before session_start()
ini_set('session.cookie_secure', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.use_strict_mode', '1');

// Load secrets from server config (outside web root)
$env_file = '/home/fluentl/config/env.php';
if (file_exists($env_file)) {
    require_once $env_file;
} else {
    // Fallback: check environment variables (e.g., set in Apache or .env)
    if (getenv('RESEND_API_KEY')) {
        define('RESEND_API_KEY', getenv('RESEND_API_KEY'));
    }
    if (getenv('NOTIFY_EMAIL')) {
        define('NOTIFY_EMAIL', getenv('NOTIFY_EMAIL'));
    }
}

// Validate required config
if (!defined('RESEND_API_KEY') || !defined('NOTIFY_EMAIL')) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server configuration error.']);
    error_log('FluentLanguage: Missing RESEND_API_KEY or NOTIFY_EMAIL. Create /home/fluentl/config/env.php');
    exit;
}

// Non-secret constants
define('DATA_DIR', '/home/fluentl/data');
define('RESEND_API_URL', 'https://api.resend.com/emails');

// CORS helper - restrict to allowed origins
function setCorsHeaders() {
    $allowed_origins = [
        'https://fluentlanguage.net',
        'https://www.fluentlanguage.net',
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowed_origins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }
}

// Shared email function
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
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        error_log('FluentLanguage Resend API error: ' . $error);
    }

    return $httpCode >= 200 && $httpCode < 300;
}

// Shared rate limiting with file locking
function checkRateLimit($ip, $file, $max = 3, $window = 3600) {
    $now = time();

    // Read with shared lock
    $data = [];
    if (file_exists($file)) {
        $fp = fopen($file, 'r');
        if ($fp && flock($fp, LOCK_SH)) {
            $contents = stream_get_contents($fp);
            $data = json_decode($contents, true) ?: [];
            flock($fp, LOCK_UN);
        }
        if ($fp) fclose($fp);
    }

    // Clean old entries for this IP
    if (!isset($data[$ip])) {
        $data[$ip] = [];
    }
    $data[$ip] = array_values(array_filter($data[$ip], function($ts) use ($now, $window) {
        return ($now - $ts) < $window;
    }));

    if (count($data[$ip]) >= $max) {
        return false;
    }

    // Record and write with exclusive lock
    $data[$ip][] = $now;
    $fp = fopen($file, 'c');
    if ($fp && flock($fp, LOCK_EX)) {
        ftruncate($fp, 0);
        fwrite($fp, json_encode($data));
        fflush($fp);
        flock($fp, LOCK_UN);
    }
    if ($fp) fclose($fp);

    return true;
}

// CSRF token helpers
function generateCsrfToken() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCsrfToken($token) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
