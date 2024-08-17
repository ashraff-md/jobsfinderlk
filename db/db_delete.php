<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['userloggedin'])) {
    // Redirect to login page if not logged in
    header('Location: ../index.php');
    exit();
}

// Include database connection
include_once 'db_config.php';

// Check if an ID is provided
if (!isset($_GET['id']) || empty($_GET['id'])) {
    // Redirect to dashboard or show an error if ID is not provided
    header('Location: ../dashboard.php?error=id_error');
    exit();
}

$id = intval($_GET['id']);

// Check if the ID exists in the database and if the logged-in user is the owner
$sql = "SELECT recruiter_id FROM job_ads WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    // Item not found
    header('Location: ../dashboard.php?error=not_found');
    exit();
}

$row = $result->fetch_assoc();
if ($row['recruiter_id'] !== $_SESSION['userid']) {
    // User does not have permission to delete this item
    header('Location: ../dashboard.php?error=unauthorized');
    exit();
}

// Proceed to delete the item
$sql = "DELETE FROM job_ads WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
if ($stmt->execute()) {
    // Redirect to dashboard with success message
    header('Location: ../dashboard.php?success=deleted');
} else {
    // Redirect to dashboard with error message
    header('Location: ../dashboard.php?error=delete_failed');
}

$stmt->close();
$conn->close();
exit();
?>
