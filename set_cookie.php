<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid payload']);
    exit;
}

$remember = !empty($payload['remember']);
$email = isset($payload['email']) ? trim($payload['email']) : '';

if ($remember) {
    if (empty($email)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Email is required to remember the user']);
        exit;
    }

    $cookieValue = json_encode(['email' => $email]);
    setcookie('rememberMe', $cookieValue, [
        'expires' => time() + (7 * 24 * 60 * 60),
        'path' => '/',
        'secure' => false,
        'httponly' => false,
        'samesite' => 'Lax',
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Remember me enabled']);
    exit;
}

setcookie('rememberMe', '', [
    'expires' => time() - 3600,
    'path' => '/',
    'secure' => false,
    'httponly' => false,
    'samesite' => 'Lax',
]);

echo json_encode(['status' => 'success', 'message' => 'Remember me cleared']);
?>