<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Check if user is logged in
if (isset($_SESSION['user']) && !empty($_SESSION['user'])) {
    $user = $_SESSION['user'];
    
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['id'] ?? null,
            'email' => $user['email'] ?? '',
            'full_name' => $user['full_name'] ?? 'Guest User',
        ]
    ]);
} else {
    // No user logged in
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Not logged in',
        'user' => null
    ]);
}
?>
