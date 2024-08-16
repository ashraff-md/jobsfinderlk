<!doctype html>
<html lang="en">

<?php
session_start();
if (!isset($_SESSION['adminloggedin'])) {
    header('Location: login.php');
    exit();
}
?>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="assets/logo/solo-logo.png">

    <title>Jobs Finder | Admin Dashboard</title>

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">

    <!-- CSS -->
    <link rel="stylesheet" href="../style.css">

    <!-- Poppins Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
</head>

<body>
    <div class="content-wrapper">
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg" style="background-color: #0c1538;">
            <div class="container mt-1 mb-1">
                <a class="navbar-brand" href="../index.php">
                    <img src="../assets/logo/logo.png" alt="JobsFinder.lk" height="34">
                </a>
                <div class="d-flex">
                    <button class="navbar-toggler" style="background-color: #ffffff;" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                <p class="nav-link text-white me-4 active">
                                    <?php echo $_SESSION['adminloggedin']; ?>
                                </p>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link text-white me-4 active" aria-current="page" href="dashboard.php">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link text-white me-4" href="../db/db_logout.php">Logout</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Approved Ads -->
        <?php
        // Include your database connection
        include_once '../db/db_config.php';

        // SQL query to select approved ads with joined tables for location and category
        $sql = "SELECT 
            job_ads.company_logo, 
            job_ads.job_title, 
            job_ads.company_name, 
            locations.location_name AS location, 
            job_categories.category_name AS job_category, 
            job_ads.application_deadline, 
            job_ads.status
        FROM 
            job_ads
        LEFT JOIN 
            locations ON job_ads.location_id = locations.id
        LEFT JOIN 
            job_categories ON job_ads.job_category_id = job_categories.id
        WHERE 
            job_ads.status = 'approved'";

        $result = $conn->query($sql);

        // Check if there are any approved ads
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
        ?>

                <!-- Card -->
                <div class="container col-md-5 mt-3 mb-3 d-flex justify-content-center">
                    <div class="card" style="width: 100%;">
                        <div class="row no-gutters">
                            <div class="col-md-4 d-flex justify-content-center align-items-center">
                                <img src="../uploads/<?php echo htmlspecialchars($row['company_logo'], ENT_QUOTES, 'UTF-8'); ?>" class="img-fluid rounded-start" alt="<?php echo htmlspecialchars($row['job_title'], ENT_QUOTES, 'UTF-8'); ?>">
                            </div>
                            <div class="col-md-8">
                                <div class="card-body">
                                    <h5 class="card-title text-truncate"><?php echo htmlspecialchars($row['job_title'], ENT_QUOTES, 'UTF-8'); ?></h5>
                                    <small class="text-muted text-truncate"><?php echo htmlspecialchars($row['company_name'], ENT_QUOTES, 'UTF-8'); ?></small>
                                    <br>
                                    <p class="card-text mb-0 text-truncate">Location: <?php echo htmlspecialchars($row['location'], ENT_QUOTES, 'UTF-8'); ?></p>
                                    <p class="card-text mb-0 text-truncate">Category: <?php echo htmlspecialchars($row['job_category'], ENT_QUOTES, 'UTF-8'); ?></p>
                                    <p class="card-text mb-0 text-truncate">Deadline: <?php echo htmlspecialchars($row['application_deadline'], ENT_QUOTES, 'UTF-8'); ?></p>
                                    <p class="card-text mb-0 text-truncate">Status: <?php echo htmlspecialchars($row['status'], ENT_QUOTES, 'UTF-8'); ?></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

        <?php
            }
        } else {
            echo "<p>No approved ads found.</p>";
        }

        // Close the database connection
        $conn->close();
        ?>

        <?php
        include_once '../social.php';
        ?>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>

</html>