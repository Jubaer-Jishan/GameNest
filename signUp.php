<?php
include 'dbConnect.php'; // database connection

if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $fullName = trim($_POST['fullName']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $confirmPassword = trim($_POST['confirmPassword']);
    $terms = isset($_POST['terms']) ? 1 : 0;

    // Validation
    if(!$fullName || !$email || !$password || !$confirmPassword){
        echo "All fields required!";
        exit;
    }

    if($password !== $confirmPassword){
        echo "Passwords do not match!";
        exit;
    }

    if(!$terms){
        echo "You must agree to terms!";
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    try{
        $stmt = $pdo->prepare("INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)");
        $stmt->execute([$fullName, $email, $hashedPassword]);
        echo "Signup successful!";
    }catch(PDOException $e){
        if($e->getCode() == 23000) echo "Email already registered!";
        else echo "Database error: " . $e->getMessage();
    }
}else{
    echo "Invalid request!";
}
?>
