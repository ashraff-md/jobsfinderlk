<!doctype html>
<html lang="en">

<?php
session_start();
if (!isset($_SESSION['adminloggedin'])) {
    header('Location: login.php');
    exit();
}

// Include your database connection
include_once '../db/db_config.php';

// Set the number of ads per page
$adsPerPage = 20;

// Get the current page number
$currentPage = isset($_GET['page']) ? (int)$_GET['page'] : 1;

// Calculate the offset for the SQL query
$offset = ($currentPage - 1) * $adsPerPage;

// SQL query to select approved ads with joined tables for location and category
$sql = "SELECT 
            job_ads.id,
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
            job_ads.status = 'approved'
        LIMIT $offset, $adsPerPage";

$result = $conn->query($sql);

// Get the total number of ads
$totalAdsSql = "SELECT COUNT(*) as total_ads FROM job_ads WHERE status = 'approved'";
$totalAdsResult = $conn->query($totalAdsSql);
$totalAds = $totalAdsResult->fetch_assoc()['total_ads'];

// Calculate the total number of pages
$totalPages = ceil($totalAds / $adsPerPage);

?>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="../assets/logo/solo-logo.png">

    <title>Jobs Finder | Approved Ads</title>

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">

    <!-- CSS -->
    <link rel="stylesheet" href="style.css">

    <!-- Poppins Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
</head>

<body>
    <div class="content-wrapper">
        <!-- Navbar -->
        <?php include_once 'navbar.php'; ?>

        <div class="container">
            <h1 class="text-center">Approved Ads</h1>

            <?php if ($result->num_rows > 0): ?>

                <table class="table table-striped mt-3 mb-3">
                    <thead>
                        <tr>
                            <th>Company Logo</th>
                            <th>Job Title</th>
                            <th>Company Name</th>
                            <th>Location</th>
                            <th>Category</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th colspan="2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php while ($row = $result->fetch_assoc()): ?>
                            <tr>
                                <td class="text-center">
                                    <img src="../uploads/<?php echo htmlspecialchars($row['company_logo'], ENT_QUOTES, 'UTF-8'); ?>" width="50" height="50" alt="Company Logo">
                                </td>
                                <td><?php echo htmlspecialchars($row['job_title'], ENT_QUOTES, 'UTF-8'); ?></td>
                                <td><?php echo htmlspecialchars($row['company_name'], ENT_QUOTES, 'UTF-8'); ?></td>
                                <td><?php echo htmlspecialchars($row['location'], ENT_QUOTES, 'UTF-8'); ?></td>
                                <td><?php echo htmlspecialchars($row['job_category'], ENT_QUOTES, 'UTF-8'); ?></td>
                                <td><?php echo htmlspecialchars($row['application_deadline'], ENT_QUOTES, 'UTF-8'); ?></td>
                                <td><?php echo htmlspecialchars($row['status'], ENT_QUOTES, 'UTF-8'); ?></td>
                                <td class="text-center">
                                    <a href="editad.php?id=<?php echo $row['id']; ?>" class="btn btn-sm btn-success me-2">
                                        <i class="fas fa-eye"></i> View
                                    </a>
                                </td>
                                <td>
                                    <a href="editad.php?id=<?php echo $row['id']; ?>" class="btn btn-sm btn-primary me-2">
                                        <i class="fas fa-edit"></i> Edit
                                    </a>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>

                <!-- Pagination links -->
                <nav aria-label="Page navigation">
                    <ul class="pagination justify-content-center">
                        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                            <li class="page-item <?php echo ($i == $currentPage) ? 'active' : ''; ?>">
                                <a class="page-link" href="?page=<?php echo $i; ?>"><?php echo $i; ?></a>
                            </li>
                        <?php endfor; ?>
                    </ul>
                </nav>

            <?php else: ?>
                <p class="text-center">No approved ads found.</p>
            <?php endif; ?>

            <?php $conn->close(); ?>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>

</html>