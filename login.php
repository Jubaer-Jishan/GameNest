<?php
// Include the database connection file
require_once 'dbConnect.php'; // Ensure the path to dbConnect.php is correct

// Get the POST data
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

// Validate the input
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

try {
    // Check if the user exists in the database
    $stmt = $pdo->prepare("SELECT password FROM users WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        // Login successful
        echo json_encode(['success' => true, 'message' => 'Login successful']);
    } else {
        // Invalid credentials
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred while processing your request']);
}
?>