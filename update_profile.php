<?php
session_start();
header('Content-Type: application/json');

// Database connection
require_once 'dbConnect.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

$userId = $_SESSION['user_id'];

// Handle both JSON and FormData
$input = [];
$isFileUpload = false;

// Check if it's a file upload (only profile picture)
if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] === UPLOAD_ERR_OK) {
    $isFileUpload = true;
    // File upload only, no other data required
} elseif (!empty($_POST)) {
    // Form data with possible file upload
    $input = $_POST;
} else {
    // Try JSON input
    $json = json_decode(file_get_contents('php://input'), true);
    if ($json) {
        $input = $json;
    }
}

// Only check for input if it's not a file-only upload
if (empty($input) && !$isFileUpload) {
    echo json_encode(['success' => false, 'error' => 'No data provided']);
    exit;
}

try {
    // Build dynamic update query based on provided fields
    $allowedFields = [
        'full_name',
        'username',
        'title',
        'bio',
        'location',
        'favorite_genre'
    ];
    
    $updateFields = [];
    $params = [];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field]) && trim($input[$field]) !== '') {
            $updateFields[] = "$field = ?";
            $params[] = trim($input[$field]);
        }
    }
    
    // Handle profile picture upload
    $profilePicturePath = null;
    
    if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['profile_picture'];
        $uploadDir = 'uploads/profile_pictures/';
        
        // Create directory if it doesn't exist
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        $fileType = mime_content_type($file['tmp_name']);
        
        if (!in_array($fileType, $allowedTypes)) {
            echo json_encode(['success' => false, 'error' => 'Invalid file type. Only JPG, PNG, GIF, WEBP allowed']);
            exit;
        }
        
        // Validate file size (max 5MB)
        if ($file['size'] > 5 * 1024 * 1024) {
            echo json_encode(['success' => false, 'error' => 'File too large. Max 5MB allowed']);
            exit;
        }
        
        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'user_' . $userId . '_' . time() . '.' . $extension;
        $filepath = $uploadDir . $filename;
        
        // Move uploaded file
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            $profilePicturePath = $filepath;
            
            // Delete old profile picture if exists
            $oldPicStmt = $pdo->prepare("SELECT profile_picture FROM users WHERE id = ?");
            $oldPicStmt->execute([$userId]);
            $oldPic = $oldPicStmt->fetchColumn();
            
            if ($oldPic && file_exists($oldPic) && strpos($oldPic, 'uploads/') === 0) {
                @unlink($oldPic);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to upload file']);
            exit;
        }
    }
    
    // Add profile picture to update if uploaded
    if ($profilePicturePath) {
        $updateFields[] = "profile_picture = ?";
        $params[] = $profilePicturePath;
    }
    
    if (empty($updateFields)) {
        echo json_encode(['success' => false, 'error' => 'No fields to update']);
        exit;
    }
    
    // Add user ID to params
    $params[] = $userId;
    
    // Build and execute query
    $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    
    if ($stmt->execute($params)) {
        // Get updated user data
        $getStmt = $pdo->prepare("
            SELECT 
                id, full_name, email, username, title, bio, location,
                member_since, favorite_genre, level, global_rank,
                xp_current, xp_next_level, current_streak, season_rank,
                win_ratio, guild_name, upcoming_event, upcoming_event_date,
                is_online, profile_picture
            FROM users 
            WHERE id = ?
        ");
        $getStmt->execute([$userId]);
        $user = $getStmt->fetch(PDO::FETCH_ASSOC);
        
        // Format dates
        if ($user['member_since']) {
            $memberDate = new DateTime($user['member_since']);
            $user['member_since_formatted'] = $memberDate->format('F Y');
        }
        
        if ($user['upcoming_event_date']) {
            $eventDate = new DateTime($user['upcoming_event_date']);
            $user['upcoming_event_formatted'] = $eventDate->format('M d, Y');
        }
        
        // Calculate XP percentage
        $xpPercentage = 0;
        if ($user['xp_next_level'] > 0) {
            $xpPercentage = ($user['xp_current'] / $user['xp_next_level']) * 100;
        }
        $user['xp_percentage'] = round($xpPercentage, 2);
        
        // Set default profile picture if none
        if (empty($user['profile_picture'])) {
            $user['profile_picture'] = 'https://i.pravatar.cc/300?u=' . $user['id'];
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Failed to update profile'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
