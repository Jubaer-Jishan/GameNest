<?php
session_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Include the database connection file
require_once 'dbConnect.php'; // Ensure the path to dbConnect.php is correct

// Accept form-data or JSON payloads
$input = $_POST;

if (empty($input)) {
    $raw = file_get_contents('php://input');
    if ($raw) {
        $json = json_decode($raw, true);
        if (is_array($json)) {
            $input = $json;
        }
    }
}

// Get the POST data
$email = isset($input['email']) ? trim($input['email']) : '';
$password = $input['password'] ?? '';

// Validate the input
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

try {
    // Check if the user exists in the database
    $stmt = $pdo->prepare("SELECT id, full_name, password FROM users WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        // Login successful
        $_SESSION['user'] = [
            'id' => $user['id'] ?? null,
            'email' => $email,
            'full_name' => $user['full_name'] ?? null,
        ];
        $_SESSION['user_email'] = $email;

        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user['id'] ?? null,
                'email' => $email,
                'full_name' => $user['full_name'] ?? null,
            ],
        ]);
        exit;
    } else {
        // Invalid credentials
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred while processing your request']);
    exit;
}
?>