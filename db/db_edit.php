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
            echo "<option value='" . htmlspecialchars($option[$idField], ENT_QUOTES) . "' $selected>" . htmlspecialchars($option[$nameField], ENT_QUOTES) . "</option>";
        }
    }
}
?>


<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="assets/logo/solo-logo.png">

    <title>Jobs Finder | Edit you ad</title>

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">

    <!-- CSS -->
    <link rel="stylesheet" href="style.css">

    <!-- Poppins Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">

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
                <img src="..\assets/logo/logo.png" alt="JobsFinder.lk" height="34">
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
            <input type="hidden" name="id" value="<?php echo htmlspecialchars($row['id'], ENT_QUOTES); ?>">
            <div class="row">
                <div class="col mb-3">
                    <label for="job_title" class="form-label">Job Title</label>
                    <input type="text" class="form-control" id="job_title" name="job_title" value="<?php echo htmlspecialchars($row['job_title'], ENT_QUOTES); ?>" required>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="company_name" class="form-label">Company Name</label>
                    <input type="text" class="form-control" id="company_name" name="company_name" value="<?php echo htmlspecialchars($row['company_name'], ENT_QUOTES); ?>" required>
                </div>
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="company_logo" class="form-label">Company Logo</label>
                    <input type="file" class="form-control" id="company_logo" name="company_logo">
                    <?php if (!empty($row['company_logo'])): ?>
                        <small>Current Logo:</small><br>
                        <img src="../uploads/<?php echo htmlspecialchars($row['company_logo'], ENT_QUOTES); ?>" alt="Company Logo" height="50"><br>
                        <small>Leave this field empty if you don't want to change the logo.</small>
                    <?php endif; ?>
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
                    <label for="salary" class="form-label">Salary (Optional)</label>
                    <input type="text" class="form-control" id="salary" name="salary" value="<?php echo htmlspecialchars($row['salary'], ENT_QUOTES); ?>">
                </div>
            </div>
            <div class="row">
                <div class="col mb-3">
                    <label for="job_description" class="form-label">Job Description</label>
                    <textarea class="form-control" id="job_description" name="job_description" rows="6" required><?php echo htmlspecialchars($row['job_description'], ENT_QUOTES); ?></textarea>
                </div>
            </div>
            <div class="row">
                <div class="col mb-3">
                    <label for="work_arrangement_id" class="form-label">Work Arrangement</label>
                    <select class="form-select" id="work_arrangement_id" name="work_arrangement_id">
                        <?php generateDropdownOptions($conn, "work_arrangements", "id", "arrangement_type", $row['work_arrangement_id']); ?>
                    </select>
                </div>
            </div>
            <button type="submit" class="btn btn-success mt-3">Save Changes</button>
        </form>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-L2A6cMKWKcZ1nLmeLuP1C6MCceDkAnfJAV1q6M/d/36SElsfCJhM2h5BAmRAqGzO" crossorigin="anonymous"></script>
</body>
</html>