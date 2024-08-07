<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $password = $_POST['password'];
    $confirmPassword = $_POST['confirmPassword'];

    if ($password !== $confirmPassword) {
        echo "Passwords do not match.";
        exit;
    }

    // Establish database connection
    include_once 'db_config.php';

    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Get form data
    $name = $_POST['name'];
    $phone_number = $_POST['phone_number'];
    $email = $_POST['email'];
    $password = $_POST['password'];

    // Prepare and execute SQL statement
    $sql = "INSERT INTO recruiters (name, phone_number, email, password) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $name, $phone_number, $email, $password);
    $stmt->execute();

    // Close statement and connection
    $stmt->close();
    $conn->close();
    // Redirect to login.php

    header("Location: ..\login.php");
    exit();
}