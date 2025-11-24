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

// Sobrescritura credentials.txt 

// Archivo donde se guardan las credenciales del login
$credFile = __DIR__ . '/credentials.txt';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'change_credentials') {
    $newUser = trim($_POST['new_username'] ?? '');
    $newPass = trim($_POST['new_password'] ?? '');

    if ($newUser === '' || $newPass === '') {
        $msg = 'Usuario y contraseña no pueden estar vacíos.';
    } else {
        // Formato usuario:password, pisando el txt anterior
        $newLine = $newUser . ':' . $newPass;
        if (file_put_contents($credFile, $newLine, LOCK_EX) !== false) {
            $msg = 'Credenciales actualizadas correctamente.';
        } else {
            $msgxx = 'Error al guardar las nuevas credenciales.';
        }
    }
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
$success = '<div class="d-flex justify-content-center align-items-center alert alert-success mt-5 mb-0 text-center alert-dismissible fade show" role="alert"><i class="bi bi-check-circle-fill me-2"></i>Catálogo actualizado correctamente.! <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
$error = '<div class="d-flex justify-content-center align-items-center alert alert-danger mt-5 mb-0 text-center alert-dismissible fade show" role="alert"><i class="bi bi-x-octagon-fill me-2"></i>Error actualizando el catálogo. <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
$no_file = '<div class="d-flex justify-content-center align-items-center alert alert-warning mt-5 mb-0 text-center alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-triangle-fill me-2"></i>No se seleccionaron archivos. <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
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
if ($_SERVER['REQUEST_METHOD'] === 'POST' && (($_POST['action'] ?? '') !== 'change_credentials')) {
    $action = $_POST['action'] ?? '';
    
    // 1) Sobrescribir automotive.json
    if ($action === 'upload_automotive_json') {
        if (isset($_FILES['automotive_json']) && $_FILES['automotive_json']['error'] === UPLOAD_ERR_OK) {
            $tmp  = $_FILES['automotive_json']['tmp_name'];
            $name = $_FILES['automotive_json']['name'];
            $ext  = strtolower(pathinfo($name, PATHINFO_EXTENSION));

            if ($ext !== 'json') {
                $messages[] = '<div class="d-flex justify-content-center align-items-center alert alert-warning mt-5 mb-0 text-center alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-triangle-fill me-2"></i>El archivo de catálogo automotriz debe ser .json</div>';
            } else {
                $dest = $dataDir . 'automotive.json';
                if (move_uploaded_file($tmp, $dest)) {
                    $messages[] = $success;
                } else {
                    $messages[] = $error;
                }
            }
        } else {
            $messages[] = $no_file;
        }
    }

    // 2) Sobrescribir industrial.json
    if ($action === 'upload_industrial_json') {
        if (isset($_FILES['industrial_json']) && $_FILES['industrial_json']['error'] === UPLOAD_ERR_OK) {
            $tmp  = $_FILES['industrial_json']['tmp_name'];
            $name = $_FILES['industrial_json']['name'];
            $ext  = strtolower(pathinfo($name, PATHINFO_EXTENSION));

            if ($ext !== 'json') {
                $messages[] = '<div class="d-flex justify-content-center align-items-center alert alert-warning mt-5 mb-0 text-center alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-triangle-fill me-2"></i>El archivo de catálogo industrial debe ser .json</div>';
            } else {
                $dest = $dataDir . 'industrial.json';
                if (move_uploaded_file($tmp, $dest)) {
                    $messages[] = $success;
                } else {
                    $messages[] = $error;
                }
            }
        } else {
            $messages[] = $no_file;
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
                        $messages[] = '<div class="d-flex justify-content-center align-items-center alert alert-warning mt-5 mb-0 text-center alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-triangle-fill me-2"></i>Archivo '.$name.' ignorado (extensión no permitida).</div>';
                        continue;
                    }

                    $cleanName = sanitize_filename($name);
                    $dest = $targetBase . $cleanName;

                    if (move_uploaded_file($tmp, $dest)) {
                        $messages[] = $success;
                    } else {
                        $messages[] = $error;
                    }
                }
            } else {
                $messages[] = $no_file;
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
                        $messages[] = '<div class="d-flex justify-content-center align-items-center alert alert-warning mt-5 mb-0 text-center alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-triangle-fill me-2"></i>Archivo '.$name.' ignorado (debe ser PDF).</div>';
                        continue;
                    }

                    $cleanName = sanitize_filename($name);
                    $dest = $targetBase . $cleanName;

                    if (move_uploaded_file($tmp, $dest)) {
                        $messages[] = $success;
                    } else {
                        $messages[] = $error;
                    }
                }
            } else {
                $messages[] = $no_file;
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es" data-bs-theme="dark">
<head>
    <meta charset="UTF-8">
    <title>DDVR</title>
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
<body class="bg-body-tertiary">

    <header data-bs-theme="dark">
       
        <div class="navbar navbar-dark bg-dark shadow-sm">
            <div class="container">
                <span class="navbar-brand d-flex align-items-center">
                    <strong class="d-none">DDVR</strong>
                </span>
                <div class="actions d-flex align-items-center">
                    <a class="btn btn-pass d-flex align-items-center"href="#"data-bs-toggle="modal"data-bs-target="#changeCredsModal"><span>Password</span><i class="bi bi-key ms-2 fs-4 lh-1"></i></a>
                <span class="px-4">|</span>
                <a class="logout navbar-toggler pe-0" href="?logout=1"><span>Cerrar sesión</span><i class="bi bi-box-arrow-right ms-2"></i></a>
                </div>
            </div>
        </div>

    </header>

    <!-- Moda cambio contraseña -->
    <div class="modal fade" id="changeCredsModal" tabindex="-1" aria-labelledby="changeCredsLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
        <form method="post" action="upload.php">
            <input type="hidden" name="action" value="change_credentials">

            <div class="modal-header">
            <h5 class="modal-title" id="changeCredsLabel">Cambiar credenciales de acceso</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
            <div class="mb-3">
                <label class="form-label">Nuevo usuario</label>
                <input type="text" name="new_username" class="form-control" required>
            </div>

            <div class="mb-3">
                <label class="form-label">Nueva contraseña</label>
                <input type="password" name="new_password" class="form-control" required>
            </div>
            </div>

            <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar cambios</button>
            </div>

        </form>
        </div>
    </div>
    </div>

 

    <?php if (!empty($messages)): ?>
        <div class="messages container mb-0">
            <?php foreach ($messages as $m): ?>
                <?= $m ?>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>

    <main class="bg-body-tertiary py-5">
        <div class="container"> 
            <div class="row">    
                <h1 class="fs-3 mb-3">Panel de administración</h1>

                <!-- 1. Subir /data/automotive.json -->
                <div class="col-md-6 mb-4">
                    <div class="card shadow card-ddvr mb-2 h-100 d-flex flex-column rounded overflow-hidden">
                        <div data-bs-theme="dark" class="bg-dark card-body d-flex flex-column py-4">
                            <div class="d-flex justify-content-between align-items-center w-100 mb-2">
                                <h4 class="mb-0 lh-1">Actualizar catálogo automotriz</h4>
                                <a href="../data/automotive.json" download>
                                    <i class="bi bi-download fs-5 lh-1"></i>
                                </a>
                            </div>
                            <p>Este archivo reemplazara el actual <code>automotive.json</code>.</p>
                            <form class="js-upload-form" method="post" enctype="multipart/form-data" novalidate>
                                <input type="hidden" name="action" value="upload_automotive_json">
                                <div class="field">
                                    <input type="file"
                                        class="form-control w-50"
                                        name="automotive_json"
                                        id="automotive_json"
                                        accept=".json"
                                        required>
                                    <small class="help-text d-block mt-2">
                                        * Debes subir un archivo .json con la estructura correcta.
                                    </small>
                                </div>
                                <button type="submit" class="btn btn-primary btn-ddvr my-2 py-2 px-4">
                                    Subir automotive.json<i class="bi bi-upload ms-2"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- 2. Subir /data/industrial.json -->
                <div class="col-md-6 mb-4">
                    <div class="card shadow card-ddvr mb-2 h-100 d-flex flex-column rounded overflow-hidden">
                        <div data-bs-theme="dark" class="bg-dark card-body d-flex flex-column py-4">
                            <div class="d-flex justify-content-between align-items-center w-100 mb-2">   
                                <h4>Actualizar catálogo industrial</h4>
                                <a href="../data/industrial.json" download>
                                    <i class="bi bi-download fs-5 lh-1"></i>
                                </a>
                            </div>
                            <p>Este archivo reemplazara el actual <code>industrial.json</code>.</p>
                            <form class="js-upload-form" method="post" enctype="multipart/form-data" novalidate>
                                <input type="hidden" name="action" value="upload_industrial_json">
                                <div class="field">
                                    <input type="file"
                                        class="form-control w-50"
                                        name="industrial_json"
                                        id="industrial_json"
                                        accept=".json"
                                        required>
                                    <small class="help-text d-block mt-2">
                                        * Debes subir un archivo .json con la estructura correcta.
                                    </small>
                                </div>
                                <button type="submit" class="btn btn-primary btn-ddvr my-2 py-2 px-4">
                                    Subir industrial.json<i class="bi bi-upload ms-2"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- 3. Subir imágenes -->
                <div class="col-md-6 mb-4">
                    <div class="card shadow card-ddvr mb-2 h-100 d-flex flex-column rounded overflow-hidden">
                        <div data-bs-theme="dark" class="bg-dark card-body d-flex flex-column py-4">
                            <h4>Subir imágenes de productos</h4>
                            <p>Se guardan en <code>/uploads/img/automotriz</code> o <code>/uploads/img/industrial</code>.</p>
                            <form class="js-upload-form" method="post" enctype="multipart/form-data" novalidate>
                                <input type="hidden" name="action" value="upload_images">
                                <div class="field">
                                    <select class="form-select pe-5 w-50"
                                            name="img_categoria"
                                            id="img_categoria"
                                            required>
                                        <option value="">Selecciona Categoría...</option>
                                        <option value="automotriz">Automotriz</option>
                                        <option value="industrial">Industrial</option>
                                    </select>
                                </div>
                                <div class="field">
                                    <input type="file"
                                        class="form-control w-50"
                                        name="images[]"
                                        id="images"
                                        accept=".jpg,.jpeg,.png,.webp,.gif"
                                        multiple
                                        required>
                                    <small class="help-text d-block mt-2">
                                        * Extensiones permitidas: jpg, jpeg, png, webp, gif.
                                    </small>
                                </div>
                                <button type="submit"  class="btn btn-primary btn-ddvr my-2 py-2 px-4">
                                    Subir imágenes<i class="bi bi-upload ms-2"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- 4. Subir PDFs -->
                <div class="col-md-6 mb-4">
                    <div class="card shadow card-ddvr mb-2 h-100 d-flex flex-column rounded overflow-hidden">
                        <div data-bs-theme="dark" class="bg-dark card-body d-flex flex-column py-4">
                            <h4>Subir fichas técnicas</h4>
                            <p>Se guardan en <code>/uploads/pdf/automotriz</code> o <code>/uploads/pdf/industrial</code>.</p>
                            <form class="js-upload-form" method="post" enctype="multipart/form-data" novalidate>
                                <input type="hidden" name="action" value="upload_pdfs">
                                <div class="field">
                                    <select class="form-select pe-5 w-50"
                                            name="pdf_categoria"
                                            id="pdf_categoria"
                                            required>
                                        <option value="">Selecciona Categoría...</option>
                                        <option value="automotriz">Automotriz</option>
                                        <option value="industrial">Industrial</option>
                                    </select>
                                </div>
                                <div class="field">
                                    <input type="file"
                                        class="form-control w-50"
                                        name="pdfs[]"
                                        id="pdfs"
                                        accept=".pdf"
                                        multiple
                                        required>
                                    <small class="help-text d-block mt-2">
                                        * Sólo se permiten archivos .pdf.
                                    </small>
                                </div>
                                <button type="submit"  class="btn btn-primary btn-ddvr my-2 py-2 px-4">
                                    Subir PDFs<i class="bi bi-upload ms-2"></i>
                                </button>
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
<script src="js/upload-validation.js"></script>

</body>
</html>
