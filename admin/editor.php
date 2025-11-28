<?php
session_start();

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header('Location: index.php');
    exit;
}

// Logout rápido con ?logout=1
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: index.php');
    exit;
}
// admin/editor.php

// Ruta a /data
$dataDir = realpath(__DIR__ . '/../data') . DIRECTORY_SEPARATOR;
$backupDir = $dataDir . 'backups' . DIRECTORY_SEPARATOR;
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0775, true);
}

// Archivos válidos
$validFiles = [
    'automotive' => 'automotive.json',
    'industrial' => 'industrial.json',
];

$fileKey = $_GET['file'] ?? 'automotive';
if (!isset($validFiles[$fileKey])) {
    http_response_code(400);
    echo 'Archivo no válido';
    exit;
}

$currentFilePath = $dataDir . $validFiles[$fileKey];

// 🔹 Guardar cambios (AJAX)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'save') {
    header('Content-Type: application/json; charset=utf-8');

    $fileKeyPost = $_POST['fileKey'] ?? '';
    if (!isset($validFiles[$fileKeyPost])) {
        echo json_encode(['ok' => false, 'error' => 'Archivo no válido']);
        exit;
    }

    $content = $_POST['content'] ?? '';
    $decoded = json_decode($content, true);

    if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['ok' => false, 'error' => 'JSON inválido: ' . json_last_error_msg()]);
        exit;
    }

    $targetFile = $dataDir . $validFiles[$fileKeyPost];

    // Backup antes de reemplazar
    $timestamp = date('Ymd-His');
    $backupName = $fileKeyPost . '_' . $timestamp . '.json';
    if (is_file($targetFile)) {
        copy($targetFile, $backupDir . $backupName);
    }

    file_put_contents(
        $targetFile,
        json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
    );

    echo json_encode(['ok' => true]);
    exit;
}

// 🔹 Cargar backup
if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($_GET['action'] ?? '') === 'loadBackup') {
    header('Content-Type: application/json; charset=utf-8');

    $fileKeyGet = $_GET['fileKey'] ?? '';
    $backupFile = $_GET['backup'] ?? '';

    $safePrefix = $fileKeyGet . '_';
    if (!isset($validFiles[$fileKeyGet]) || strpos($backupFile, $safePrefix) !== 0) {
        echo json_encode(['ok' => false, 'error' => 'Backup no válido']);
        exit;
    }

    $fullPath = realpath($backupDir . $backupFile);
    if (!$fullPath || strpos($fullPath, realpath($backupDir)) !== 0 || !is_file($fullPath)) {
        echo json_encode(['ok' => false, 'error' => 'Backup no encontrado']);
        exit;
    }

    echo json_encode(['ok' => true, 'content' => file_get_contents($fullPath)]);
    exit;
}

// 🔹 Carga inicial
$jsonContent = is_file($currentFilePath) ? file_get_contents($currentFilePath) : '';
$backups = glob($backupDir . $fileKey . '_*.json');
rsort($backups);

$base = (strpos($_SERVER['REQUEST_URI'], '/develop') === 0)
  ? '/develop'
  : '';

