<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Establish database connection
    include_once 'db_config.php';

    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Get form data
    $first_name = $_POST['first_name'];
    $last_name = $_POST['last_name'];
    $phone_number = $_POST['phone_number'];
    $email = $_POST['email'];
    $password = $_POST['password'];

    // Hash the password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Prepare and execute SQL statement
    $sql = "INSERT INTO recruiters (first_name, last_name, phone_number, email, password) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $first_name, $last_name, $phone_number, $email, $hashed_password);
    $stmt->execute();

    // Close statement and connection
    $stmt->close();
    $conn->close();

    // Redirect to login.php
    header("Location: ..\login.php");
    exit();
}
