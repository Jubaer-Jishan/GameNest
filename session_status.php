<?php
session_start();

require_once 'cors.php';
[$origin] = setupCors([
    'methods' => ['GET', 'POST', 'OPTIONS'],
    'headers' => ['Content-Type', 'X-Requested-With']
]);
handleCorsPreflight($origin);

header('Content-Type: application/json');

if (!empty($_SESSION['user']) && isset($_SESSION['user_id'])) {
    $user = $_SESSION['user'];
    $user['id'] = $_SESSION['user_id'];

    echo json_encode([
        'authenticated' => true,
        'user' => [
            'id' => $user['id'] ?? null,
            'email' => $user['email'] ?? ($_SESSION['user_email'] ?? null),
            'full_name' => $user['full_name'] ?? null
        ]
    ]);
    exit;
}

echo json_encode([
    'authenticated' => false
]);
