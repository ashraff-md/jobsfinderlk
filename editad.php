<!doctype html>
<html lang="en">

<?php
session_start();
if (!isset($_SESSION['userloggedin'])) {
    header('Location: login.php');
    exit();
}

include_once 'db/db_config.php';

// Fetch the job ad data
$id = $_GET['id'] ?? 0;
$id = (int)$id;

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT * FROM job_ads WHERE id = ? AND recruiter_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $id, $_SESSION['userid']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $job = $result->fetch_assoc();
} else {
    header('Location: dashboard.php');
    exit();
}

// Fetch dropdown data
function fetchOptions($conn, $tableName, $idField, $nameField)
{
    $sql = "SELECT * FROM $tableName";
    $result = $conn->query($sql);
    $options = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $options[] = $row;
        }
    }
    return $options;
}

$jobCategories = fetchOptions($conn, 'job_categories', 'id', 'category_name');
$employmentTypes = fetchOptions($conn, 'employment_types', 'id', 'employment_type');
$locations = fetchOptions($conn, 'locations', 'id', 'location_name');
$workArrangements = fetchOptions($conn, 'work_arrangements', 'id', 'work_arrangement');
$qualifications = fetchOptions($conn, 'qualifications', 'id', 'qualification_name');
$experienceLevels = fetchOptions($conn, 'experience_levels', 'id', 'experience_level');
?>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="assets/logo/solo-logo.png">

    <title>Jobs Finder | Edit Your Ad</title>

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">

    <!-- CSS -->
    <link rel="stylesheet" href="style.css">

    <!-- Poppins Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">

</head>

