<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'dbConnect.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');

// Get rental games
if ($method === 'GET' && $action === 'getRentals') {
    $stmt = $pdo->query("SELECT * FROM rental_games ORDER BY created_at DESC");
    $rentals = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $rentals]);
    exit;
}

// Add rental game with image upload
if ($method === 'POST' && $action === 'addRental') {
    // Basic validation – make sure required fields exist
    $required = ['title', 'weekly_price', 'monthly_price'];
    foreach ($required as $field) {
        if (!isset($_POST[$field]) || $_POST[$field] === '') {
            echo json_encode(['success' => false, 'message' => 'Missing field: ' . $field]);
            exit;
        }
    }

    $title         = trim($_POST['title']);
    $platformsRaw  = isset($_POST['platforms']) ? $_POST['platforms'] : '';
    $weeklyPrice   = $_POST['weekly_price'];
    $monthlyPrice  = $_POST['monthly_price'];

    // Ensure upload directory exists
    $uploadDir = 'uploads/rentals/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $imagePath = null;
    $uploadError = null;

    if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
        if ($_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imageExt = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
            $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

            if (!in_array($imageExt, $allowedExts)) {
                echo json_encode(['success' => false, 'message' => 'Unsupported image type.']);
                exit;
            }

            $imageName = uniqid('rental_', true) . '.' . $imageExt;
            $uploadPath = $uploadDir . $imageName;

            if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)) {
                $imagePath = $uploadPath;
            } else {
                $uploadError = 'Unable to save uploaded image.';
            }
        } else {
            $uploadError = 'Image upload error code: ' . $_FILES['image']['error'];
        }
    }

    if ($uploadError) {
        echo json_encode(['success' => false, 'message' => $uploadError]);
        exit;
    }

    if (!$imagePath) {
        $imagePath = 'sliderImage/1.jpeg';
    }

    $stmt = $pdo->prepare("INSERT INTO rental_games (title, image, platforms, weekly_price, monthly_price) 
                          VALUES (?, ?, ?, ?, ?)");

    $result = $stmt->execute([
        $title,
        $imagePath,
        $platformsRaw,
        $weeklyPrice,
        $monthlyPrice
    ]);

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Rental game added successfully']);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to add rental game',
            'error'   => $stmt->errorInfo()
        ]);
    }
    exit;
}

// Update rental game
if ($method === 'POST' && $action === 'updateRental') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("UPDATE rental_games 
                          SET title = ?, platforms = ?, weekly_price = ?, monthly_price = ? 
                          WHERE id = ?");
    
    $platforms = is_array($data['platforms']) ? implode(',', $data['platforms']) : $data['platforms'];
    
    $result = $stmt->execute([
        $data['title'],
        $platforms,
        $data['weekly_price'],
        $data['monthly_price'],
        $data['id']
    ]);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Rental game updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update rental game']);
    }
    exit;
}

// Delete rental game
if ($method === 'POST' && $action === 'deleteRental') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("DELETE FROM rental_games WHERE id = ?");
    $result = $stmt->execute([$data['id']]);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Rental game deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete rental game']);
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid request']);
?>
