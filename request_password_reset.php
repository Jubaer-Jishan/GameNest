<?php
require_once __DIR__ . '/session_bootstrap.php';
gamenest_start_session();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'cors.php';
[$origin] = setupCors([
    'methods' => ['POST', 'OPTIONS'],
    'headers' => ['Content-Type', 'X-Requested-With']
]);
handleCorsPreflight($origin);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$input = $_POST;
if (empty($input)) {
    $raw = file_get_contents('php://input');
    if ($raw) {
        $json = json_decode($raw, true);
        if (is_array($json)) {
            $input = $json;
        }
    }
}

$email = isset($input['email']) ? trim($input['email']) : '';

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => true,
        'message' => 'If that email is registered, we will send reset instructions shortly.'
    ]);
    exit;
}

require_once 'dbConnect.php';

try {
    $pdo->exec('CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        UNIQUE INDEX idx_token_hash (token_hash)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');

    $stmt = $pdo->prepare('SELECT id, email FROM users WHERE email = :email LIMIT 1');
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode([
            'success' => true,
            'message' => 'If that email is registered, we will send reset instructions shortly.'
        ]);
        exit;
    }

    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);
    $expiresAt = (new DateTime('+1 hour'))->format('Y-m-d H:i:s');

    $deleteStmt = $pdo->prepare('DELETE FROM password_resets WHERE user_id = :user_id');
    $deleteStmt->bindParam(':user_id', $user['id'], PDO::PARAM_INT);
    $deleteStmt->execute();

    $insertStmt = $pdo->prepare('INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (:user_id, :token_hash, :expires_at)');
    $insertStmt->bindParam(':user_id', $user['id'], PDO::PARAM_INT);
    $insertStmt->bindParam(':token_hash', $tokenHash, PDO::PARAM_STR);
    $insertStmt->bindParam(':expires_at', $expiresAt, PDO::PARAM_STR);
    $insertStmt->execute();

    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $dir = str_replace('\\', '/', dirname($_SERVER['REQUEST_URI'] ?? ''));
    $dir = ($dir === '.' || $dir === '/') ? '' : trim($dir, '/');
    $relativePath = $dir === '' ? 'reset_password.html' : $dir . '/reset_password.html';
    $resetLink = $scheme . '://' . $host . '/' . $relativePath . '?token=' . urlencode($token);

    // TODO: Integrate email delivery here.

    echo json_encode([
        'success' => true,
        'message' => 'If that email is registered, we will send reset instructions shortly.',
        'reset_link' => $resetLink
    ]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to start password reset process.'
    ]);
    exit;
}
