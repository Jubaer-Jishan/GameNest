<?php
require_once __DIR__ . '/session_bootstrap.php';
gamenest_start_session();

require_once 'cors.php';
[$origin] = setupCors([
    'methods' => ['POST', 'OPTIONS'],
    'headers' => ['Content-Type', 'X-Requested-With']
]);
handleCorsPreflight($origin);

header('Content-Type: application/json');

require_once 'dbConnect.php';
require_once 'databaseSchemaHelpers.php';

ensureUserRentalsTable($pdo);

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
    echo json_encode(['success' => false, 'error' => 'No rental data provided']);
    exit;
}

$userId = (int)$_SESSION['user_id'];
$gameId = isset($data['game_id']) ? (string)$data['game_id'] : null;
$gameTitle = trim($data['game_title'] ?? '');
$duration = strtolower(trim($data['duration'] ?? 'week'));
$price = isset($data['price']) ? (float)$data['price'] : 0;
$platforms = trim($data['platforms'] ?? '');
$imageUrl = trim($data['image_url'] ?? '');
$status = isset($data['status']) ? strtolower(trim($data['status'])) : 'active';

if ($gameTitle === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Game title is required']);
    exit;
}

if (!in_array($duration, ['week', 'month', 'custom'], true)) {
    $duration = 'custom';
}

if (!in_array($status, ['active', 'completed', 'cancelled'], true)) {
    $status = 'active';
}

try {
    $pdo->beginTransaction();

    $existingId = null;

    if (!empty($gameId)) {
        $checkStmt = $pdo->prepare("SELECT id FROM user_rentals WHERE user_id = ? AND game_id = ? AND status = 'active' LIMIT 1");
        $checkStmt->execute([$userId, $gameId]);
        $existingId = $checkStmt->fetchColumn();
    }

    if ($existingId) {
        $updateStmt = $pdo->prepare(
            "UPDATE user_rentals
             SET duration = ?, price = ?, platforms = ?, image_url = ?, status = ?, updated_at = NOW()
             WHERE id = ?"
        );
        $updateStmt->execute([$duration, $price, $platforms, $imageUrl, $status, $existingId]);
        $recordId = (int)$existingId;
    } else {
        $insertStmt = $pdo->prepare(
            "INSERT INTO user_rentals (user_id, game_id, game_title, duration, price, platforms, image_url, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $insertStmt->execute([$userId, $gameId, $gameTitle, $duration, $price, $platforms, $imageUrl, $status]);
        $recordId = (int)$pdo->lastInsertId();
    }

    $pdo->commit();

    $fetchStmt = $pdo->prepare("SELECT id, game_id, game_title, duration, price, platforms, image_url, status, rented_at, updated_at
                                 FROM user_rentals
                                 WHERE id = ?");
    $fetchStmt->execute([$recordId]);
    $rental = $fetchStmt->fetch(PDO::FETCH_ASSOC);

    if ($rental) {
        $rental['price'] = number_format((float)$rental['price'], 2);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Rental saved successfully',
        'rental' => $rental
    ]);
    exit;
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('record_rental error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to record rental']);
    exit;
}
