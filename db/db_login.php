<?php
session_start();
include_once 'db_config.php';

$uname = $_POST['email'];
$pass = $_POST['password'];

// Prepare and execute the SQL query to fetch the user details
$conn = new mysqli($servername, $username, $password, $dbname);
$stmt = $conn->prepare("SELECT * FROM recruiters WHERE email = ?");
$stmt->bind_param("s", $uname);
$stmt->execute();
$result = $stmt->get_result();

// Check if the user exists
if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        // Verify the password
        if ($user['password'] === $pass) {
                // Redirect to the desired page
                $_SESSION['userloggedin'] = $uname;
                header("Location: ..\dashboard.php");
                exit();
        } else {
                // Invalid password
                header("Location: login.php?error");
                exit();
        }
} else {
        // Invalid email or user does not exist
        header("Location: login.php?error");
        exit();
}

// Close the database connection
$stmt->close();
$conn->close();
