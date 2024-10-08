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

</head>


<body>
    <div class="content-wrapper">
        <!-- Navbar -->
        <?php
        include_once 'navbar.php';
        ?>

        <!-- Sign Up -->
        <div class="container signup pt-4 pb-4 ps-4 pe-4">
            <div class="d-flex justify-content-center pb-4">
                <img src="assets/logo/user-icon.png" width="60" height="60" alt="User Icon">
            </div>
            <form action="db/db_signup.php" method="POST" onsubmit="return validatePassword()">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="form-floating">
                            <input type="text" class="form-control" id="firstName" name="first_name" placeholder="First Name" required>
                            <label for="firstName">First Name</label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-floating">
                            <input type="text" class="form-control" id="lastName" name="last_name" placeholder="Last Name" required>
                            <label for="lastName">Last Name</label>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="form-floating">
                        <input type="text" class="form-control" id="phone_number" name="phone_number" placeholder="Phone Number" required>
                        <label for="phone_number">Phone Number</label>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="form-floating">
                        <input type="email" class="form-control" id="email" name="email" placeholder="Email address" required>
                        <label for="email">Email address</label>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="form-floating">
                        <input type="password" class="form-control" id="password" name="password" placeholder="Password" required>
                        <label for="password">Password</label>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="form-floating">
                        <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" required>
                        <label for="confirmPassword">Confirm Password</label>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary d-block mx-auto mb-2">Sign up</button>
                <p class="text-center">Already have an account? <a href="login.php" class="text-decoration-underline text-primary">Login</a></p>
            </form>
        </div>


        <?php
        include_once 'social.php';
        ?>
    </div>

    <script>
        function validatePassword() {
            var password = document.getElementById('password').value;
            var confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match. Please try again.');
                return false; // Prevent form submission
            }

            return true; // Allow form submission
        }
    </script>

    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>

</html>