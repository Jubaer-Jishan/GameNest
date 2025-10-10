
<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);


header("Access-Control-Allow-Origin: *");  // allow all origins
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include 'dbConnect.php'; // database connection

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fullName = trim($_POST['fullName'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $confirmPassword = trim($_POST['confirmPassword'] ?? '');
    $terms = isset($_POST['terms']) ? 1 : 0;

    // ===== Validation =====
    if (!$fullName || !$email || !$password || !$confirmPassword) {
        echo json_encode(['success' => false, 'message' => 'All fields are required!']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email format!']);
        exit;
    }

    if ($password !== $confirmPassword) {
        echo json_encode(['success' => false, 'message' => 'Passwords do not match!']);
        exit;
    }

    if (!$terms) {
        echo json_encode(['success' => false, 'message' => 'You must agree to terms!']);
        exit;
    }

    // ===== Hash Password =====
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    try {
        // Use same column names as your DB schema (snake_case)
        $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)");
        $stmt->execute([$fullName, $email, $hashedPassword]);

        echo json_encode([
            'success' => true,
            'message' => 'Registration successful! You can now log in.'
        ]);

    } catch (PDOException $e) {
        // Error code 23000 = duplicate entry (unique key violation)
        if ($e->getCode() == 23000) {
            echo json_encode(['success' => false, 'message' => 'Email already registered!']);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ]);
        }
    }
} else {
    http_response_code(405); // Method not allowed
    echo json_encode(['success' => false, 'message' => 'Invalid request!']);
}
?>
