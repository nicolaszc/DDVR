<?php
$base = (strpos($_SERVER['REQUEST_URI'], '/develop') === 0)
  ? '/develop'
  : '';
?>
<!doctype html>
<html lang="es" data-bs-theme="dark">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>DDVR</title>

    <meta name="theme-color" content="#712cf9" />
    <meta id="site-path" name="site-path" content="<?= $base ?>" />

    <meta property="og:image" content="<?= 'https://' . $_SERVER['HTTP_HOST'] ?>/api/qr/qr-get.php?url=<?= urlencode('https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI' ]) ?>">
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />


    <!-- Favicon -->
    <link id="icon-at" rel="apple-touch-icon" href="" sizes="180x180">
    <link id="icon-lg" rel="icon" href="" sizes="32x32" type="image/png">
    <link id="icon-sm" rel="icon" href="" sizes="16x16" type="image/png">

    <!-- Color Mode Script -->
    <script type="text/javascript" src="<?= $base ?>/components/js/color-modes.js"></script>

    <!-- CSS -->
    <link href="<?= $base ?>/assets/css/lib/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous"> 
    <link href="<?= $base ?>/assets/css/lib/bootstrap-icons.min.css" rel="stylesheet">
    <link href="<?= $base ?>/assets/css/lib/animate.min.css" rel="stylesheet">

    <!-- <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" rel="stylesheet">--> 

    <!-- Custom CSS -->
    <link href="<?= $base ?>/assets/css/main.css" rel="stylesheet">
    
  </head>
  <body class="bg-body-tertiary">

    <!-- Header -->
    <div id="header" class="vw-100">
    <!-- Include header.html -->
    </div>
    
    <!-- Main -->
    <main id="main" class="bg-body-tertiary pb-5">
     <!-- Include componentes x página --> 

      
    </main>

    <!-- Footer -->
    <div id="footer">
    <!-- Include footer.html --> 
    </div>

    <div id="fixed-menu" class="position-fixed bottom-0 end-0 mb-2 me-2 mb-md-3 me-md-3">    
    <!-- Include theme-toggle.html -->
    </div>

    <div id="product-modal">    
    <!-- Include product-modal.html -->
    </div>

    <div id="contact-form">    
    <!-- Include contact-form.html -->
    </div>

    <!-- Scripts -->
    <script src="<?= $base ?>/assets/js/lib/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <script src="<?= $base ?>/assets/js/lib/isotope.pkgd.min.js"></script>

    <!-- Librerías externas -->
    <!--<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script> 
    <script src="https://unpkg.com/isotope-layout@3/dist/isotope.pkgd.min.js"></script>-->

    <!-- Funciones navegación -->
    <script src="<?= $base ?>/pages/js/router/include.js"></script>
    <script src="<?= $base ?>/pages/js/router/router.js"></script>
    

    <!-- Lógica por páginas -->
    <script src="<?= $base ?>/pages/js/plp.js"></script>
    <script src="<?= $base ?>/pages/js/pdp.js"></script>

    <!-- Componentes -->
    <script src="<?= $base ?>/components/js/form-post.js"></script>
    <script src="<?= $base ?>/components/js/qr-btns.js"></script>
    

    <!-- Entrypoint: arranca todo -->
    <script src="<?= $base ?>/pages/js/router/main.js"></script>

    <script src="<?= $base ?>/pages/js/app.js"></script>

  </body>
</html>
