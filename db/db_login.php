<?php
session_start();
include_once 'db_config.php';

$uname = $_POST['email'];
$pass = $_POST['password'];
$table_name = $_POST['table_name']; // Retrieve the table name from the form

// Prepare and execute the SQL query to fetch the user details
$conn = new mysqli($servername, $username, $password, $dbname);
$stmt = $conn->prepare("SELECT * FROM $table_name WHERE email = ?");
$stmt->bind_param("s", $uname);
$stmt->execute();
$result = $stmt->get_result();

// Check if the user exists
if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        // Verify the password
        if ($user['password'] === $pass) {
                // Store user information in session
                $_SESSION['userloggedin'] = $uname;
                $_SESSION['userid'] = $user['id'];

                // Redirect based on table name
                if ($table_name === "recruiters") {
                        header("Location: ../dashboard.php");
                } elseif ($table_name === "admins") {
                        header("Location: ../admin/dashboard.php");
                } else {
                        header("Location: ../login.php?error");
                }
                exit();
        } else {
                // Invalid password
                header("Location: ../login.php?error");
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
