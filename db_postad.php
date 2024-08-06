<?php
// Establish a connection to your database
include_once 'db_config.php';

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve form data
    $jobTitle = $_POST['job-title'];
    $companyName = $_POST['company_name'];
    $jobCategory = $_POST['category_name'];
    $employmentType = $_POST['employment_type'];
    $location = $_POST['location_name'];
    $jobDescription = $_POST['job_description'];
    $qualification = $_POST['qualification'];
    $experienceLevel = $_POST['experience_level'];
    $workArrangement = $_POST['work_arrangement'];
    $applicationDeadline = $_POST['application_deadline'];
    $salaryRange = $_POST['salary'];
    $isSponsored = isset($_POST['is_sponsored']) ? 1 : 0;

    // Handle file upload
    $companyLogo = $_FILES['company-logo']['name'];
    $targetDir = "uploads/";
    $targetFile = $targetDir . basename($companyLogo);
    move_uploaded_file($_FILES['company-logo']['tmp_name'], $targetFile);

    // Insert the data into the job_vacancies table
    $sql = "INSERT INTO job_ads (job_title, company_name, company_logo, job_category_id, employment_type_id, location_id, job_description, qualification_id, experience_level_id, work_arrangement_id, application_deadline, salary_range, is_sponsored)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssiiissiissi", $jobTitle, $companyName, $companyLogo, $jobCategory, $employmentType, $location, $jobDescription, $qualification, $experienceLevel, $workArrangement, $applicationDeadline, $salaryRange, $isSponsored);

    if ($stmt->execute()) {
        echo "New vacancy posted successfully";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
}
?>