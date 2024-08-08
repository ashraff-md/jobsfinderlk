<!doctype html>
<html lang="en">

<?php
session_start();
if (!isset($_SESSION['userloggedin'])) {
  header('Location: login.php');
  exit();
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
    /*
    .SearchBox {
      background-image: url('assets/images/bg.jpg');
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
    } */
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
              <a class="nav-link text-white me-4 active" aria-current="page" href="index.php">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white me-4" href="dashboard.php">Dashboard</a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white me-4" href="db/db_logout.php">Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav><br>

  <!-- Form -->
  <div class="container adForm pe-5 ps-5 pt-5 pb-5">
    <h1 class="text-center">Post Your Vacancy</h1>
    <form action="db/db_postad.php" method="POST" enctype="multipart/form-data">
      <div class="row">
        <div class="col mb-3">
          <label for="recruiter" class="form-label ps-1">Username</label>
          <input class="form-control" type="text" id="recruiter" name="recruiter" placeholder="<?php echo $_SESSION['userloggedin']; ?>" aria-label="Disabled input example" disabled>
        </div>
        <div class="row">
          <div class="col mb-3">
            <label for="job-title" class="form-label ps-1">Job Title</label>
            <input type="text" class="form-control" id="job_title" name="job_title" maxlength="50" required>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6 col-sm-6 col-12 mb-3">
            <label for="company-name" class="form-label ps-1">Company Name</label>
            <input type="text" class="form-control" id="company_name" name="company_name" maxlength="50" required>
          </div>
          <div class="col-md-6 col-sm-6 col-12 mb-3">
            <label for="company-logo" class="form-label ps-1">Company Logo</label>
            <input type="file" class="form-control" id="company_logo" name="company_logo" required>
          </div>
        </div>

        <?php
        include_once 'db/db_config.php';
        if ($conn->connect_error) {
          die("Connection failed: " . $conn->connect_error);
        }

        function generateDropdownOptions($conn, $tableName, $idField, $nameField, $selectId, $selectName)
        {
          $sql = "SELECT * FROM $tableName";
          $result = $conn->query($sql);

          if ($result->num_rows > 0) {
            echo "<select class='form-select' id='$selectId' name='$selectName'>";
            while ($row = $result->fetch_assoc()) {
              echo "<option value='" . $row[$idField] . "'>" . $row[$nameField] . "</option>";
            }
            echo "</select>";
          } else {
            echo "No options found.";
          }
        }
        ?>

        <div class="row">
          <div class="col-md-6 col-sm-6 col-12 mb-3">
            <label for="job-category" class="form-label ps-1">Job Category</label>
            <?php generateDropdownOptions($conn, "job_categories", "id", "category_name", "job_category_id", "job_category_id"); ?>
          </div>
          <div class="col-md-6 col-sm-6 col-12 mb-3">
            <label for="job-type" class="form-label ps-1">Job Type</label>
            <?php generateDropdownOptions($conn, "employment_types", "id", "employment_type", "employment_type_id", "employment_type_id"); ?>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 col-sm-6 col-12 mb-3">
            <label for="location" class="form-label ps-1">Location</label>
            <?php generateDropdownOptions($conn, "locations", "id", "location_name", "location_id", "location_id"); ?>
          </div>
          <div class="col-md-6 col-sm-6 col-12 mb-3">
            <label for="experience" class="form-label ps-1">Work Arrangements</label>
            <?php generateDropdownOptions($conn, "work_arrangements", "id", "work_arrangement", "work_arrangement_id", "work_arrangement_id"); ?>
          </div>
        </div>
        <div class="row">
          <div class="col mb-3">
            <label for="job-description" class="form-label ps-1">Job Description</label>
            <textarea class="form-control" id="job_description" name="job_description" maxlength="5000" required style="height: 6rem;"></textarea>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 col-sm-6 col-12 mb-3">
            <label for="salary-range" class="form-label ps-1"> Send your aplication to:</label>
            <input type="text" class="form-control" id="applyto" name="applyto" placeholder="e-mail or phone number" required>
          </div>
          <div class="col-md-6 col-sm-6 col-12 mb-3">
            <label for="application-deadline" class="form-label ps-1">Application Deadline</label>
            <input type="date" class="form-control" id="application_deadline" name="application_deadline" required>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 col-sm-6 col-12 mb-3">
            <label for="qualification" class="form-label ps-1">Qualification</label>
            <?php generateDropdownOptions($conn, "qualifications", "id", "qualification_name", "qualification_id", "qualification_id"); ?>
          </div>
          <div class="col-md-6 col-sm-6 col-12 mb-3">
            <label for="experience" class="form-label ps-1">Experience</label>
            <?php generateDropdownOptions($conn, "experience_levels", "id", "experience_level", "experience_level_id", "experience_level_id"); ?>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6 col-sm-6 col-12 mb-3">
            <label for="experience" class="form-label ps-1">Work Arrangements</label>
            <?php generateDropdownOptions($conn, "work_arrangements", "id", "work_arrangement", "work_arrangement_id", "work_arrangement_id"); ?>
          </div>
          <div class="col-md-6 col-sm-6 col-12 mb-3">
            <label for="salary-range" class="form-label ps-1">Salary Range (Optional)</label>
            <input type="text" class="form-control" id="salary" name="salary">
          </div>
        </div>
        <div class="row">
          <div class="col mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="1" id="is_sponsored" name="is_sponsored">
              <label class="form-check-label" for="is_sponsored">
                Sponsored
              </label>
            </div>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>

  </div><br>


  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>

</html>