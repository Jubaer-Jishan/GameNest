<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'dbConnect.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');

// Get bidding games
if ($method === 'GET' && $action === 'getBiddings') {
    $stmt = $pdo->query("SELECT * FROM bidding_games WHERE status = 'active' ORDER BY created_at DESC");
    $biddings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $biddings]);
    exit;
}

// Add bidding game with image upload
if ($method === 'POST' && $action === 'addBidding') {
    $imagePath = null;
    
    // Handle image upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/biddings/';
        $imageExt = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        
        if (in_array($imageExt, $allowedExts)) {
            $imageName = uniqid('bidding_') . '.' . $imageExt;
            $uploadPath = $uploadDir . $imageName;
            
            if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)) {
                $imagePath = $uploadPath;
            }
        }
    }
    
    // If no image uploaded, use default
    if (!$imagePath) {
        $imagePath = 'sliderImage/1.jpeg';
    }
    
    $stmt = $pdo->prepare("INSERT INTO bidding_games (title, image, platform, `condition`, current_bid, min_bid, time_left, status) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, 'active')");
    
    $result = $stmt->execute([
        $_POST['title'],
        $imagePath,
        $_POST['platform'],
        $_POST['condition'],
        $_POST['current_bid'],
        $_POST['min_bid'],
        $_POST['time_left']
    ]);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Bidding game added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add bidding game']);
    }
    exit;
}

// Update bidding game
if ($method === 'POST' && $action === 'updateBidding') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("UPDATE bidding_games 
                          SET title = ?, platform = ?, condition = ?, current_bid = ?, min_bid = ?, time_left = ? 
                          WHERE id = ?");
    
    $result = $stmt->execute([
        $data['title'],
        $data['platform'],
        $data['condition'],
        $data['current_bid'],
        $data['min_bid'],
        $data['time_left'],
        $data['id']
    ]);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Bidding game updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update bidding game']);
    }
    exit;
}

// Delete bidding game
if ($method === 'POST' && $action === 'deleteBidding') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("DELETE FROM bidding_games WHERE id = ?");
    $result = $stmt->execute([$data['id']]);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Bidding game deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete bidding game']);
    }
    exit;
}

// Place bid
if ($method === 'POST' && $action === 'placeBid') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Start transaction
    $pdo->beginTransaction();
    
    try {
        // Update game's current bid
        $stmt = $pdo->prepare("UPDATE bidding_games 
                              SET current_bid = ?, total_bids = total_bids + 1 
                              WHERE id = ?");
        $stmt->execute([$data['bid_amount'], $data['game_id']]);
        
        // Insert bid record
        $stmt = $pdo->prepare("INSERT INTO bids (game_id, user_id, bid_amount) 
                              VALUES (?, ?, ?)");
        $stmt->execute([$data['game_id'], $data['user_id'], $data['bid_amount']]);
        
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Bid placed successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Failed to place bid']);
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid request']);
?>
