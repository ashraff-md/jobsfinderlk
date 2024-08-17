<!doctype html>
<html lang="en">

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

  <!-- Font Awesome CDN -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" rel="stylesheet">



  <!-- Poppins Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

</head>


<body>
  <div class="content-wrapper">
    <div class="hero">
      <!-- Navbar -->
      <nav class="navbar navbar-expand-lg">
        <div class="container mt-1 mb-1 pt-2 pb-2 ps-2 pe-2 Blur">
          <a class="navbar-brand ms-3" href="index.php">
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
                  <a class="nav-link text-white me-4" href="#">Subscribe</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link text-white me-3" href="signup.php">Sign up</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link text-white me-4" href="postad.php">Post Ad</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link text-white me-4" href="admin/login.php">Admin</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <!-- Search -->
      <div class="SearchBox">
        <div class="container mt-5 mb-5 pt-3 pb-3 Blur" id="search">
          <div class="row g-2 mt-1 ms-1 me-1 mb-1">
            <div class="col-md-12 col-sm-12 col-12">
              <h1 class="mt-1 ms-1 me-1 mb-1" style="font-family: 'Poppins', sans-serif; font-weight: 300; font-size: 2.5rem; line-height: 1.2; letter-spacing: -0.02em; color: #fff; text-align: center;">
                Discover Your Dream Job
              </h1>
            </div>
            <div class="col-md-12 col-sm-12 col-12">
              <form>
                <div class="seacrhFormLabel row g-2 ms-1 me-1 mb-1">
                  <div class="col-md-6 col-sm-6 col-12">
                    <label for="keyword" class="form-label ps-2">Keyword</label>
                    <input type="text" class="form-control" id="keyword" placeholder="Keyword">
                  </div>

                  <?php
                  // Establish a connection to your database
                  include_once 'db/db_config.php';

                  // Check connection
                  if ($conn->connect_error) {
                    die("Connection failed: " . $conn->connect_error);
                  }

                  // Function to generate dropdown options
                  function generateDropdownOptions($conn, $tableName, $idField, $nameField, $selectId, $label)
                  {
                    $sql = "SELECT * FROM $tableName";
                    $result = $conn->query($sql);

                    if ($result->num_rows > 0) {
                      // Fetch the first row to set as the default option
                      $firstRow = $result->fetch_assoc();

                      echo "<label for='$selectId' class='form-label ps-2'>$label</label>";
                      echo "<select class='form-select' aria-label='$selectId' id='$selectId'>";
                      echo "<option selected value='" . $firstRow[$idField] . "'>" . $firstRow[$nameField] . "</option>";

                      // Fetch the rest of the rows
                      while ($row = $result->fetch_assoc()) {
                        echo "<option value='" . $row[$idField] . "'>" . $row[$nameField] . "</option>";
                      }
                      echo "</select>";
                    } else {
                      echo "No options found.";
                    }
                  }
                  ?>

                  <!-- Locations dropdown -->
                  <div class="col-md-6 col-sm-6 col-12">
                    <?php generateDropdownOptions($conn, "locations", "id", "location_name", "location", "Location"); ?>
                  </div>

                  <!-- Categories dropdown -->
                  <div class="col-md-6 col-sm-6 col-12">
                    <?php generateDropdownOptions($conn, "job_categories", "id", "category_name", "category", "Category"); ?>
                  </div>

                  <!-- Qualifications dropdown -->
                  <div class="col-md-6 col-sm-6 col-12">
                    <?php generateDropdownOptions($conn, "qualifications", "id", "qualification_name", "qualification", "Qualification"); ?>
                  </div>

                  <!-- Experience dropdown -->
                  <div class="col-md-6 col-sm-6 col-12">
                    <?php generateDropdownOptions($conn, "experience_levels", "id", "experience_level", "experience", "Experience Level"); ?>
                  </div>

                  <!-- Employment Type dropdown -->
                  <div class="col-md-6 col-sm-6 col-12">
                    <?php generateDropdownOptions($conn, "employment_types", "id", "employment_type", "employment_type", "Employment Type"); ?>
                  </div>
                </div>

                <div class="col-md-12 col-sm-12 col-12 d-flex justify-content-center mt-4 mb-2">
                  <button type="submit" class="btn btn-outline-light btn-floating">Search</button>
                </div>
                <div class="col-md-12 col-sm-12 col-12 d-flex justify-content-center mt-2 mb-2">
                  <a href="#" style="text-decoration: underline;">Explore all ads</a>
                </div>
              </form>
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <br>

    <!-- Cards -->
    <?php
    include_once 'db/db_config.php';

    // Corrected SQL query with JOINs
    $query = "SELECT 
      job_ads.company_logo, 
      job_ads.job_title, 
      job_ads.company_name, 
      locations.location_name AS location, 
      job_categories.category_name AS job_category, 
      employment_types.employment_type AS employment_type,
      job_ads.application_deadline 
      FROM job_ads
      LEFT JOIN locations ON job_ads.location_id = locations.id
      LEFT JOIN job_categories ON job_ads.job_category_id = job_categories.id
      LEFT JOIN employment_types ON job_ads.employment_type_id = employment_types.id
      WHERE job_ads.is_sponsored = 1
      AND job_ads.status = 'Approved'
      ORDER BY RAND()  -- Randomize the ads
      LIMIT 10";

    $result = mysqli_query($conn, $query);

    // Check for SQL errors
    if (!$result) {
      echo "<p class='text-center'>Error fetching sponsored jobs: " . mysqli_error($conn) . "</p>";
      exit;
    }
    ?>

    <div class="container mt-4">
      <div class="row">
        <div class="d-flex justify-content-between">
          <div class="container">
            <h2 class="me-3 text-center">Sponsored Job Listings</h2>
            <?php
            if ($result->num_rows > 0) {
              $count = 0;
              echo '<div class="row">';
              // Output data of each row
              while ($row = $result->fetch_assoc()) {
                // Start a new row every two cards
                if ($count % 2 == 0 && $count > 0) {
                  echo '</div><div class="row">';
                }
            ?>
                <div class="card m-2">
                  <div class="card-body p-1 row">
                    <div class="col-md-5 d-flex justify-content-center align-items-center p-1">
                      <img src="uploads/<?php echo htmlspecialchars($row['company_logo'], ENT_QUOTES, 'UTF-8'); ?>" class="img-fluid p-1 rounded-3" alt="<?php echo htmlspecialchars($row['job_title'], ENT_QUOTES, 'UTF-8'); ?>">
                    </div>
                    <div class="card-body ps-1">
                      <h5 class="card-title text-truncate"><?php echo htmlspecialchars($row['job_title'], ENT_QUOTES, 'UTF-8'); ?></h5>
                      <small class="text-muted text-truncate"><?php echo htmlspecialchars($row['company_name'], ENT_QUOTES, 'UTF-8'); ?></small>
                      <br>
                      <p class="card-text mb-0 text-truncate">Location: <?php echo htmlspecialchars($row['location'], ENT_QUOTES, 'UTF-8'); ?></p>
                      <p class="card-text mb-0 text-truncate">Category: <?php echo htmlspecialchars($row['job_category'], ENT_QUOTES, 'UTF-8'); ?></p>
                      <p class="card-text mb-0 text-truncate">Employment Type: <?php echo htmlspecialchars($row['employment_type'], ENT_QUOTES, 'UTF-8'); ?></p>
                      <p class="card-text mb-0 text-truncate">Deadline: <?php echo htmlspecialchars($row['application_deadline'], ENT_QUOTES, 'UTF-8'); ?></p>
                    </div>
                  </div>
                </div>

            <?php
                $count++;
              }
              echo '</div>'; // Close the last row
            } else {
              echo "<p class='text-center'>No sponsored jobs found</p>";
            }
            ?>
          </div>
          <div class="banners">
            <div class="bannerAd">
              <img src="assets/logo/banner.png" alt="">
            </div>
            <div class="bannerAd mt-3">
              <img src="assets/logo/banner.png" alt="">
            </div>
          </div>

        </div>
      </div>
    </div>


  </div>

  <?php
  include_once 'footer.php';
  ?>
  </div>


  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>

</html>

<?php

mysqli_close($conn);
?>