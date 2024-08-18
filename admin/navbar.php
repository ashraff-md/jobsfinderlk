<nav class="navbar navbar-expand-lg" style="background-color: #0c1538;">
    <div class="container mt-1 mb-1">
        <a class="navbar-brand" href="../index.php">
            <img src="../assets/logo/logo.png" alt="JobsFinder.lk" height="34">
        </a>
        <div class="d-flex">
            <button class="navbar-toggler" style="background-color: #0c1538;" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link text-white me-4">
                            <?php echo $_SESSION['adminloggedin']; ?>
                        </a>
                    </li>
                    <li class="nav-item dropdown">
                        <button class="nav-link dropdown-toggle text-white me-4" role="button" data-bs-toggle="dropdown" data-bs-hover="true" aria-expanded="false">
                            Banner
                        </button>
                        <ul class="dropdown-menu text-white" style="background-color: #0c1538;">
                            <li class="text-white"><a class="dropdown-item text-white" href="pendingads.php">Add Banner</a></li>
                        </ul>
                    </li>
                    <li class="nav-item dropdown">
                        <button class="nav-link dropdown-toggle text-white me-4" role="button" data-bs-toggle="dropdown" data-bs-hover="true" aria-expanded="false">
                            Ads
                        </button>
                        <ul class="dropdown-menu text-white" style="background-color: #0c1538;">
                            <li class="text-white"><a class="dropdown-item text-white" href="pendingads.php">Pending Ads</a></li>
                            <li class="text-white"><a class="dropdown-item text-white" href="approvedads.php">Approved Ads</a></li>
                            <li class="text-white"><a class="dropdown-item text-white" href="rejectedads.php">Rejected Ads</a></li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link text-white me-4" href="../db/db_logout.php">Logout</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</nav><br><br>