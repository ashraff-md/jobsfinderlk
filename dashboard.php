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

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="assets/logo/solo-logo.png">

    <title>Jobs Finder</title>

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">

    <!-- CSS -->
    <link rel="stylesheet" href="style.css">

    <!-- Poppins Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&display=swap" rel="stylesheet">
</head>

<body>
    <div class="content-wrapper">
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
                                <p class="nav-link text-white me-4 active">
                                    <?php echo $_SESSION['userloggedin']; ?>
                                </p>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link text-white me-4 active" aria-current="page" href="dashboard.php">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link text-white me-4" href="postad.php">Post Ad</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link text-white me-4" href="db/db_logout.php">Logout</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>

        <br><br>
        <!-- Dashboard -->
        <div class="container">
            <h1 class="text-center">Dashboard</h1>

            <!-- Rejected Ads -->
            <?php
            // Database connection
            include_once 'db/db_config.php';

            // Rejected Ads
            $sql = "SELECT 
                job_ads.id,
                job_ads.company_name, 
                job_ads.company_logo,
                job_ads.job_title, 
                job_categories.category_name AS job_category, 
                locations.location_name AS location,
                job_ads.status, 
                job_ads.rejection_reason
                FROM 
                    job_ads
                LEFT JOIN job_categories ON job_ads.job_category_id = job_categories.id
                LEFT JOIN locations ON job_ads.location_id = locations.id
                WHERE 
                job_ads.recruiter_id = " . $_SESSION['userid'] . " 
                AND job_ads.status = 'rejected' 
                ORDER BY 
                job_ads.id DESC";
            $result = $conn->query($sql);

            if ($result->num_rows > 0) { ?>
                <h3>Rejected Ads</h3>
                <div class="row">
                    <?php while ($row = $result->fetch_assoc()) { ?>
                        <div class="container col-md-12 mt-3 mb-3 d-flex justify-content-center">
                            <div class="card" style="min-width: 580px;">
                                <div class="row">
                                    <div class="col-md-4 pe-0 d-flex justify-content-center align-items-center">
                                        <img src="uploads/<?php echo htmlspecialchars($row['company_logo'], ENT_QUOTES, 'UTF-8'); ?>" class="img-fluid p-2 rounded-3" alt="<?php echo htmlspecialchars($row['job_title'], ENT_QUOTES, 'UTF-8'); ?>">
                                    </div>
                                    <div class="col-md-8 ps-1">
                                        <div class="card-body ps-1">
                                            <div class="row">
                                                <div class="col-md-8">
                                                    <h5 class="card-title text-truncate"><?php echo htmlspecialchars($row['job_title'], ENT_QUOTES, 'UTF-8'); ?></h5>
                                                </div>
                                                <div class="col-md-4 d-flex justify-content-end">
                                                    <a href="db/db_edit.php?id=<?php echo $row['id']; ?>" class="btn btn-sm btn-primary me-2">
                                                        <i class="fas fa-edit"></i>
                                                    </a>
                                                    <!-- Button trigger modal for deletion -->
                                                    <a href="#" class="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal" data-href="db/db_delete.php?id=<?php echo $row['id']; ?>">
                                                        <i class="fas fa-trash"></i>
                                                    </a>

                                                    <!-- Modal -->
                                                    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                                                        <div class="modal-dialog">
                                                            <div class="modal-content">
                                                                <div class="modal-header">
                                                                    <h1 class="modal-title fs-5" id="deleteModalLabel">Confirm Deletion</h1>
                                                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                                </div>
                                                                <div class="modal-body">
                                                                    <div class="alert alert-warning" role="alert">
                                                                        <strong>Warning:</strong> This action is irreversible. Once deleted, this item cannot be recovered.
                                                                    </div>
                                                                    Are you sure you want to delete this item?
                                                                </div>
                                                                <div class="modal-footer">
                                                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                                                    <form id="deleteForm" method="POST" action="">
                                                                        <button type="submit" class="btn btn-danger">Delete</button>
                                                                    </form>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        <small class="text-muted text-truncate"><?php echo htmlspecialchars($row['company_name'], ENT_QUOTES, 'UTF-8'); ?></small>
                                        <br>
                                        <p class="card-text mb-0 text-danger">Reason: <?php echo htmlspecialchars($row['rejection_reason'], ENT_QUOTES, 'UTF-8'); ?></p>
                                        <p class="card-text mb-0 text-truncate">Category: <?php echo htmlspecialchars($row['job_category'], ENT_QUOTES, 'UTF-8'); ?></p>
                                        <p class="card-text mb-0 text-truncate">Status: <?php echo htmlspecialchars($row['status'], ENT_QUOTES, 'UTF-8'); ?></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                </div>
            <?php } ?>
        </div>
    <?php } ?>

    <!-- Approved Ads -->
    <?php
    // Approved Ads
    $sql = "SELECT 
                job_ads.id,
                job_ads.company_name, 
                job_ads.company_logo,
                job_ads.job_title, 
                job_categories.category_name AS job_category, 
                locations.location_name AS location, 
                job_ads.application_deadline, 
                job_ads.status
                FROM 
                    job_ads
                LEFT JOIN job_categories ON job_ads.job_category_id = job_categories.id
                LEFT JOIN locations ON job_ads.location_id = locations.id
                WHERE job_ads.recruiter_id = " . $_SESSION['userid'] . " 
                AND job_ads.status = 'approved' 
                ORDER BY job_ads.id DESC";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) { ?>
        <h3>Approved Ads</h3>
        <div class="row p-3">
            <?php while ($row = $result->fetch_assoc()) { ?>
                <div class="container col-md-12 mt-3 mb-3">
                    <div class="card" style="min-width: 580px;">
                        <div class="row">
                            <div class="col-md-4 pe-0 d-flex justify-content-center align-items-center">
                                <img src="uploads/<?php echo htmlspecialchars($row['company_logo'], ENT_QUOTES, 'UTF-8'); ?>" class="img-fluid p-2 rounded-3" alt="<?php echo htmlspecialchars($row['job_title'], ENT_QUOTES, 'UTF-8'); ?>">
                            </div>
                            <div class="col-md-8 ps-1">
                                <div class="card-body ps-1">
                                    <div class="row">
                                        <div class="col-md-8">
                                            <h5 class="card-title text-truncate"><?php echo htmlspecialchars($row['job_title'], ENT_QUOTES, 'UTF-8'); ?></h5>
                                        </div>
                                        <div class="col-md-4 d-flex justify-content-end">
                                            <a href="db/db_view.php?id=<?php echo $row['id']; ?>" class="btn btn-sm btn-success me-2">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="db/db_edit.php?id=<?php echo $row['id']; ?>" class="btn btn-sm btn-primary me-2">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <!-- Button trigger modal for deletion -->
                                            <a href="#" class="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal" data-href="db/db_delete.php?id=<?php echo $row['id']; ?>">
                                                <i class="fas fa-trash"></i>
                                            </a>

                                            <!-- Modal -->
                                            <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                                                <div class="modal-dialog">
                                                    <div class="modal-content">
                                                        <div class="modal-header">
                                                            <h1 class="modal-title fs-5" id="deleteModalLabel">Confirm Deletion</h1>
                                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                        </div>
                                                        <div class="modal-body">
                                                            <div class="alert alert-warning" role="alert">
                                                                <strong>Warning:</strong> This action is irreversible. Once deleted, this item cannot be recovered.
                                                            </div>
                                                            Are you sure you want to delete this item?
                                                        </div>
                                                        <div class="modal-footer">
                                                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                                            <form id="deleteForm" method="POST" action="">
                                                                <button type="submit" class="btn btn-danger">Delete</button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

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
            <?php } ?>
        </div>
    <?php } ?>

    <?php
    // Pending Ads
    $sql = "SELECT 
                job_ads.id,
                job_ads.company_name, 
                job_ads.company_logo,
                job_ads.job_title, 
                job_categories.category_name AS job_category, 
                locations.location_name AS location, 
                employment_types.employment_type AS employment_type, 
                work_arrangements.work_arrangement AS work_arrangement, 
                job_ads.application_deadline, 
                job_ads.status
                FROM 
                    job_ads
                LEFT JOIN job_categories ON job_ads.job_category_id = job_categories.id
                LEFT JOIN locations ON job_ads.location_id = locations.id
                LEFT JOIN employment_types ON job_ads.employment_type_id = employment_types.id
                LEFT JOIN work_arrangements ON job_ads.work_arrangement_id = work_arrangements.id
                WHERE job_ads.recruiter_id = " . $_SESSION['userid'] . " 
                AND job_ads.status = 'pending' 
                ORDER BY job_ads.id DESC";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) { ?>
        <h3>Pending Ads</h3>
        <div class="row">
            <?php while ($row = $result->fetch_assoc()) { ?>
                <div class="container col-md-12 mt-3 mb-3 d-flex justify-content-center">
                    <div class="card" style="min-width: 580px;">
                        <div class="row">
                            <div class="col-md-4 pe-0 d-flex justify-content-center align-items-center">
                                <img src="uploads/<?php echo htmlspecialchars($row['company_logo'], ENT_QUOTES, 'UTF-8'); ?>" class="img-fluid p-2 rounded-3" alt="<?php echo htmlspecialchars($row['job_title'], ENT_QUOTES, 'UTF-8'); ?>">
                            </div>
                            <div class="col-md-8 ps-1">
                                <div class="card-body ps-1">
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
            <?php } ?>
        </div>
    <?php } ?>
    </div>
    <?php
    include_once 'footer.php';
    ?>
    </div>


    <script>
        var deleteModal = document.getElementById('deleteModal');
        deleteModal.addEventListener('show.bs.modal', function(event) {
            var button = event.relatedTarget;
            var href = button.getAttribute('data-href');
            var form = document.getElementById('deleteForm');
            form.setAttribute('action', href);
        });
    </script>


    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

</body>

</html>