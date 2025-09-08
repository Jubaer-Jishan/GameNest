<?php
header('Content-Type: application/json');  
include 'database.php';  

$data = json_decode(file_get_contents("php://input"), true);

$fullname = $data['fullName'];
$email = $data['email'];
$password = $data['password'];

// Validation
if (!$fullname || !$email || !$password) {
    echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
    exit;
}

// Email check করা
$sql_check = "SELECT * FROM users WHERE email=?";
$stmt = $conn->prepare($sql_check);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows > 0) {
    echo json_encode(['status' => 'error', 'message' => 'Email already exists']);
    exit;
}

// Password হ্যাশ করা
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert new user
$sql_insert = "INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql_insert);
$stmt->bind_param("sss", $fullname, $email, $hashedPassword);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Account created successfully 🎉']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Something went wrong']);
}

$conn->close();
?>
