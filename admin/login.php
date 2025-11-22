<?php
session_start();

/**
 * Config básica
 * Cambia estas credenciales a algo seguro.
 */
const ADMIN_USER = 'admin';
const ADMIN_PASS = '123456';

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    header('Location: upload.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = $_POST['username'] ?? '';
    $pass = $_POST['password'] ?? '';

    if ($user === ADMIN_USER && $pass === ADMIN_PASS) {
        $_SESSION['logged_in'] = true;
        header('Location: upload.php');
        exit;
    } else {
        $error = 'Usuario o contraseña incorrectos.';
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Login Admin Catálogo</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body{
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background:#f5f5f5;
            display:flex;
            align-items:center;
            justify-content:center;
            min-height:100vh;
            margin:0;
        }
        .card{
            background:#fff;
            padding:2rem;
            border-radius:12px;
            box-shadow:0 10px 30px rgba(0,0,0,0.08);
            max-width:360px;
            width:100%;
        }
        h1{
            margin-top:0;
            font-size:1.5rem;
            text-align:center;
        }
        .field{
            margin-bottom:1rem;
        }
        label{
            display:block;
            margin-bottom:0.25rem;
            font-size:0.9rem;
        }
        input[type="text"],
        input[type="password"]{
            width:100%;
            padding:0.5rem 0.75rem;
            border-radius:8px;
            border:1px solid #ccc;
            font-size:0.95rem;
        }
        button{
            width:100%;
            padding:0.6rem;
            border:none;
            border-radius:999px;
            font-size:1rem;
            cursor:pointer;
            background:#111827;
            color:#fff;
        }
        .error{
            background:#fee2e2;
            color:#b91c1c;
            padding:0.5rem 0.75rem;
            border-radius:8px;
            font-size:0.85rem;
            margin-bottom:1rem;
        }
    </style>
</head>
<body>
<div class="card">
    <h1>Admin Catálogo</h1>

    <?php if ($error): ?>
        <div class="error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <form method="post" action="">
        <div class="field">
            <label for="username">Usuario</label>
            <input type="text" name="username" id="username" required>
        </div>

        <div class="field">
            <label for="password">Contraseña</label>
            <input type="password" name="password" id="password" required>
        </div>

        <button type="submit">Entrar</button>
    </form>
</div>
</body>
</html>
