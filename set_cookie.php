<?php

require_once 'cors.php';
[$origin] = setupCors([
    'methods' => ['POST', 'OPTIONS'],
    'headers' => ['Content-Type', 'X-Requested-With']
]);
handleCorsPreflight($origin);

header('Content-Type: application/json');

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
    exit;
}

// Read JSON payload
$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid payload']);
    exit;
}

$remember = !empty($payload['remember']);
$email = isset($payload['email']) ? trim($payload['email']) : '';
// accept password when supplied (note: storing plaintext passwords in cookies is insecure)
$password = isset($payload['password']) ? $payload['password'] : '';

// Set or clear cookie
if ($remember && $email) {
    // Store as JSON so client can parse both email and password
    $cookieValue = json_encode(['email' => $email, 'password' => $password]);
    setcookie('rememberMe', $cookieValue, [
        'expires' => time() + (30 * 24 * 60 * 60), // 30 days
        'path' => '/',
        'secure' => false,    // true if using HTTPS
        'httponly' => false,  // must be readable by JS to autofill
        'samesite' => 'Lax',
    ]);
    echo json_encode(['status' => 'success', 'message' => 'Remember me enabled']);
    exit;
} else {
    // clear cookie
    setcookie('rememberMe', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'secure' => false,
        'httponly' => false,
        'samesite' => 'Lax',
    ]);
    echo json_encode(['status' => 'success', 'message' => 'Remember me cleared']);
    exit;
}
?>