<body>
    <!-- Navbar -->
    <?php include_once 'userNavbar.php'; ?>

    <!-- Form -->
    <div class="container adForm pe-5 ps-5 pt-5 pb-5">
        <h1 class="text-center">Edit Job Vacancy</h1>
        <form action="db_update.php" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="job_id" value="<?php echo htmlspecialchars($job['id'], ENT_QUOTES); ?>">
            <div class="row">
                <div class="col mb-3">
                    <label for="recruiter" class="form-label ps-1">Username</label>
                    <input class="form-control" type="text" id="recruiter" name="recruiter" value="<?php echo htmlspecialchars($_SESSION['userloggedin'], ENT_QUOTES); ?>" disabled>
                </div>
            </div>
            <div class="row">
                <div class="col mb-3">
                    <label for="job-title" class="form-label ps-1">Job Title</label>
                    <input type="text" class="form-control" id="job_title" name="job_title" maxlength="50" value="<?php echo htmlspecialchars($job['job_title'], ENT_QUOTES); ?>" required>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="company-name" class="form-label ps-1">Company Name</label>
                    <input type="text" class="form-control" id="company_name" name="company_name" maxlength="50" value="<?php echo htmlspecialchars($job['company_name'], ENT_QUOTES); ?>" required>
                </div>
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="company-logo" class="form-label ps-1">Company Logo</label>
                    <input type="file" class="form-control" id="company_logo" name="company_logo">
                    <small>Current Logo: <img src="uploads/<?php echo htmlspecialchars($job['company_logo'], ENT_QUOTES); ?>" alt="Company Logo" style="max-width: 50px;"></small>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="job-category" class="form-label ps-1">Job Category</label>
                    <select class='form-select' id='job_category_id' name='job_category_id'>
                        <?php foreach ($jobCategories as $category) : ?>
                            <option value="<?php echo htmlspecialchars($category['id'], ENT_QUOTES); ?>" <?php echo ($category['id'] == $job['job_category_id']) ? 'selected' : ''; ?>>
                                <?php echo htmlspecialchars($category['category_name'], ENT_QUOTES); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="job-type" class="form-label ps-1">Job Type</label>
                    <select class='form-select' id='employment_type_id' name='employment_type_id'>
                        <?php foreach ($employmentTypes as $type) : ?>
                            <option value="<?php echo htmlspecialchars($type['id'], ENT_QUOTES); ?>" <?php echo ($type['id'] == $job['employment_type_id']) ? 'selected' : ''; ?>>
                                <?php echo htmlspecialchars($type['employment_type'], ENT_QUOTES); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="location" class="form-label ps-1">Location</label>
                    <select class='form-select' id='location_id' name='location_id'>
                        <?php foreach ($locations as $location) : ?>
                            <option value="<?php echo htmlspecialchars($location['id'], ENT_QUOTES); ?>" <?php echo ($location['id'] == $job['location_id']) ? 'selected' : ''; ?>>
                                <?php echo htmlspecialchars($location['location_name'], ENT_QUOTES); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="experience" class="form-label ps-1">Work Arrangements</label>
                    <select class='form-select' id='work_arrangement_id' name='work_arrangement_id'>
                        <?php foreach ($workArrangements as $arrangement) : ?>
                            <option value="<?php echo htmlspecialchars($arrangement['id'], ENT_QUOTES); ?>" <?php echo ($arrangement['id'] == $job['work_arrangement_id']) ? 'selected' : ''; ?>>
                                <?php echo htmlspecialchars($arrangement['work_arrangement'], ENT_QUOTES); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
            <div class="row">
                <div class="col mb-3">
                    <label for="job-description" class="form-label ps-1">Job Description</label>
                    <textarea class="form-control" id="job_description" name="job_description" maxlength="5000" style="height: 6rem;" required><?php echo htmlspecialchars($job['job_description'], ENT_QUOTES); ?></textarea>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="qualification" class="form-label ps-1">Qualification</label>
                    <select class='form-select' id='qualification_id' name='qualification_id'>
                        <?php foreach ($qualifications as $qualification) : ?>
                            <option value="<?php echo htmlspecialchars($qualification['id'], ENT_QUOTES); ?>" <?php echo ($qualification['id'] == $job['qualification_id']) ? 'selected' : ''; ?>>
                                <?php echo htmlspecialchars($qualification['qualification_name'], ENT_QUOTES); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="experience" class="form-label ps-1">Experience</label>
                    <select class='form-select' id='experience_level_id' name='experience_level_id'>
                        <?php foreach ($experienceLevels as $level) : ?>
                            <option value="<?php echo htmlspecialchars($level['id'], ENT_QUOTES); ?>" <?php echo ($level['id'] == $job['id']) ? 'selected' : ''; ?>>
                                <?php echo htmlspecialchars($level['experience_level'], ENT_QUOTES); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="salary-range" class="form-label ps-1">Salary Range (Optional)</label>
                    <input type="text" class="form-control" id="salary" name="salary" value="<?php echo htmlspecialchars($job['salary'], ENT_QUOTES); ?>">
                </div>
                <div class="col-md-6 col-sm-6 col-12 mb-3">
                    <label for="application-deadline" class="form-label ps-1">Application Deadline</label>
                    <input type="date" class="form-control" id="application_deadline" name="application_deadline" value="<?php echo htmlspecialchars($job['application_deadline'], ENT_QUOTES); ?>" required>
                </div>
            </div>
            <div class="row">
                <div class="col mb-3">
                    <label for="applyto" class="form-label ps-1">Send your application to:</label>
                    <input type="text" class="form-control" id="applyto" name="applyto" value="<?php echo htmlspecialchars($job['applyto'], ENT_QUOTES); ?>" required>
                </div>
            </div>
            <div class="row">
                <div class="col mb-2">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="1" id="is_sponsored" name="is_sponsored" <?php echo ($job['is_sponsored']) ? 'checked' : ''; ?>>
                        <label class="form-check-label" for="is_sponsored">
                            Sponsored
                        </label>
                    </div><br>
                    <button type="submit" class="btn btn-primary">Update Ad</button>
                </div>
            </div>
        </form>
    </div>

    <!-- Bootstrap Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js" integrity="sha384-oBqDVmMz4fnFO4W+QxYKT3KlTF4Yk6Fgci0OgH4OC3c4MROm30Fv57Jr4GTQpTTp" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-KyZXEAg3QhqLMpG8r+Knujsl5/6tc6FxP5S/pTNCw7pAd+n09S5vPWeVYoN07AYt/" crossorigin="anonymous"></script>
</body>

</html>