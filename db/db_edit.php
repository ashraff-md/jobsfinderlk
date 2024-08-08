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

function generateDropdownOptions($conn, $tableName, $idField, $nameField, $selectedValue) {
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

<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Edit Job Ad</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container mt-5">
    <h1>Edit Job Ad</h1>
    <form action="db_update.php" method="POST" enctype="multipart/form-data">
      <input type="hidden" name="id" value="<?php echo $row['id']; ?>">
      <div class="row">
        <div class="col mb-3">
          <label for="job_title" class="form-label">Job Title</label>
          <input type="text" class="form-control" id="job_title" name="job_title" value="<?php echo $row['job_title']; ?>" required>
        </div>
      </div>
      <div class="row">
        <div class="col mb-3">
          <label for="company_name" class="form-label">Company Name</label>
          <input type="text" class="form-control" id="company_name" name="company_name" value="<?php echo $row['company_name']; ?>" required>
        </div>
      </div>
      <div class="row">
        <div class="col mb-3">
          <label for="company_logo" class="form-label">Company Logo</label>
          <input type="file" class="form-control" id="company_logo" name="company_logo">
          <img src="../uploads/<?php echo $row['company_logo']; ?>" alt="Company Logo" width="100" class="mt-2">
        </div>
      </div>
      <div class="row">
        <div class="col mb-3">
          <label for="job_category_id" class="form-label">Job Category</label>
          <select class="form-select" id="job_category_id" name="job_category_id">
            <?php generateDropdownOptions($conn, "job_categories", "id", "category_name", $row['job_category_id']); ?>
          </select>
        </div>
      </div>
      <div class="row">
        <div class="col mb-3">
          <label for="employment_type_id" class="form-label">Employment Type</label>
          <select class="form-select" id="employment_type_id" name="employment_type_id">
            <?php generateDropdownOptions($conn, "employment_types", "id", "employment_type", $row['employment_type_id']); ?>
          </select>
        </div>
      </div>
      <div class="row">
        <div class="col mb-3">
          <label for="location_id" class="form-label">Location</label>
          <select class="form-select" id="location_id" name="location_id">
            <?php generateDropdownOptions($conn, "locations", "id", "location_name", $row['location_id']); ?>
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
        <div class="col mb-3">
          <label for="qualification_id" class="form-label">Qualification</label>
          <select class="form-select" id="qualification_id" name="qualification_id">
            <?php generateDropdownOptions($conn, "qualifications", "id", "qualification_name", $row['qualification_id']); ?>
          </select>
        </div>
      </div>
      <div class="row">
        <div class="col mb-3">
          <label for="experience_level_id" class="form-label">Experience Level</label>
          <select class="form-select" id="experience_level_id" name="experience_level_id">
            <?php generateDropdownOptions($conn, "experience_levels", "id", "experience_level", $row['experience_id']); ?>
          </select>
        </div>
      </div>
      <div class="row">
        <div class="col mb-3">
          <label for="work_arrangement_id" class="form-label">Work Arrangement</label>
          <select class="form-select" id="work_arrangement_id" name="work_arrangement_id">
            <?php generateDropdownOptions($conn, "work_arrangements", "id", "work_arrangement", $row['work_arrangement_id']); ?>
          </select>
        </div>
      </div>
      <div class="row">
        <div class="col mb-3">
          <label for="salary" class="form-label">Salary</label>
          <input type="text" class="form-control" id="salary" name="salary" value="<?php echo $row['salary']; ?>">
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
          <label for="application_deadline" class="form-label">Application Deadline</label>
          <input type="date" class="form-control" id="application_deadline" name="application_deadline" value="<?php echo $row['application_deadline']; ?>" required>
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
</body>
</html>
