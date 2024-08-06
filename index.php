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

  <!-- Poppins Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

  <style>
    body {
      background-color: #2C3333;
    }

    .hero {
      background-image: url('assets/images/bg.jpg');
      background-position: center center;
      background-repeat: no-repeat;
      background-size: cover;
      background-color: rgb(228, 228, 228);
      padding-bottom: 2rem;
    }

    .Blur {
      backdrop-filter: blur(4px);
      background-color: #0c15389b;
      border-radius: 10px;
      box-shadow: 0px 0px 30px rgba(227, 227, 237, 0.37);
      border: 1px #0c15389b;
    }

    @media only screen and (max-width: 768px) {
      /* For mobile phones: */


      #search {
        max-width: 350px;
        border-radius: 15px;
      }
    }

    @media only screen and (min-width: 600px) {
      /* For tablets: */

      #search {
        max-width: 580px;
        border-radius: 15px;
      }
    }

    @media only screen and (min-width: 768px) {
      /* For desktop: */

      .hero {
        background-image: url('assets/images/bg.jpg');
        background-position: center center;
        background-repeat: no-repeat;
        background-size: cover;
        background-color: rgb(228, 228, 228);
      }

      #search {
        max-width: 760px;
        border-radius: 15px;
      }
    }
  </style>

</head>


<body>
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
                <a class="nav-link text-white me-4" href="#">About</a>
              </li>
              <li class="nav-item">
                <a class="nav-link text-white me-4" href="postad.php">Post Ad</a>
              </li>
              <li class="nav-item">
                <a class="nav-link text-white me-3" href="#">Subscribe</a>
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
            <h1 class="mt-1 ms-1 me-1 mb-2" style="font-family: 'Poppins', sans-serif; font-weight: 300; font-size: 2.5rem; line-height: 1.2; letter-spacing: -0.02em; color: #fff; text-align: center;">
              Discover Your Dream Job
            </h1>
          </div>
          <div class="col-md-12 col-sm-12 col-12">
            <form>
              <div class="row g-2 mt-1 ms-1 me-1 mb-1">
                <div class="col-md-6 col-sm-6 col-12">
                  <input type="text" class="form-control" id="keyword" placeholder="Keyword">
                </div>

                <?php
                // Establish a connection to your database
                include_once 'db_config.php';

                // Check connection
                if ($conn->connect_error) {
                  die("Connection failed: " . $conn->connect_error);
                }

                // Function to generate dropdown options
                function generateDropdownOptions($conn, $tableName, $idField, $nameField, $selectId)
                {
                  $sql = "SELECT * FROM $tableName";
                  $result = $conn->query($sql);

                  if ($result->num_rows > 0) {
                    // Fetch the first row to set as the default option
                    $firstRow = $result->fetch_assoc();

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
                  <?php generateDropdownOptions($conn, "locations", "id", "location_name", "location"); ?>
                </div>

                <!-- Categories dropdown -->
                <div class="col-md-6 col-sm-6 col-12">
                  <?php generateDropdownOptions($conn, "job_categories", "id", "category_name", "category"); ?>
                </div>

                <!-- Qualifications dropdown -->
                <div class="col-md-6 col-sm-6 col-12">
                  <?php generateDropdownOptions($conn, "qualifications", "id", "qualification_name", "qualification"); ?>
                </div>

                <!-- Experience dropdown -->
                <div class="col-md-6 col-sm-6 col-12">
                  <?php generateDropdownOptions($conn, "experience_levels", "id", "experience_level", "experience"); ?>
                </div>

                <div class="col-md-6 col-sm-6 col-12">
                  <input type="number" class="form-control" id="age" placeholder="Age">
                </div>
              </div>

              <?php
              // Close the database connection
              $conn->close();
              ?>


              <div class="col-md-12 col-sm-12 col-12 d-flex justify-content-center mt-4">
                <button type="submit" class="btn btn-light">Search</button>
              </div>
              <div class="col-md-12 col-sm-12 col-12 d-flex justify-content-center mt-1">
                <a href="#">Explore all ads</a>
              </div>
          </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  </div>

  <br><br><br>
  <!-- Cards -->
  <?php
  include_once 'db_config.php';
  $query = "SELECT company_logo, job_title, company_name, location, job_category, deadline FROM sponsoredad";
  $result = mysqli_query($conn, $query);
  ?>
  <div class="container">
    <?php
    while ($row = mysqli_fetch_assoc($result)) {
    ?>
      <div class="row">
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="row no-gutters">
              <div class="col-md-4">
                <img src="<?php echo $row['company_logo']; ?>" class="img-fluid rounded-start" alt="<?php echo $row['company_name']; ?>">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title"><?php echo $row['job_title']; ?></h5>
                  <small><?php echo $row['company_name']; ?></small>
                  <br>
                  <p class="card-text mb-0">Location: <?php echo $row['location']; ?></p>
                  <p class="card-text mb-0">Category: <?php echo $row['job_category']; ?></p>
                  <p class="card-text mb-0">Deadline: <?php echo $row['deadline']; ?></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    <?php
    }
    mysqli_close($conn);
    ?>
  </div>


  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>

</html>