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
        table {
            width: 100%;
            border-collapse: collapse;
        }

        table,
        th,
        td {
            border: 1px solid black;
        }

        th,
        td {
            padding: 10px;
            text-align: left;
        }

        body {
            background-color: rgb(228, 228, 228);
        }


        @media only screen and (max-width: 768px) {
            /* For mobile phones: */

            .adForm {
                min-width: 250px;
                max-width: 350px;
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



    <br><br><br>
    <!-- Form -->
    <div class="container">
        <h1>Dashboard</h1>
        <p><?php echo $_SESSION['userloggedin']; ?></p>
        <?php
        // Database connection
        include_once 'db/db_config.php';

        // SQL query to join tables
        $sql = "SELECT 
            job_ads.company_name, 
            job_ads.company_logo, 
            job_ads.job_description, 
            job_ads.job_title, 
            job_categories.category_name AS job_category, 
            locations.location_name AS location, 
            employment_types.employment_type AS employment_type, 
            work_arrangements.work_arrangement AS work_arrangement, 
            qualifications.qualification_name AS qualification, 
            experience_levels.experience_level AS experience, 
            job_ads.salary, 
            job_ads.application_deadline, 
            job_ads.status
            FROM 
                job_ads
            LEFT JOIN job_categories ON job_ads.job_category_id = job_categories.id
            LEFT JOIN locations ON job_ads.location_id = locations.id
            LEFT JOIN employment_types ON job_ads.employment_type_id = employment_types.id
            LEFT JOIN work_arrangements ON job_ads.work_arrangement_id = work_arrangements.id
            LEFT JOIN qualifications ON job_ads.qualification_id = qualifications.id
            LEFT JOIN experience_levels ON job_ads.experience_id = experience_levels.id

            WHERE job_ads.recruiter_id = " . $_SESSION['userid'] . " AND job_ads.status = 'pending' 
            ORDER BY job_ads.id DESC";

        $result = $conn->query($sql);
        ?>
        <h2>Job Listings</h2>

        <table>
            <tr>
                <th>Company Name</th>
                <th>Company Logo</th>
                <th>Job Description</th>
                <th>Job Title</th>
                <th>Job Category</th>
                <th>Location</th>
                <th>Employment Type</th>
                <th>Work Arrangement</th>
                <th>Qualification</th>
                <th>Experience</th>
                <th>Salary</th>
                <th>Application Deadline</th>
                <th>Status</th>
            </tr>
            <?php
            if ($result->num_rows > 0) {
                // Output data of each row
                while ($row = $result->fetch_assoc()) {
                    echo "<tr>";
                    echo "<td>" . $row['company_name'] . "</td>";
                    echo "<td><img src='" . $row['company_logo'] . "' alt='Company Logo' style='width:100px;'></td>";
                    echo "<td>" . $row['job_description'] . "</td>";
                    echo "<td>" . $row['job_title'] . "</td>";
                    echo "<td>" . $row['job_category'] . "</td>";
                    echo "<td>" . $row['location'] . "</td>";
                    echo "<td>" . $row['employment_type'] . "</td>";
                    echo "<td>" . $row['work_arrangement'] . "</td>";
                    echo "<td>" . $row['qualification'] . "</td>";
                    echo "<td>" . $row['experience'] . "</td>";
                    echo "<td>" . $row['salary'] . "</td>";
                    echo "<td>" . $row['application_deadline'] . "</td>";
                    echo "<td>" . $row['status'] . "</td>";
                    echo "</tr>";
                }
            } else {
                echo "<tr><td colspan='13'>No jobs found</td></tr>";
            }
            ?>
        </table>

</body>

</html>

<?php
$conn->close();
?>

</div>


<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>

</html>