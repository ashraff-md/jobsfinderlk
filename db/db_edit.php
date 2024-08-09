<!doctype html>
<html lang="en">

<?php
session_start();
if (!isset($_SESSION['userloggedin'])) {
    header('Location: login.php');
    exit();
}

include_once 'db_config.php';

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$id = $_GET['id'] ?? 0;
$id = (int)$id;

// Fetch the current data for the job ad
$sql = "SELECT * FROM job_ads WHERE id = ? AND recruiter_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $id, $_SESSION['userid']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
} else {
    echo "Job ad not found.";
    exit();
}

function generateDropdownOptions($conn, $tableName, $idField, $nameField, $selectedValue)
{
    $sql = "SELECT * FROM $tableName";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        while ($option = $result->fetch_assoc()) {
            $selected = ($option[$idField] == $selectedValue) ? 'selected' : '';
            echo "<option value='" . $option[$idField] . "' $selected>" . $option[$nameField] . "</option>";
        }
    }
}
?>


<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Faviocon -->
    <link rel="icon" type="image/x-icon" href="assets/logo/solo-logo.png">

    <title>Jobs Finder</title>

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">

    <!-- CSS -->
    <link rel="stylesheet" href="style.css">

    <!-- Poppins Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

    <style>
        body {
            background-color: rgb(228, 228, 228);
        }

        .adForm {
            background-color: rgb(240, 240, 240);
        }


        @media only screen and (max-width: 768px) {
            /* For mobile phones: */

            .adForm {
                min-width: 250px;
                max-width: 410px;
            }
        }

        @media only screen and (min-width: 600px) {

            /* For tablets: */
            .adForm {
                max-width: 600px;
            }
        }

        @media only screen and (min-width: 768px) {

            /* For desktop: */
            .adForm {
                max-width: 700px;
            }
        }
    </style>

</head>


<body>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg" style="background-color: #0c1538;">
        <div class="container mt-1 mb-1">
            <a class="navbar-brand" href="index.php">
                <img src="assets/logo/logo.png" alt="JobsFinder.lk" height="34">
            </a>
            <div class="d-flex">
                <button class="navbar-toggler" style="background-color: #ffffff;" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link text-white me-4 active" aria-current="page" href="..\index.php">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white me-4" href="..\dashboard.php">Dashboard</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white me-4" href="db_logout.php">Logout</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </nav><br>

    <!-- Form -->
    <div class="container adForm pe-5 ps-5 pt-5 pb-5">
        <h1 class="text-center">Edit Your Vacancy</h1>
        <form action="db_update.php" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="id" value="<?php echo $row['id']; ?>">
            <div class="row">
                <div class="col mb-3">
                    <label for="job_title" class="form-label">Job Title</label>
                    <input type="text" class="form-control" id="job_title" name="job_title" value="<?php echo $row['job_title']; ?>" required>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="company_name" class="form-label">Company Name</label>
                    <input type="text" class="form-control" id="company_name" name="company_name" value="<?php echo $row['company_name']; ?>" required>
                </div>
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="company_logo" class="form-label">Company Logo</label>
                    <input type="file" class="form-control" id="company_logo" name="company_logo">
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="job_category_id" class="form-label">Job Category</label>
                    <select class="form-select" id="job_category_id" name="job_category_id">
                        <?php generateDropdownOptions($conn, "job_categories", "id", "category_name", $row['job_category_id']); ?>
                    </select>
                </div>
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="employment_type_id" class="form-label">Job Type</label>
                    <select class="form-select" id="employment_type_id" name="employment_type_id">
                        <?php generateDropdownOptions($conn, "employment_types", "id", "employment_type", $row['employment_type_id']); ?>
                    </select>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="location_id" class="form-label">Location</label>
                    <select class="form-select" id="location_id" name="location_id">
                        <?php generateDropdownOptions($conn, "locations", "id", "location_name", $row['location_id']); ?>
                    </select>
                </div>
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="work_arrangement_id" class="form-label">Work Arrangement</label>
                    <select class="form-select" id="work_arrangement_id" name="work_arrangement_id">
                        <?php generateDropdownOptions($conn, "work_arrangements", "id", "work_arrangement", $row['work_arrangement_id']); ?>
                    </select>
                </div>
            </div>
            <div class="row">
                <div class="col mb-3">
                    <label for="job_description" class="form-label">Job Description</label>
                    <textarea class="form-control" id="job_description" name="job_description" required><?php echo $row['job_description']; ?></textarea>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="qualification_id" class="form-label">Qualification</label>
                    <select class="form-select" id="qualification_id" name="qualification_id">
                        <?php generateDropdownOptions($conn, "qualifications", "id", "qualification_name", $row['qualification_id']); ?>
                    </select>
                </div>
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="experience_level_id" class="form-label">Experience Level</label>
                    <select class="form-select" id="experience_level_id" name="experience_level_id">
                        <?php generateDropdownOptions($conn, "experience_levels", "id", "experience_level", $row['experience_id']); ?>
                    </select>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="salary" class="form-label">Salary Range (Optional)</label>
                    <input type="text" class="form-control" id="salary" name="salary" value="<?php echo $row['salary']; ?>">
                </div>
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="application_deadline" class="form-label">Application Deadline</label>
                    <input type="date" class="form-control" id="application_deadline" name="application_deadline" value="<?php echo $row['application_deadline']; ?>" required>
                </div>

            </div>
            <div class="row">
                <div class="col mb-3">
                    <label for="applyto" class="form-label">Send your application to:</label>
                    <input type="text" class="form-control" id="applyto" name="applyto" value="<?php echo $row['applyto']; ?>" required>
                </div>
            </div>
            <div class="row">
                <div class="col mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="1" id="is_sponsored" name="is_sponsored" <?php echo $row['is_sponsored'] ? 'checked' : ''; ?>>
                        <label class="form-check-label" for="is_sponsored">
                            Sponsored
                        </label>
                    </div>
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Update Ad</button>
        </form>


    </div>

    </div>
</body>

</html>