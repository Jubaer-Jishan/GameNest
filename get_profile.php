<?php
session_start();

require_once 'cors.php';
[$origin] = setupCors([
    'methods' => ['GET', 'OPTIONS'],
    'headers' => ['Content-Type', 'X-Requested-With']
]);
handleCorsPreflight($origin);

header('Content-Type: application/json');

// Database connection
require_once 'dbConnect.php';
require_once 'databaseSchemaHelpers.php';

// Ensure dependent tables exist
ensureUserMediaTable($pdo);
ensureUserRentalsTable($pdo);
ensureUserBidsTable($pdo);

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
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

        // Gather activity metrics
        $activityStatsStmt = $pdo->prepare("SELECT 
                (SELECT COUNT(*) FROM user_rentals WHERE user_id = ?) AS total_rentals,
                (SELECT COUNT(*) FROM user_rentals WHERE user_id = ? AND status = 'active') AS active_rentals,
                (SELECT COUNT(*) FROM user_bids WHERE user_id = ?) AS total_bids,
                (SELECT COUNT(*) FROM user_bids WHERE user_id = ? AND status = 'active') AS active_bids,
                (SELECT COALESCE(SUM(bid_amount), 0) FROM user_bids WHERE user_id = ?) AS total_bid_value
        ");
        $activityStatsStmt->execute([$userId, $userId, $userId, $userId, $userId]);
        $activityStats = $activityStatsStmt->fetch(PDO::FETCH_ASSOC) ?: [];

        // Fetch recent rentals
        $rentalStmt = $pdo->prepare("SELECT id, game_id, game_title, duration, price, platforms, image_url, status, rented_at
                                      FROM user_rentals
                                      WHERE user_id = ?
                                      ORDER BY rented_at DESC
                                      LIMIT 10");
        $rentalStmt->execute([$userId]);
        $rentals = $rentalStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

        foreach ($rentals as &$rental) {
            $rental['rented_at_formatted'] = $rental['rented_at'] ? (new DateTime($rental['rented_at']))->format('M d, Y \a\t h:i A') : null;

            switch ($rental['duration']) {
                case 'month':
                    $rental['duration_label'] = '1 Month';
                    break;
                case 'week':
                    $rental['duration_label'] = '1 Week';
                    break;
                default:
                    $rental['duration_label'] = ucfirst((string)$rental['duration']);
            }

            $rental['display_price'] = number_format((float)$rental['price'], 2);
        }
        unset($rental);

        // Fetch recent bids
        $bidStmt = $pdo->prepare("SELECT id, game_id, game_title, bid_amount, image_url, status, created_at
                                   FROM user_bids
                                   WHERE user_id = ?
                                   ORDER BY created_at DESC
                                   LIMIT 10");
        $bidStmt->execute([$userId]);
        $bids = $bidStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

        foreach ($bids as &$bid) {
            $bid['created_at_formatted'] = $bid['created_at'] ? (new DateTime($bid['created_at']))->format('M d, Y \a\t h:i A') : null;
            $bid['display_amount'] = number_format((float)$bid['bid_amount'], 2);
        }
        unset($bid);

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
        $user['activity_stats'] = [
            'total_rentals'   => isset($activityStats['total_rentals']) ? (int)$activityStats['total_rentals'] : 0,
            'active_rentals'  => isset($activityStats['active_rentals']) ? (int)$activityStats['active_rentals'] : 0,
            'total_bids'      => isset($activityStats['total_bids']) ? (int)$activityStats['total_bids'] : 0,
            'active_bids'     => isset($activityStats['active_bids']) ? (int)$activityStats['active_bids'] : 0,
            'total_bid_value' => isset($activityStats['total_bid_value']) ? (float)$activityStats['total_bid_value'] : 0.0
        ];
        $user['rentals'] = $rentals;
        $user['bids'] = $bids;
        
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
