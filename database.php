<?php
  $conn = mysqli_connect("localhost", "root", '', 'gamenestdb');
 
    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }
 
    $sql = "CREATE DATABASE IF NOT EXISTS " . 'gamenestdb';
    if ($conn->query($sql) === TRUE) {
        echo "Database created successfully<br>";
    } else {
        die("Error creating database: " . $conn->error);
    }
