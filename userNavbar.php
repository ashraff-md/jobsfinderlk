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
                        <a class="nav-link text-white me-4" href="editprofile.php">
                            <?php echo $_SESSION['userloggedin']; ?>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link text-white me-4" aria-current="page" href="dashboard.php">Home</a>
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
</nav><br><br>