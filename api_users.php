<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once 'dbConnect.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($method === 'GET' && $action === 'getUsers') {
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';

    try {
        if ($search !== '') {
            $like = '%' . $search . '%';
            $stmt = $pdo->prepare(
                "SELECT id, username, full_name, email, level, member_since, is_online, created_at
                 FROM users
                 WHERE (username LIKE :term OR email LIKE :term OR full_name LIKE :term)
                 ORDER BY created_at DESC"
            );
            $stmt->bindValue(':term', $like, PDO::PARAM_STR);
            $stmt->execute();
        } else {
            $stmt = $pdo->query(
                "SELECT id, username, full_name, email, level, member_since, is_online, created_at
                 FROM users
                 ORDER BY created_at DESC"
            );
        }

        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($users as &$user) {
            $user['is_online'] = isset($user['is_online']) ? (bool)$user['is_online'] : false;
        }
        unset($user);
        $totalStmt = $pdo->query('SELECT COUNT(*) AS total_users FROM users');
        $totals = $totalStmt->fetch(PDO::FETCH_ASSOC) ?: ['total_users' => 0];

        echo json_encode([
            'success' => true,
            'data' => $users,
            'total_users' => (int)$totals['total_users']
        ]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch users'
        ]);
        exit;
    }
}

if ($method === 'GET' && $action === 'getStats') {
    try {
        $stmt = $pdo->query('SELECT COUNT(*) AS total_users FROM users');
        $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: ['total_users' => 0];

        echo json_encode([
            'success' => true,
            'total_users' => (int)$row['total_users']
        ]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch user stats'
        ]);
        exit;
    }
}

echo json_encode([
    'success' => false,
    'message' => 'Invalid request'
]);
