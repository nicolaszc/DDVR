<?php
session_start();

$credFile = __DIR__ . '/credentials.txt';

// Si no existe el archivo, se crea un usuraio y contraseña por defecto
if (!file_exists($credFile)) {
    file_put_contents($credFile, "admin:123456");
}

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    header('Location: upload.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = trim($_POST['username'] ?? '');
    $pass = trim($_POST['password'] ?? '');

    // Leer credenciales desde credentials.txt
    $line = trim(file_get_contents($credFile));
    list($storedUser, $storedPass) = explode(':', $line);

    if ($user === $storedUser && $pass === $storedPass) {
        $_SESSION['logged_in'] = true;
        header('Location: upload.php');
        exit;
    } else {
        $error = 'Usuario o contraseña incorrectos';
    }
}

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Login Admin Catálogo</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#712cf9" />
    <!-- Favicon -->
    <link id="icon-at" rel="apple-touch-icon" href="../assets/img/ico.png" sizes="180x180">
    <link id="icon-lg" rel="icon" href="../assets/img/ico.png" sizes="32x32" type="image/png">
    <link id="icon-sm" rel="icon" href="../assets/img/ico.png" sizes="16x16" type="image/png">

    <!-- Color Mode Script -->
    <script type="text/javascript" src="../components/js/color-modes.js"></script>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" rel="stylesheet">

    <link href="../assets/css/main.css" rel="stylesheet">
    <link href="css/admin.css" rel="stylesheet">

</head>
<body>
<main class="bg-body-tertiary py-5 login d-flex align-items-center">
    <div class="container"> 
        <div class="row"> 

            <div class="col-md-6 offset-md-3 mt-5 text-center">
                <span class="navbar-brand d-block m-auto">
                    <strong class="d-none">DDVR</strong>
                </span>
            </div>

            <div class="col-md-4 offset-md-4 d-flex justify-content-center mt-2 mb-5">
                
                <div class="card shadow mb-2 h-100 d-flex flex-column rounded overflow-hidden card-ddvr">
                    <div data-bs-theme="dark" class="bg-dark card-body d-flex flex-column py-4">
                    <h4 class="text-center">Panel de administración</h4>

                    <?php if ($error): ?>
                        <div class="messages container mb-0"></div>
                    <?php endif; ?>

                        <form method="post" action="">
                            <div class="field">
                                <label for="username" class="ms-0">Usuario</label>
                                <input type="text" name="username" id="username" class="form-control" required>
                            </div>

                            <div class="field">
                                <label for="password" class="ms-0">Contraseña</label>
                                <input type="password" name="password" id="password" class="form-control" required>
                            </div>

                            <button type="submit" class="btn btn-primary btn-ddvr my-2 py-2 px-4">Entrar<i class="bi bi-box-arrow-in-right ms-2"></i></button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

 <footer  data-bs-theme="dark" class="bg-dark text-body-secondary pt-5">
    <div class="container">
            <div class="row">
            <div class="col-12 d-flex justify-content-center mt-5 mb-2">
                <small class="mt-3 mb-0">© 2025 DVR Distribuidora</small>
            </div>
        </div>
    </div>
</footer>

<!-- Scripts -->
<script src="../assets/js/lib/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
</body>
</html>
