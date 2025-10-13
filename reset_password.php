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

$token = isset($input['token']) ? trim($input['token']) : '';
$newPassword = $input['password'] ?? '';

if ($token === '' || $newPassword === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing reset token or password.']);
    exit;
}

if (strlen($newPassword) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters long.']);
    exit;
}

require_once 'dbConnect.php';

try {
    $tokenHash = hash('sha256', $token);

    $stmt = $pdo->prepare('SELECT pr.user_id, pr.expires_at, u.email FROM password_resets pr INNER JOIN users u ON pr.user_id = u.id WHERE pr.token_hash = :token_hash LIMIT 1');
    $stmt->bindParam(':token_hash', $tokenHash, PDO::PARAM_STR);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'This reset link is invalid or has already been used.']);
        exit;
    }

    $expiresAt = DateTime::createFromFormat('Y-m-d H:i:s', $row['expires_at']);
    $now = new DateTime('now');
    if (!$expiresAt || $expiresAt < $now) {
        $deleteStmt = $pdo->prepare('DELETE FROM password_resets WHERE user_id = :user_id');
        $deleteStmt->bindParam(':user_id', $row['user_id'], PDO::PARAM_INT);
        $deleteStmt->execute();

        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'This reset link has expired.']);
        exit;
    }

    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    $updateStmt = $pdo->prepare('UPDATE users SET password = :password WHERE id = :user_id');
    $updateStmt->bindParam(':password', $hashedPassword, PDO::PARAM_STR);
    $updateStmt->bindParam(':user_id', $row['user_id'], PDO::PARAM_INT);
    $updateStmt->execute();

    $cleanupStmt = $pdo->prepare('DELETE FROM password_resets WHERE user_id = :user_id');
    $cleanupStmt->bindParam(':user_id', $row['user_id'], PDO::PARAM_INT);
    $cleanupStmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Your password has been updated. You can now log in with the new password.'
    ]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to reset password at this time.'
    ]);
    exit;
}
