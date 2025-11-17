<?php
// send-mail.php

header('Content-Type: application/json; charset=utf-8');

// 1. Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido.'
    ]);
    exit;
}

// 2. Capturar datos
$name      = trim($_POST['name']      ?? '');
$last_name = trim($_POST['last_name'] ?? '');
$mail      = trim($_POST['mail']      ?? '');
$phone     = trim($_POST['phone']     ?? '');
$subject   = trim($_POST['subject']   ?? '');
$message   = trim($_POST['message']   ?? '');

// 3. Validaciones básicas
if ($name === '' || $last_name === '' || $phone == '' || $mail === '' || $subject === '' || $message === '') {
    echo json_encode([
        'success' => false,
        'message' => 'Por favor, completa todos los campos obligatorios.'
    ]);
    exit;
}

if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => 'El correo electrónico no es válido.'
    ]);
    exit;
}

// 4. Armar correo
$to      = "martinzakrzewicz780@gmail.com"; // Cambia esto a donde quieras recibir los mensajes
$subjectMail = "Contacto DVR — $subject";
$body = "Has recibido un nuevo mensaje desde el formulario de contacto:\n\n" .
        "Nombre: $name $last_name\n" .
        "Correo: $mail\n" .
        "Teléfono: +56 $phone\n" .
        "Asunto: $subject\n\n" .
        "Mensaje:\n$message\n";

$headers = "From: noreply@tu-dominio.cl\r\n";
$headers .= "Reply-To: $mail\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// 5. Enviar correo

$sent = mail($to, $subjectMail, $body, $headers);

if ($sent) {
    echo json_encode([
        'success' => true,
        'message' => 'Tu mensaje se envió correctamente. Te contactaremos a la brevedad.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No se pudo enviar el mensaje en este momento. Inténtalo nuevamente.'
    ]);
}
