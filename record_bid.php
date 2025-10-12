<?php
session_start();

require_once 'cors.php';
[$origin] = setupCors([
    'methods' => ['POST', 'OPTIONS'],
    'headers' => ['Content-Type', 'X-Requested-With']
]);
handleCorsPreflight($origin);

header('Content-Type: application/json');

require_once 'dbConnect.php';
require_once 'databaseSchemaHelpers.php';

ensureUserBidsTable($pdo);

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = [];

if (!empty($_POST)) {
    $data = $_POST;
} elseif (!empty($rawInput)) {
    $json = json_decode($rawInput, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        $data = $json;
    }
}

if (empty($data)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'No bid data provided']);
    exit;
}

$userId = (int)$_SESSION['user_id'];
$gameId = isset($data['game_id']) ? (string)$data['game_id'] : null;
$gameTitle = trim($data['game_title'] ?? '');
$bidAmount = isset($data['bid_amount']) ? (float)$data['bid_amount'] : 0;
$imageUrl = trim($data['image_url'] ?? '');
$status = isset($data['status']) ? strtolower(trim($data['status'])) : 'active';

if ($gameTitle === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Game title is required']);
    exit;
}

if ($bidAmount <= 0) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Bid amount must be greater than zero']);
    exit;
}

if (!in_array($status, ['active', 'won', 'lost', 'cancelled'], true)) {
    $status = 'active';
}

try {
    $pdo->beginTransaction();

    $insertStmt = $pdo->prepare(
        "INSERT INTO user_bids (user_id, game_id, game_title, bid_amount, image_url, status)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    $insertStmt->execute([$userId, $gameId, $gameTitle, $bidAmount, $imageUrl, $status]);
    $recordId = (int)$pdo->lastInsertId();

    $pdo->commit();

    $fetchStmt = $pdo->prepare("SELECT id, game_id, game_title, bid_amount, image_url, status, created_at
                                 FROM user_bids WHERE id = ?");
    $fetchStmt->execute([$recordId]);
    $bid = $fetchStmt->fetch(PDO::FETCH_ASSOC);

    if ($bid) {
        $bid['bid_amount'] = number_format((float)$bid['bid_amount'], 2);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Bid recorded successfully',
        'bid' => $bid
    ]);
    exit;
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('record_bid error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to record bid']);
    exit;
}
