<?php
session_start();

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

// Logout rápido con ?logout=1
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: login.php');
    exit;
}

/**
 * Rutas base en función de la estructura:
 * raíz
 *  ├─ /data/automotive.json, industrial.json
 *  └─ /uploads/img/automotriz, /uploads/img/industrial
 *      /uploads/pdf/automotriz, /uploads/pdf/industrial
 */
$rootDir       = dirname(__DIR__);           // sube de /admin a raíz
$dataDir       = $rootDir . '/data/';
$uploadsImgDir = $rootDir . '/uploads/img/';
$uploadsPdfDir = $rootDir . '/uploads/pdf/';

$messages = [];

/**
 * Helper para sanitizar nombres de archivo.
 */
function sanitize_filename($filename) {
    // Nos quedamos sólo con nombre base
    $filename = basename($filename);
    // Reemplaza caracteres raros por _
    $filename = preg_replace('/[^A-Za-z0-9._-]/', '_', $filename);
    return $filename;
}

/**
 * Manejo de formularios
 */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // 1) Sobrescribir automotive.json
    if ($action === 'upload_automotive_json') {
        if (isset($_FILES['automotive_json']) && $_FILES['automotive_json']['error'] === UPLOAD_ERR_OK) {
            $tmp  = $_FILES['automotive_json']['tmp_name'];
            $name = $_FILES['automotive_json']['name'];
            $ext  = strtolower(pathinfo($name, PATHINFO_EXTENSION));

            if ($ext !== 'json') {
                $messages[] = 'El archivo de catálogo automotriz debe ser .json';
            } else {
                $dest = $dataDir . 'automotive.json';
                if (move_uploaded_file($tmp, $dest)) {
                    $messages[] = 'automotive.json actualizado correctamente.';
                } else {
                    $messages[] = 'Error al mover automotive.json al directorio /data.';
                }
            }
        } else {
            $messages[] = 'No se recibió archivo para automotive.json.';
        }
    }

    // 2) Sobrescribir industrial.json
    if ($action === 'upload_industrial_json') {
        if (isset($_FILES['industrial_json']) && $_FILES['industrial_json']['error'] === UPLOAD_ERR_OK) {
            $tmp  = $_FILES['industrial_json']['tmp_name'];
            $name = $_FILES['industrial_json']['name'];
            $ext  = strtolower(pathinfo($name, PATHINFO_EXTENSION));

            if ($ext !== 'json') {
                $messages[] = 'El archivo de catálogo industrial debe ser .json';
            } else {
                $dest = $dataDir . 'industrial.json';
                if (move_uploaded_file($tmp, $dest)) {
                    $messages[] = 'industrial.json actualizado correctamente.';
                } else {
                    $messages[] = 'Error al mover industrial.json al directorio /data.';
                }
            }
        } else {
            $messages[] = 'No se recibió archivo para industrial.json.';
        }
    }

    // 3) Subir imágenes (nuevos archivos)
    if ($action === 'upload_images') {
        $categoria = $_POST['img_categoria'] ?? '';
        if (!in_array($categoria, ['automotriz', 'industrial'], true)) {
            $messages[] = 'Categoría de imágenes inválida.';
        } else {
            if (!empty($_FILES['images']['name'][0])) {
                $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
                $targetBase = $uploadsImgDir . $categoria . '/';

                foreach ($_FILES['images']['name'] as $i => $name) {
                    if ($_FILES['images']['error'][$i] !== UPLOAD_ERR_OK) {
                        continue;
                    }
                    $tmp = $_FILES['images']['tmp_name'][$i];
                    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));

                    if (!in_array($ext, $allowed, true)) {
                        $messages[] = "Archivo de imagen '$name' ignorado (extensión no permitida).";
                        continue;
                    }

                    $cleanName = sanitize_filename($name);
                    $dest = $targetBase . $cleanName;

                    if (move_uploaded_file($tmp, $dest)) {
                        $messages[] = "Imagen '$cleanName' subida correctamente a /uploads/img/$categoria.";
                    } else {
                        $messages[] = "Error al subir la imagen '$cleanName'.";
                    }
                }
            } else {
                $messages[] = 'No se seleccionaron imágenes.';
            }
        }
    }

    // 4) Subir PDFs (nuevos archivos)
    if ($action === 'upload_pdfs') {
        $categoria = $_POST['pdf_categoria'] ?? '';
        if (!in_array($categoria, ['automotriz', 'industrial'], true)) {
            $messages[] = 'Categoría de PDFs inválida.';
        } else {
            if (!empty($_FILES['pdfs']['name'][0])) {
                $allowed = ['pdf'];
                $targetBase = $uploadsPdfDir . $categoria . '/';

                foreach ($_FILES['pdfs']['name'] as $i => $name) {
                    if ($_FILES['pdfs']['error'][$i] !== UPLOAD_ERR_OK) {
                        continue;
                    }
                    $tmp = $_FILES['pdfs']['tmp_name'][$i];
                    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));

                    if (!in_array($ext, $allowed, true)) {
                        $messages[] = "Archivo '$name' ignorado (debe ser PDF).";
                        continue;
                    }

                    $cleanName = sanitize_filename($name);
                    $dest = $targetBase . $cleanName;

                    if (move_uploaded_file($tmp, $dest)) {
                        $messages[] = "PDF '$cleanName' subido correctamente a /uploads/pdf/$categoria.";
                    } else {
                        $messages[] = "Error al subir el PDF '$cleanName'.";
                    }
                }
            } else {
                $messages[] = 'No se seleccionaron PDFs.';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Administrador de archivos – Catálogo</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" rel="stylesheet">

    <link href="../assets/css/main.css" rel="stylesheet">
    <link href="css/admin.css" rel="stylesheet">

</head>
<body>
<div class="wrapper">

    <header data-bs-theme="dark">
        
        <div class="navbar navbar-dark bg-dark shadow-sm">
            <div class="container">
                <a href="/" class="navbar-brand d-flex align-items-center d-online-block">
                    <strong class="d-none">DDVR</strong>
                </a>
                <a class="logout" href="?logout=1">Cerrar sesión</a>
                <button id="btn-about" class="navbar-toggler collapsed pe-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarHeader" aria-controls="navbarHeader" aria-expanded="false" aria-label="Toggle navigation">
                    <span>Somos DDVR</span><i class="bi bi-arrow-up-short ms-2"></i>
                </button>
            </div>
        </div>
    </header>
    <header>
        <h1>Panel de administración del catálogo</h1>
        <a class="logout" href="?logout=1">Cerrar sesión</a>
    </header>

    <?php if (!empty($messages)): ?>
        <div class="messages">
            <?php foreach ($messages as $m): ?>
                <div class="msg"><?= htmlspecialchars($m) ?></div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>

    <div class="grid">

        <!-- 1. Subir /data/automotive.json -->
        <div class="card">
            <h2>Actualizar catálogo automotriz (JSON)</h2>
            <p>Este archivo pisará <code>/data/automotive.json</code>.</p>
            <form method="post" enctype="multipart/form-data">
                <input type="hidden" name="action" value="upload_automotive_json">
                <div class="field">
                    <label for="automotive_json">Archivo automotive.json</label>
                    <input type="file" name="automotive_json" id="automotive_json" accept=".json" required>
                    <small>Debes subir un archivo .json con la estructura correcta.</small>
                </div>
                <button type="submit">Subir automotive.json</button>
            </form>
        </div>

        <!-- 2. Subir /data/industrial.json -->
        <div class="card">
            <h2>Actualizar catálogo industrial (JSON)</h2>
            <p>Este archivo pisará <code>/data/industrial.json</code>.</p>
            <form method="post" enctype="multipart/form-data">
                <input type="hidden" name="action" value="upload_industrial_json">
                <div class="field">
                    <label for="industrial_json">Archivo industrial.json</label>
                    <input type="file" name="industrial_json" id="industrial_json" accept=".json" required>
                    <small>Debes subir un archivo .json con la estructura correcta.</small>
                </div>
                <button type="submit">Subir industrial.json</button>
            </form>
        </div>

        <!-- 3. Subir imágenes -->
        <div class="card">
            <h2>Subir imágenes de productos</h2>
            <p>Se guardan en <code>/uploads/img/automotriz</code> o <code>/uploads/img/industrial</code>.</p>
            <form method="post" enctype="multipart/form-data">
                <input type="hidden" name="action" value="upload_images">
                <div class="field">
                    <label for="img_categoria">Categoría</label>
                    <select name="img_categoria" id="img_categoria" required>
                        <option value="">Selecciona...</option>
                        <option value="automotriz">Automotriz</option>
                        <option value="industrial">Industrial</option>
                    </select>
                </div>
                <div class="field">
                    <label for="images">Imágenes (puedes seleccionar varias)</label>
                    <input type="file" name="images[]" id="images" accept=".jpg,.jpeg,.png,.webp,.gif" multiple required>
                    <small>Extensiones permitidas: jpg, jpeg, png, webp, gif.</small>
                </div>
                <button type="submit">Subir imágenes</button>
            </form>
        </div>

        <!-- 4. Subir PDFs -->
        <div class="card">
            <h2>Subir fichas técnicas (PDF)</h2>
            <p>Se guardan en <code>/uploads/pdf/automotriz</code> o <code>/uploads/pdf/industrial</code>.</p>
            <form method="post" enctype="multipart/form-data">
                <input type="hidden" name="action" value="upload_pdfs">
                <div class="field">
                    <label for="pdf_categoria">Categoría</label>
                    <select name="pdf_categoria" id="pdf_categoria" required>
                        <option value="">Selecciona...</option>
                        <option value="automotriz">Automotriz</option>
                        <option value="industrial">Industrial</option>
                    </select>
                </div>
                <div class="field">
                    <label for="pdfs">PDFs (puedes seleccionar varios)</label>
                    <input type="file" name="pdfs[]" id="pdfs" accept=".pdf" multiple required>
                    <small>Sólo se permiten archivos .pdf.</small>
                </div>
                <button type="submit">Subir PDFs</button>
            </form>
        </div>

    </div>
</div>
</body>
</html>
