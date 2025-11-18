<?php
// Evitar cualquier salida accidental
ob_start();
error_reporting(0);

// Requerir la librería QR
require_once __DIR__ . '/lib/phpqrcode.php';

// Obtener URL
$url = isset($_GET['url']) ? $_GET['url'] : '';
if (!$url) {
    header('Content-Type: text/plain');
    echo "Missing 'url' parameter";
    exit;
}

// 1) Generar QR en memoria
ob_start();
QRcode::png($url, null, QR_ECLEVEL_L, 10, 0);
$qrData = ob_get_clean();
$qrImg = imagecreatefromstring($qrData);

// 2) Crear imagen OG
$width = 300;
$height = 300;
$og = imagecreatetruecolor($width, $height);

// Colores
$white = imagecolorallocate($og, 255, 255, 255);
$black = imagecolorallocate($og, 0, 0, 0);

// Fondo blanco
imagefilledrectangle($og, 0, 0, $width, $height, $white);

// 3) Pegar QR en OG
$border = 16;
$bgSize = 300;
$qrSize = $bgSize - 2 * $border; // 280
imagecopyresampled($og, $qrImg, $border, $border, 0, 0, $qrSize, $qrSize, imagesx($qrImg), imagesy($qrImg));

// 5) Limpiar buffers y enviar imagen
if (ob_get_level()) ob_end_clean();
header('Content-Type: image/jpeg');
imagejpeg($og, null, 90);

// Liberar memoria
imagedestroy($og);
imagedestroy($qrImg);
exit;
