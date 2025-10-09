<?php
// Check if the request is valid (e.g., via POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the email and password from the POST request
    $email = $_POST['email'] ?? null;
    $password = $_POST['password'] ?? null;

    if ($email && $password) {
        // Store email and password in a cookie as JSON
        $cookieValue = json_encode(['email' => $email, 'password' => $password]);
        setcookie('rememberMe', $cookieValue, time() + (7 * 24 * 60 * 60), "/"); // Expires in 7 days

        // Return a success response
        echo json_encode(['status' => 'success', 'message' => 'Cookie set successfully']);
    } else {
        // Missing email or password
        http_response_code(400); // Bad Request
        echo json_encode(['status' => 'error', 'message' => 'Email and password are required']);
    }
} else {
    // Invalid request method
    http_response_code(405); // Method Not Allowed
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>