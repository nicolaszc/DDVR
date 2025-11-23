<?php
$base = (strpos($_SERVER['REQUEST_URI'], '/develop') === 0)
  ? '/develop'
  : '';
?>
<!-- /components/card.html -->
<div class="card shadow mb-2 h-100 d-flex flex-column card-ddvr" data-slug="{{slug}}" data-id="{{id}}">
    <div class="card-img pt-5">
        <img src="<?= $base ?>/uploads/img/{{imagen}}" alt="{{titulo}}">
    </div>
    <div data-bs-theme="dark" class="bg-dark card-body d-flex flex-column py-4">
        <div class="product-main-info">
            <h4 class="name">{{titulo}}</h4>
            <p class="product-text flex-grow-1">{{descripcion_corta}}</p>
        </div>
        <p class="product-presentation d-flex align-items-center mb-2">
            <strong class="me-2">Formatos:</strong> {{formatosTexto}}
        </p>
        <div class="d-flex justify-content-between align-items-center mt-4">
            <button
                type="button"
                class="btn btn-sm btn-primary btn-ddvr py-2 px-4"
                data-product-id="{{id}}"
                data-product-slug="{{slug}}">
                Ver Más<i class="bi bi-arrow-right-short"></i>
            </button>
            
            <div class="share-container d-flex align-items-center">
                <ul class="list-unstyled d-flex m-0 rrss">
                    <li class="d-flex align-items-center my-0">
                        <a href="#"><i class="bi bi-whatsapp ms-2"></i></a> 
                    </li>
                    <li class="d-flex align-items-center my-0">
                        <a href="https://www.instagram.com/distribuidoradvr/" target="_blank"><i class="bi bi-instagram ms-2"></i></a>
                    </li>
                    <li class="d-flex align-items-center my-0">
                        <a href="https://cl.linkedin.com/company/distribuidora-dvr" target="_blank"><i class="bi bi-linkedin ms-2"></i></a> 
                    </li>
                </ul>
                <button class="btn share-btn lh-1 d-flex pe-0">
                    <i class="bi bi-share-fill"></i>
                </button>
            </div>
        </div>
    </div>
</div>
