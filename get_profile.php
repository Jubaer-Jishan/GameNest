<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Database connection
require_once 'dbConnect.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    // Get user profile data
    $stmt = $conn->prepare("
        SELECT 
            id,
            full_name,
            email,
            username,
            title,
            bio,
            location,
            member_since,
            favorite_genre,
            level,
            global_rank,
            xp_current,
            xp_next_level,
            current_streak,
            season_rank,
            win_ratio,
            guild_name,
            upcoming_event,
            upcoming_event_date,
            is_online,
            profile_picture,
            created_at
        FROM users 
        WHERE id = ?
    ");
    
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        
        // Calculate XP percentage
        $xpPercentage = 0;
        if ($user['xp_next_level'] > 0) {
            $xpPercentage = ($user['xp_current'] / $user['xp_next_level']) * 100;
        }
        
        // Format member since date
        if ($user['member_since']) {
            $memberDate = new DateTime($user['member_since']);
            $user['member_since_formatted'] = $memberDate->format('F Y');
        }
        
        // Format upcoming event date
        if ($user['upcoming_event_date']) {
            $eventDate = new DateTime($user['upcoming_event_date']);
            $user['upcoming_event_formatted'] = $eventDate->format('M d, Y');
        }
        
        // Add calculated fields
        $user['xp_percentage'] = round($xpPercentage, 2);
        $user['is_online'] = (bool)$user['is_online'];
        
        // Set default profile picture if none
        if (empty($user['profile_picture'])) {
            $user['profile_picture'] = 'https://i.pravatar.cc/300?u=' . $user['id'];
        }
        
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'User not found'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
