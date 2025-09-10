<?php
$servername = "localhost";
$dbname = "gamenestdb"; // এখন তোমার database name
$db_user = "root";       // XAMPP default username
$db_pass = "";           // XAMPP default password

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>
