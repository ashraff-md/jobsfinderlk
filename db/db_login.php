<?php
session_start();
include_once 'db_config.php';

$uname = $_POST['email'];
$pass = $_POST['password'];
$table_name = $_POST['table_name']; // Retrieve the table name from the form

// Establish database connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
}

// Prepare and execute the SQL query to fetch the user details
$sql = "SELECT * FROM $table_name WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $uname);
$stmt->execute();
$result = $stmt->get_result();

// Check if the user exists
if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        // Verify the password
        if (password_verify($pass, $user['password'])) {
                // Store user information in session based on table name
                $_SESSION['userid'] = $user['id'];

                if ($table_name === "recruiters") {
                        $_SESSION['userloggedin'] = $uname;
                        header("Location: ../dashboard.php");
                } elseif ($table_name === "admins") {
                        $_SESSION['adminloggedin'] = $uname;
                        header("Location: ../admin/dashboard.php");
                } else {
                        header("Location: ../login.php?error");
                }
                exit();
        } else {
                // Invalid password, redirect based on table name
                if ($table_name === "recruiters") {
                        header("Location: ../login.php?error");
                } elseif ($table_name === "admins") {
                        header("Location: ../admin/login.php?error");
                } else {
                        header("Location: ../login.php?error");
                }
                exit();
        }
} else {
        // Invalid email or user does not exist
        header("Location: ../login.php?error");
        exit();
}

// Close the database connection
$stmt->close();
$conn->close();
