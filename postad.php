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
              <a class="nav-link text-white me-4" href="postad.php">Post Ad</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav><br>

  <!-- Form -->
  <div class="container adForm pe-5 ps-5 pt-5 pb-5">
    <h1 class="text-center">Post Your Vacancy</h1>
    <form action="postad.php" method="POST" enctype="multipart/form-data">
      <div class="row">
        <div class="col mb-3">
          <label for="job-title" class="form-label ps-1">Job Title</label>
          <input type="text" class="form-control" id="job-title" name="job-title" maxlength="50" required>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6 col-sm-6 col-12 mb-3">
          <label for="company-name" class="form-label ps-1">Company Name</label>
          <input type="text" class="form-control" id="company-name" name="company-name" maxlength="50" required>
        </div>
        <div class="col-md-6 col-sm-6 col-12 mb-3">
          <label for="company-logo" class="form-label ps-1">Company Logo</label>
          <input type="file" class="form-control" id="company-logo" name="company-logo" required>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6 col-sm-6 col-12 mb-3">
          <label for="job-category" class="form-label ps-1">Job Category</label>
          <select id="job-category" name="job-category" class="form-select" required>
            <option value="">Select</option>
            <option value="IT">IT</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Finance">Finance</option>
            <option value="HR">HR</option>
            <option value="Engineering">Engineering</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="col-md-6 col-sm-6 col-12 mb-3">
          <label for="job-type" class="form-label ps-1">Job Type</label>
          <select id="job-type" name="job-type" class="form-select" required>
            <option value="">Select</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div class="col mb-3">
        <label for="location" class="form-label ps-1">Location</label>
        <select id="location" name="location" class="form-select" required>
          <option value="">Select</option>
          <option value="Work from Home">Work from Home</option>
          <option value="25 Districts">25 Districts</option>
        </select>
      </div>
      <div class="row">
        <div class="col mb-3">
          <label for="job-description" class="form-label ps-1">Job Description</label>
          <textarea class="form-control" id="job-description" name="job-description" maxlength="5000" required style="height: 6rem;"></textarea>
        </div>

      </div>
      <div class="row">
        <div class="col-md-6 col-sm-6 col-12 mb-3">
          <label for="qualification" class="form-label ps-1">Qualification</label>
          <select id="qualification" name="qualification" class="form-select" required>
            <option value="">Select</option>
            <option value="OL">OL</option>
            <option value="AL">AL</option>
            <option value="Diploma">Diploma</option>
            <option value="HND">HND</option>
            <option value="Bachelor's">Bachelor's</option>
            <option value="Master's">Master's</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="col-md-6 col-sm-6 col-12 mb-3">
          <label for="experience" class="form-label ps-1">Experience</label>
          <select id="experience" name="experience" class="form-select" required>
            <option value="">Select</option>
            <option value="None">None</option>
            <option value="1-2 Years">1-2 Years</option>
            <option value="2-5 Years">2-5 Years</option>
            <option value="5-10 Years">5-10 Years</option>
            <option value="10+ Years">10+ Years</option>
          </select>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6 col-sm-6 col-12 mb-3">
          <label for="age-category" class="form-label ps-1">Age Category</label>
          <select id="age-category" name="age-category" class="form-select" required>
            <option value="">Select</option>
            <option value="Under 25">Under 25</option>
            <option value="25-45">25-45</option>
            <option value="45-60">45-60</option>
            <option value="60+">60+</option>
          </select>
        </div>
        <div class="col-md-6 col-sm-6 col-12 mb-3">
          <label for="application-deadline" class="form-label ps-1">Application Deadline</label>
          <input type="date" class="form-control" id="application-deadline" name="application-deadline" required>
        </div>
      </div>
      <div class="row">
        <div class="col mb-3">
          <label for="salary-range" class="form-label ps-1">Salary Range (Optional)</label>
          <input type="number" class="form-control" id="salary-range" name="salary-range">
        </div>
      </div>
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div><br>


  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>

</html>