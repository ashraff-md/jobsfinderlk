<?php
session_start();
include_once 'db/db_config.php';

// Check if user is logged in
if (!isset($_SESSION['userloggedin'])) {
    header('Location: login.php');
    exit();
}

// Get the user's email from the session
$email = $_SESSION['userloggedin'];

// Fetch user details
$sql = "SELECT first_name, last_name, email, profile_picture FROM recruiters WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

// Handle profile update
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $firstName = $_POST['first_name'] ?? '';
    $lastName = $_POST['last_name'] ?? '';
    $currentPassword = $_POST['current_password'] ?? '';
    $newPassword = $_POST['new_password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';


    // Update profile picture
    if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] == 0) {
        $profilePic = $_FILES['profile_picture'];
        $uniqueName = uniqid('', true) . '.' . pathinfo($profilePic['name'], PATHINFO_EXTENSION);
        $uploadDir = 'profile/';
        $uploadFile = $uploadDir . $uniqueName;

        // Delete the old profile picture if it exists
        if (!empty($user['profile_picture']) && file_exists($uploadDir . $user['profile_picture'])) {
            unlink($uploadDir . $user['profile_picture']);
        }

        // Move the new profile picture to the profile directory
        if (move_uploaded_file($profilePic['tmp_name'], $uploadFile)) {
            // Update the database with the new profile picture filename
            $updatePicSql = "UPDATE recruiters SET profile_picture = ? WHERE email = ?";
            $updatePicStmt = $conn->prepare($updatePicSql);
            $updatePicStmt->bind_param('ss', $uniqueName, $email);
            $updatePicStmt->execute();

            // Refresh user data to include the new profile picture
            $user['profile_picture'] = $uniqueName;
        } else {
            $profileError = "Failed to upload profile picture.";
        }
    }

    // Update profile information
    if ($firstName && $lastName) {
        $updateSql = "UPDATE recruiters SET first_name = ?, last_name = ? WHERE email = ?";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->bind_param('sss', $firstName, $lastName, $email);
        $updateStmt->execute();
    }

    // Change password
    if (!empty($currentPassword) && !empty($newPassword) && !empty($confirmPassword)) {
        $passwordSql = "SELECT password FROM recruiters WHERE email = ?";
        $passwordStmt = $conn->prepare($passwordSql);
        $passwordStmt->bind_param('s', $email);
        $passwordStmt->execute();
        $passwordResult = $passwordStmt->get_result();
        $passwordRow = $passwordResult->fetch_assoc();

        if (password_verify($currentPassword, $passwordRow['password'])) {
            if ($newPassword === $confirmPassword) {
                $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
                $updatePasswordSql = "UPDATE recruiters SET password = ? WHERE email = ?";
                $updatePasswordStmt = $conn->prepare($updatePasswordSql);
                $updatePasswordStmt->bind_param('ss', $hashedPassword, $email);
                $updatePasswordStmt->execute();
                $passwordSuccess = "Password updated successfully.";
            } else {
                $passwordError = "New passwords do not match.";
            }
        } else {
            $passwordError = "Current password is incorrect.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="assets/logo/solo-logo.png">

    <title>Jobs Finder | Edit Profile</title>

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- CSS -->
    <link rel="stylesheet" href="style.css">

    <!-- Poppins Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">

</head>

<body>
    <div class="content-wrapper">
        <!-- Navbar -->
        <?php include_once 'userNavbar.php'; ?>

        <div class="container">
            <h2 class="text-center">Edit Profile</h2>
            <div class="row justify-content-center">
                <!-- Profile picture card-->
                <div class="profilepic text-center mt-4 pe-5 ps-5 pt-5 pb-5">
                    <h3>Profile Picture</h3>
                    <!-- Profile picture image-->
                    <?php
                    $profileImage = !empty($user['profile_picture']) ? 'profile/' . $user['profile_picture'] : 'profile/default.png';
                    ?>
                    <img class="rounded-circle mb-2" style="width: 200px; height: 200px;" src="<?php echo htmlspecialchars($profileImage, ENT_QUOTES, 'UTF-8'); ?>" alt="Profile Picture">
                    <!-- Profile picture help block-->
                    <div class="small font-italic text-muted mb-4">JPG or PNG no larger than 5 MB</div>
                    <!-- Profile picture upload button-->
                    <form method="POST" enctype="multipart/form-data">
                        <input class="form-control mb-3" type="file" name="profile_picture" accept=".jpg, .jpeg, .png">
                        <button class="btn btn-primary" type="submit">Upload new image</button>
                    </form>
                </div>

                <div class="adForm mt-4 pe-5 ps-5 pt-5 pb-5">
                    <form method="POST" enctype="multipart/form-data">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="first_name" class="form-label">First Name</label>
                                <input type="text" class="form-control" id="first_name" name="first_name" value="<?php echo htmlspecialchars($user['first_name'], ENT_QUOTES, 'UTF-8'); ?>" required>
                            </div>
                            <div class="col-md-6">
                                <label for="last_name" class="form-label">Last Name</label>
                                <input type="text" class="form-control" id="last_name" name="last_name" value="<?php echo htmlspecialchars($user['last_name'], ENT_QUOTES, 'UTF-8'); ?>" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="email" name="email" value="<?php echo htmlspecialchars($user['email'], ENT_QUOTES, 'UTF-8'); ?>" readonly>
                        </div>
                        <hr>
                        <h4>Change Password</h4>
                        <div class="mb-3">
                            <label for="current_password" class="form-label">Current Password</label>
                            <input type="password" class="form-control" id="current_password" name="current_password">
                        </div>
                        <div class="mb-3">
                            <label for="new_password" class="form-label">New Password</label>
                            <input type="password" class="form-control" id="new_password" name="new_password">
                        </div>
                        <div class="mb-3">
                            <label for="confirm_password" class="form-label">Confirm New Password</label>
                            <input type="password" class="form-control" id="confirm_password" name="confirm_password">
                        </div>
                        <?php if (isset($passwordError)) {
                            echo "<div class='alert alert-danger'>$passwordError</div>";
                        } ?>
                        <?php if (isset($passwordSuccess)) {
                            echo "<div class='alert alert-success'>$passwordSuccess</div>";
                        } ?>
                        <?php if (isset($profileError)) {
                            echo "<div class='alert alert-danger'>$profileError</div>";
                        } ?>
                        <div class="d-flex justify-content-center">
                            <button type="submit" class="btn btn-primary">Update Profile</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <?php include_once 'footer.php'; ?>
    </div>
</body>

</html>