?>
<!DOCTYPE html>
<html lang="es" data-bs-theme="dark">
<head>
    <meta charset="UTF-8">
    <title>Editor JSON - <?= htmlspecialchars($fileKey) ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#ef7e09" />
    <meta property="og:image" content="<?= 'https://' . $_SERVER['HTTP_HOST'] . $base ?>/assets/img/ico-OG.png" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    
    <!-- Favicon -->
    <link rel="apple-touch-icon" href="<?= $base ?>/assets/img/favicon-dark.png" sizes="180x180" media="(prefers-color-scheme: dark)">
    <link rel="icon" href="<?= $base ?>/assets/img/favicon-dark.png" sizes="32x32" type="image/png" media="(prefers-color-scheme: dark)">
    <link rel="icon" href="<?= $base ?>/assets/img/favicon-dark.png" sizes="16x16" type="image/png" media="(prefers-color-scheme: dark)">
    <link rel="apple-touch-icon" href="<?= $base ?>/assets/img/favicon-light.png" sizes="180x180" media="(prefers-color-scheme: light)">
    <link rel="icon" href="<?= $base ?>/assets/img/favicon-light.png" sizes="32x32" type="image/png" media="(prefers-color-scheme: light)">
    <link rel="icon" href="<?= $base ?>/assets/img/favicon-light.png" sizes="16x16" type="image/png" media="(prefers-color-scheme: light)">

     <!-- Color Mode Script -->
    <script type="text/javascript" src="<?= $base ?>/components/js/color-modes.js"></script>
    
    <!-- Dependencias -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" rel="stylesheet">

    <link href="<?= $base ?>/assets/css/main.css" rel="stylesheet">
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
                    <a class="btn btn-pass d-flex align-items-center pb-0 pt-1" href="#" data-bs-toggle="modal" data-bs-target="#changeCredsModal"><span class="d-none d-md-inline">Password</span><i class="bi bi-key ms-2 fs-4 lh-1"></i></a>
                    <span class="px-md-4 spacer fs-4 lh-1">|</span>
                    <a class="logout navbar-toggler pe-0 py-0" href="?logout=1"><span class="d-none d-md-inline">Cerrar sesión</span><i class="bi bi-box-arrow-right ms-2 fs-4 lh-1"></i></a>
                </div>
            </div>
        </div>

    </header>

<main data-bs-theme="dark" class="bg-body-tertiary pt-4 pb-5">
    <div class="container editor-wrapper">
        <!-- Tabs -->
        <ul class="nav nav-pills d-flex align-items-center justify-content-between flex-row-reverse flex-md-row mb-4">
           <li class="nav-item d-flex align-items-center">
                <a href="editor.php?file=automotive"
                class="nav-link btn btn-primary btn-ddvr py-2 px-4 me-2 <?= $fileKey === 'automotive' ? 'active' : '' ?>">
                <i class="bi bi-car-front-fill me-md-2"></i><span class="d-none d-md-inline">Automotriz</span>
                </a>
                <a href="editor.php?file=industrial"
                class="nav-link btn btn-primary btn-ddvr py-2 px-4 <?= $fileKey === 'industrial' ? 'active' : '' ?>">
                <span class="d-none d-md-inline">Industrial</span><i class="bi bi-buildings-fill ms-md-2"></i>
                </a>
            </li>
            <li>
                <a href="upload.php" class="btn btn-primary btn-ddvr py-2 px-4"><i class="bi bi-arrow-left-short"></i><span class="d-none d-md-inline">Volver</span></a>
            </li>
        </ul>
        <div class="row g-4">
            <!-- Editor JSON -->
            <div class="col-lg-8 col-xl-9">
                <div class="card shadow h-100 rounded overflow-hidden pt-2 px-2">
                    <div class="bg-dark card-body py-3">
                        <div id="editor" class="editor-container"></div>

                        <div class="d-flex justify-content-between mt-3">
                            <small class="text-secondary">Mantén el JSON bien formateado.</small>
                            <div class="d-flex align-items-center">
                                <button id="insertJson" class="btn btn-primary btn-ddvr my-2 py-2 px-4 me-3" disabled>
                                    <span class="d-none d-md-inline">Insertar</span><i class="bi bi-node-plus ms-md-2"></i>
                                </button>
                                <button id="saveBtn" class="btn btn-primary btn-ddvr my-2 py-2 px-4">
                                    <span class="d-none d-md-inline">Guardar</span><i class="bi bi-floppy ms-md-2"></i>
                                </button>
                            </div>
                        </div>

                        <div id="statusMsg" class="mt-2 small"></div>
                    </div>
                </div>
            </div>

            <!-- Historial -->
            <div class="col-lg-4 col-xl-3">
                <div class="card shadow backups-card h-100 rounded overflow-hidden pt-2 px-2">
                    <div class="bg-dark card-body py-3">
                        <h2 class="h6 mb-2">Historial de cambios</h2>
                        <p class="small text-secondary">
                            Al guardar se crea un respaldo automático del archivo previo.
                        </p>

                        <div class="backups-list list-group small bg-dark border rounded">
                            <?php if ($backups): foreach ($backups as $path):
                                $f = basename($path);
                                $label = (preg_match('/_(\d{8}-\d{6})/', $f, $m))
                                    ? DateTime::createFromFormat('Ymd-His', $m[1])->format('d-m-Y H:i:s')
                                    : $f;
                            ?>
                                <button class="list-group-item bg-dark text-light d-flex justify-content-between"
                                        onclick="loadBackup('<?= $f ?>')">
                                    <?= $label ?><span class="badge bg-secondary">Cargar</span>
                                </button>
                            <?php endforeach; else: ?>
                                <div class="list-group-item bg-dark text-secondary">
                                    No hay backups aún
                                </div>
                            <?php endif ?>
                        </div>

                    </div>
                </div>
            </div>
        </div>

    </div>
