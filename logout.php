<?php
// logout.php - Simple Logout Handler
session_start();

// Set user offline before logout
if (isset($_SESSION['user_id'])) {
    require_once 'dbConnect.php';
    
    $userId = $_SESSION['user_id'];
    $stmt = $pdo->prepare("UPDATE users SET is_online = 0 WHERE id = ?");
    $stmt->execute([$userId]);
}

// Clear all session data
$_SESSION = array();

// Destroy session cookie
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 42000, '/');
}

// Destroy session
session_destroy();

// Return success
header('Content-Type: application/json');
echo json_encode(['success' => true]);
?>
