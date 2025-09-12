<?php
$servername = "localhost";
$dbname = "gamenestdb"; 
$db_user = "root";      
$db_pass = "";          
try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>
