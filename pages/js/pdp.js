// pdp.js
let urlParams = null;
function initPdp() {
    console.log("PDP inicializada");

    // Obtener ID desde URL ?id=1
    urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    console.log(id);
    if (!id) {
        console.error("No se pasó id de producto en la URL");
        return;
    }

    loadPdp(id);
}

// =========================
// Cargar PDP sin recargar JSON
// =========================
function loadPdp(id) {
    // Buscar producto en productsData (ya cargado en la PLP)
    const product = productsData.find(p => String(p.id) === String(id));

    if (!product) {
        document.querySelector("main").innerHTML = `
            <div class="container py-5">
                <div class="alert alert-danger">
                    Producto no encontrado.
                </div>
            </div>
        `;
        return;
    }

    // Renderizar plantilla
    const html = renderPdpHtml(product);

    // Inyectar en el DOM
    const container = document.querySelector("main");
    container.innerHTML = html;

    if (container && window.pendingRandomCards) {
        container.insertAdjacentHTML("beforeend", window.pendingRandomCards);
        delete window.pendingRandomCards;
        console.log(window.pendingRandomCards)
      }
    // Botón volver (SPA)
    const backBtn = document.getElementById("btn-back");
    if (backBtn) {
        backBtn.addEventListener("click", e => {
            e.preventDefault();
            navbarHeaderCollapsel();
            scrollToTop();
            window.history.back();
        });
    }
}

// =========================
// Render PDP
// =========================
function renderPdpHtml(productId) {

    const formatosTexto = Array.isArray(productId.formatos)
        ? productId.formatos.join(' / ')
        : (productId.formatos || "");

    const pdfHtml = productId.pdf 
        ? `<p class="mb-0"><a href="${productId.pdf}" target="_blank" class="pdf d-flex align-items-center"><i class="bi bi-file-earmark-pdf pe-2"></i> Descargar Ficha</a></p>`
        : '';

    const beneficiosHtml = Array.isArray(productId.beneficios)
        ? `<h4 class="mb-1">Beneficios</h4>
        <ul class="product-text">
            ${productId.beneficios.map(b => `<li>${b}</li>`).join('')}
        </ul>`
        : '';

    const instruccionesHtml = Array.isArray(productId.instrucciones)
        ? `<h4 class="mt-4 mb-1">Instrucciones</h4>
        <ul class="product-text">
            ${productId.instrucciones.map(b => `<li>${b}</li>`).join('')}
        </ul>`
        : '';

    const aplicacionesHtml = Array.isArray(productId.aplicaciones)
        ? `<h4 class="mt-4 mb-1">Aplicaciones</h4>
        <ul class="product-text">
            ${productId.aplicaciones.map(b => `<li>${b}</li>`).join('')}
        </ul>`
        : '';

    const precaucionesHtml = Array.isArray(productId.precauciones)
        ? `<h4 class="mt-4 mb-1">Precauciones</h4>
        <ul class="product-text">
            ${productId.precauciones.map(b => `<li>${b}</li>`).join('')}
        </ul>`
        : '';


    return pdpTemplate
        .replace(/{{titulo}}/g, productId.titulo)
        .replace(/{{categoria}}/g, productId.categoria)
        .replace(/{{imagen}}/g, productId.imagen)
        .replace(/{{descripcion}}/g, productId.descripcion)
        .replace(/{{formatosTexto}}/g, formatosTexto)
        .replace(/{{pdfHtml}}/g, pdfHtml)
        .replace(/{{beneficiosHtml}}/g, beneficiosHtml)
        .replace(/{{instruccionesHtml}}/g, instruccionesHtml)
        .replace(/{{aplicacionesHtml}}/g, aplicacionesHtml)
        .replace(/{{precaucionesHtml}}/g, precaucionesHtml);
}

// =========================
// Escucha del router
// =========================
document.addEventListener("pdpLoaded", () => {
    initPdp();
});