</main>

<footer  data-bs-theme="dark" class="bg-dark text-body-secondary pt-5 show">
    <div class="container">
            <div class="row">
            <div class="col-12 d-flex justify-content-center mt-5 mb-2">
                <small class="mt-3 mb-0">© 2025 DVR Distribuidora</small>
            </div>
        </div>
    </div>
</footer>

<!-- Monaco Editor -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.51.0/min/vs/loader.min.js"></script>
<script>
const initialContent = <?= json_encode($jsonContent) ?>;
const fileKey = <?= json_encode($fileKey) ?>;
const jsonBlock = `{
    "id": "",
    "titulo": "",
    "descripcion": "",
    "descripcion_corta": "",
    "formatos": [
        ""
    ],
    "imagen": "automotriz/",
    "beneficios": [
        ""
    ],
    "instrucciones": [
        ""
    ],
    "aplicaciones": [
        ""
    ],
    "precauciones": [
        ""
    ],
    "categoria": "",
    "pdf": "uploads/pdf/automotriz/"
},`;

const statusMsg = document.getElementById('statusMsg');
const saveBtn = document.getElementById('saveBtn');

function setStatus(msg, type='info'){
    statusMsg.className = 'small mt-2 text-' + ({
        info:'secondary', success:'success', error:'danger'
    }[type] || 'secondary');
    statusMsg.textContent = msg;
}

// Monaco
require.config({ paths: { 'vs':'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.51.0/min/vs' }});
let editor;

require(['vs/editor/editor.main'], () => {
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: initialContent,
        language: 'json',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled:false },
    });
    document.getElementById("insertJson").disabled = false;
});

// Guardar
saveBtn.addEventListener('click', () => {
    setStatus('Validando JSON...');
    saveBtn.disabled = true;

    fetch('editor.php', {
        method:'POST',
        headers:{ 'Content-Type':'application/x-www-form-urlencoded' },
        body:new URLSearchParams({
            action:'save',fileKey,fileKey,content:editor.getValue()
        })
    }).then(r=>r.json()).then(d=>{
        if(d.ok) setStatus('¡Guardado con éxito!','success');
        else setStatus(d.error,'error');
    }).finally(()=>saveBtn.disabled=false);
});

const insertBtn = document.getElementById('insertJson');

insertBtn.addEventListener('click', () => {
    const position = editor.getPosition(); // cursor actual
    const range = new monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column
    );

    editor.executeEdits("insert-json", [{
        range,
        text: "\n" + jsonBlock + "\n"
    }]);

    // Opcional: auto formateo del bloque recién insertado
    editor.getAction('editor.action.formatDocument').run();

    setStatus('Bloque insertado (no olvides guardar).', 'success');
});

// Cargar backup
function loadBackup(name){
    if (!confirm('¿Reemplazar con este backup?')) return;

    setStatus('Cargando...');
    fetch('editor.php?'+new URLSearchParams({
        action:'loadBackup',fileKey,backup:name
    }))
    .then(r=>r.json()).then(d=>{
        if(d.ok){
            editor.setValue(d.content);
            setStatus('Backup cargado. Guarda para aplicar.','info');
        } else setStatus(d.error,'error');
    });
}
</script>

</body>
</html>

