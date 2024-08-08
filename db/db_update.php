<?php
session_start();
if (!isset($_SESSION['userloggedin'])) {
    header('Location: ../login.php');
    exit();
}
include_once 'db_config.php';

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $job_id = (int)$_POST['job_id']; // The ID of the job ad to update
    $job_title = $_POST['job_title'] ?? '';
    $company_name = $_POST['company_name'] ?? '';
    $category_id = (int)$_POST['job_category_id'] ?? 0;
    $employment_type_id = (int)$_POST['employment_type_id'] ?? 0;
    $location_id = (int)$_POST['location_id'] ?? 0;
    $job_description = $_POST['job_description'] ?? '';
    $qualification_id = (int)$_POST['qualification_id'] ?? 0;
    $experience_level_id = (int)$_POST['experience_level_id'] ?? 0;
    $work_arrangement_id = (int)$_POST['work_arrangement_id'] ?? 0;
    $applyto = $_POST['applyto'] ?? '';
    $application_deadline = $_POST['application_deadline'] ?? '';
    $salary = $_POST['salary'] ?? '';
    $recruiter_id = (int)$_SESSION['userid'];
    $isSponsored = isset($_POST['is_sponsored']) ? 1 : 0;

    // Check if a new file is uploaded
    if (isset($_FILES['company_logo']['name']) && !empty($_FILES['company_logo']['name'])) {
        $companyLogo = $_FILES['company_logo']['name'];
        $targetDir = "../uploads/";
        $targetFile = $targetDir . basename($companyLogo);

        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        if (move_uploaded_file($_FILES['company_logo']['tmp_name'], $targetFile)) {
            $sql = "UPDATE job_ads SET 
                        job_title = ?, 
                        company_name = ?, 
                        company_logo = ?, 
                        job_category_id = ?, 
                        employment_type_id = ?, 
                        location_id = ?, 
                        job_description = ?, 
                        qualification_id = ?, 
                        experience_id = ?, 
                        work_arrangement_id = ?, 
                        applyto = ?, 
                        application_deadline = ?, 
                        salary = ?, 
                        is_sponsored = ?
                    WHERE id = ? AND recruiter_id = ?";

            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sssiiisssissiiii", $job_title, $company_name, $companyLogo, $category_id, $employment_type_id, $location_id, $job_description, $qualification_id, $experience_level_id, $work_arrangement_id, $applyto, $application_deadline, $salary, $recruiter_id, $isSponsored, $job_id, $recruiter_id);
        } else {
            echo "Error uploading file.";
            exit();
        }
    } else {
        // If no new file is uploaded, keep the old one
        $sql = "UPDATE job_ads SET 
                    job_title = ?, 
                    company_name = ?, 
                    job_category_id = ?, 
                    employment_type_id = ?, 
                    location_id = ?, 
                    job_description = ?, 
                    qualification_id = ?, 
                    experience_id = ?, 
                    work_arrangement_id = ?, 
                    applyto = ?, 
                    application_deadline = ?, 
                    salary = ?, 
                    is_sponsored = ?
                WHERE id = ? AND recruiter_id = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssiiisssissiiii", $job_title, $company_name, $category_id, $employment_type_id, $location_id, $job_description, $qualification_id, $experience_level_id, $work_arrangement_id, $applyto, $application_deadline, $salary, $recruiter_id, $isSponsored, $job_id, $recruiter_id);
    }

    if ($stmt->execute()) {
        header('Location: ../dashboard.php');
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
}