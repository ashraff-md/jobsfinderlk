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
    .hero {
      background-image: url('assets/images/bg.jpg');
      background-position: center center;
      background-repeat: no-repeat;
      background-size: cover;
      background-color: rgb(228, 228, 228);
      padding-bottom: 2rem;
    }

    .Blur{
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
                <div class="col-md-6 col-sm-6 col-12">
                  <select class="form-select" aria-label="Location" id="location">
                    <option selected>Location</option>
                    <option value="1">Colombo</option>
                    <option value="2">Gampaha</option>
                    <option value="3">Kalutara</option>
                    <option value="4">Kandy</option>
                    <option value="5">Matale</option>
                    <option value="6">Nuwara Eliya</option>
                    <option value="7">Ratnapura</option>
                    <option value="8">Galle</option>
                    <option value="9">Matara</option>
                    <option value="10">Hambantota</option>
                    <option value="11">Monaragala</option>
                    <option value="12">Badulla</option>
                    <option value="13">Polonnaruwa</option>
                  </select>
                </div>
                <div class="col-md-6 col-sm-6 col-12">
                  <select class="form-select" aria-label="Category" id="category">
                    <option selected>Category</option>
                    <option value="1">Category 1</option>
                    <option value="2">Category 2</option>
                    <option value="3">Category 3</option>
                  </select>
                </div>
                <div class="col-md-6 col-sm-6 col-12">
                  <select class="form-select" aria-label="Qualification" id="qualification">
                    <option selected>Qualification</option>
                    <option value="1">O/L</option>
                    <option value="2">A/L</option>
                    <option value="3">Diploma</option>
                    <option value="4">Degree</option>
                  </select>
                </div>
                <div class="col-md-6 col-sm-6 col-12">
                  <select class="form-select" aria-label="Experience" id="experience">
                    <option selected>Experience</option>
                    <option value="1">0-3 years</option>
                    <option value="2">3-6 years</option>
                    <option value="3">6-10 years</option>
                    <option value="4">10+ years</option>
                  </select>
                </div>
                <div class="col-md-6 col-sm-6 col-12">
                  <input type="number" class="form-control" id="age" placeholder="Age">
                </div>
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
  require_once 'db_config.php';
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