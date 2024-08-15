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
</head>


<body>
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
                                <?php echo $_SESSION['userloggedin']; ?>
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



    <br><br>
    <!-- Dashboard -->
    <div class="container">
        <h1 class="text-center">Admin Dashboard</h1>
        <br>
        <?php
        // Database connection
        include_once '../db/db_config.php';

        // Get the count of pending, approved, and rejected ads
        $sql = "SELECT 
                SUM(CASE WHEN job_ads.status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
                SUM(CASE WHEN job_ads.status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count,
                SUM(CASE WHEN job_ads.status = 'approved' THEN 1 ELSE 0 END) AS approved_count
            FROM 
                job_ads";

        $result = $conn->query($sql);

        // Initialize the counts
        $pending_count = 0;
        $approved_count = 0;
        $rejected_count = 0;

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $pending_count = $row['pending_count'];
            $approved_count = $row['approved_count'];
            $rejected_count = $row['rejected_count'];
        }
        ?>

        <!-- Card Container with Flexbox -->
        <div class="d-flex justify-content-center">
            <!-- Pending Ads Card -->
            <div class="card border-warning mb-3 me-3" style="max-width: 18rem; cursor: pointer;">
                <a href="pendingads.php" class="text-decoration-none text-warning">
                    <div class="card-header">Pending Ads</div>
                    <div class="card-body">
                        <h5 class="card-title"><?php echo $pending_count; ?> Pending Ads</h5>
                        <p class="card-text">These are the ads that are currently awaiting approval.</p>
                    </div>
                </a>
            </div>

            <!-- Approved Ads Card -->
            <div class="card border-success mb-3 me-3" style="max-width: 18rem; cursor: pointer;">
                <a href="approvedads.php" class="text-decoration-none text-success">
                    <div class="card-header">Approved Ads</div>
                    <div class="card-body">
                        <h5 class="card-title"><?php echo $approved_count; ?> Approved Ads</h5>
                        <p class="card-text">These ads have been approved and are now live.</p>
                    </div>
                </a>
            </div>

            <!-- Rejected Ads Card -->
            <div class="card border-danger mb-3" style="max-width: 18rem; cursor: pointer;">
                <a href="rejectedads.php" class="text-decoration-none text-danger">
                    <div class="card-header">Rejected Ads</div>
                    <div class="card-body">
                        <h5 class="card-title"><?php echo $rejected_count; ?> Rejected Ads</h5>
                        <p class="card-text">These ads were rejected and did not meet the required standards.</p>
                    </div>
                </a>
            </div>
        </div>
    </div>

    <br>
    <!-- Footer -->
    <?php
    include_once '../footer.php';
    ?>

</body>

<?php
$conn->close();
?>

<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>

</html>