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

// Database connection
require_once 'dbConnect.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

$userId = $_SESSION['user_id'];

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['stat_type'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
    exit;
}

try {
    $statType = $input['stat_type'];
    
    // Handle different stat updates
    switch ($statType) {
        case 'add_xp':
            $xpToAdd = isset($input['xp_amount']) ? (int)$input['xp_amount'] : 0;
            
            // Get current stats
            $stmt = $pdo->prepare("SELECT xp_current, xp_next_level, level FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $newXP = $stats['xp_current'] + $xpToAdd;
            $newLevel = $stats['level'];
            $oldLevel = $newLevel;
            
            // Check for level up
            while ($newXP >= $stats['xp_next_level']) {
                $newXP -= $stats['xp_next_level'];
                $newLevel++;
                $stats['xp_next_level'] = $newLevel * 1000; // Simple progression
            }
            
            $updateStmt = $pdo->prepare("UPDATE users SET xp_current = ?, level = ?, xp_next_level = ? WHERE id = ?");
            $updateStmt->execute([$newXP, $newLevel, $stats['xp_next_level'], $userId]);
            
            echo json_encode([
                'success' => true,
                'message' => 'XP added successfully',
                'leveled_up' => $newLevel > $oldLevel,
                'old_level' => $oldLevel,
                'new_level' => $newLevel,
                'xp_current' => $newXP,
                'xp_next_level' => $stats['xp_next_level']
            ]);
            break;
            
        case 'update_streak':
            $newStreak = isset($input['streak']) ? (int)$input['streak'] : 0;
            
            $stmt = $pdo->prepare("UPDATE users SET current_streak = ? WHERE id = ?");
            $stmt->execute([$newStreak, $userId]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Streak updated',
                'current_streak' => $newStreak
            ]);
            break;
            
        case 'update_rank':
            $newRank = isset($input['rank']) ? (int)$input['rank'] : null;
            
            $stmt = $pdo->prepare("UPDATE users SET global_rank = ? WHERE id = ?");
            $stmt->execute([$newRank, $userId]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Rank updated',
                'global_rank' => $newRank
            ]);
            break;
            
        case 'join_guild':
            $guildName = isset($input['guild_name']) ? $input['guild_name'] : null;
            
            $stmt = $pdo->prepare("UPDATE users SET guild_name = ? WHERE id = ?");
            $stmt->execute([$guildName, $userId]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Guild updated',
                'guild_name' => $guildName
            ]);
            break;
            
        case 'set_online':
            $isOnline = isset($input['is_online']) ? (int)(bool)$input['is_online'] : 0;
            
            $stmt = $pdo->prepare("UPDATE users SET is_online = ? WHERE id = ?");
            $stmt->execute([$isOnline, $userId]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Online status updated',
                'is_online' => (bool)$isOnline
            ]);
            break;
            
        default:
            echo json_encode(['success' => false, 'error' => 'Invalid stat type']);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
