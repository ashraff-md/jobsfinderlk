<?php
session_start();

// Destroy all sessions
session_destroy();

// Redirect to the login.php
header('Location: ..\login.php');
exit;
?>