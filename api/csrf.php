<?php
/**
 * FluentLanguage.net - CSRF Token Endpoint
 * Returns a CSRF token for form submissions
 */

require_once __DIR__ . '/config.php';

setCorsHeaders();
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    http_response_code(204);
    exit;
}

$token = generateCsrfToken();

echo json_encode(['token' => $token]);
