<?php
header("Access-Control-Allow-Origin: *");  // allow all origins
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include 'dbConnect.php'; // database connection

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fullName = trim($_POST['fullName'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $confirmPassword = trim($_POST['confirmPassword'] ?? '');
    $terms = isset($_POST['terms']) ? 1 : 0;

    // ===== Validation =====
    if (!$fullName || !$email || !$password || !$confirmPassword) {
        echo "All fields required!";
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email format!";
        exit;
    }

    if ($password !== $confirmPassword) {
        echo "Passwords do not match!";
        exit;
    }

    if (!$terms) {
        echo "You must agree to terms!";
        exit;
    }

    // ===== Hash Password =====
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    try {
        // Use same column names as your DB schema (snake_case)
        $stmt = $pdo->prepare("INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)");
        $stmt->execute([$fullName, $email, $hashedPassword]);

        echo "Signup successful!";

    } catch (PDOException $e) {
        // Error code 23000 = duplicate entry (unique key violation)
        if ($e->getCode() == 23000) {
            echo "Email already registered!";
        } else {
            echo "Database error: " . $e->getMessage();
        }
    }
} else {
    http_response_code(405); // Method not allowed
    echo "Invalid request!";
}
?>
