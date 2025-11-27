// =========================
// Variables globales
// =========================

let urlParams = null;
let pdpTemplate = "";
let cardTemplate = "";
//let jsonRoute = null;
let randomCardsJson = "";
let catalog = "";


// =========================
// Init
// =========================

function initPdp() {
    console.log("PDP inicializada");
    cdp = document.querySelector(".pdp-container");

    // Obtener ID desde URL ?id=1
    initQr();
    urlParams = new URLSearchParams(window.location.search);
    //const fullId = urlParams.get("id");
    const id = urlParams.get("id");
    const [catalogPrefix, productId] = id.split("-");

    if (catalogPrefix === "a") currentCatalog = "automotive";
    if (catalogPrefix === "i") currentCatalog = "industrial";
    catalog = catalogPrefix + "-";
    console.log(id);

    if (!id) {
        console.error("No se pasó id de producto en la URL");
        return;
    }

    fetchProductsData(getJsonRoute()).then(() => {

        loadPdp(id);
    });
}


// =========================
// Cargar JSON
// =========================

function fetchProductsData(url) {
    return fetch(url)
        .then(res => res.json())
        .then(data => {
            productsData = data;
        });
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
                    Producto no encontrado.${id}
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

    animateView('.pdp-container');

    // Botón volver (SPA)
    const backBtn = document.getElementById("btn-back");
    if (backBtn) {
        backBtn.addEventListener("click", e => {
            e.preventDefault();
            navbarHeaderCollapsel();

            currentHeight = main.offsetHeight;
            main.style.height = currentHeight + 'px';
            el.classList.remove("show");
            footer.classList.remove("show");

            grid = null;   

            window.history.back();          
        });
    }
    renderRandomCardsHtml(product);
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
// Random cards
// =========================

function renderUniqueRandomCards(min, max, count) {
    const uniqueCards = new Set();
    while (uniqueCards.size < count) {
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        uniqueCards.add(randomNumber);
    }
    return Array.from(uniqueCards);
}

const uniqueCardsArray = renderUniqueRandomCards(1, 31, 4);

function renderRandomCardsHtml(currentProduct) {
    const max = productsData.length;

    // Obtener IDs aleatorios distintos al actual
    const ids = renderUniqueRandomCards(1, max, 4)
        .filter(id => id !== currentProduct.id);

    // Crear array JSON con las cards seleccionadas
    const randomCardsArray = ids.map(id => {
        const fullId = catalog + id;
        return productsData.find(p => String(p.id) === String(fullId));
    }).filter(Boolean); // por si alguno no existe

    // Ahora SÍ tienes un JSON válido para usar con renderCards()
    return renderCardsPDP(randomCardsArray);
}


// =========================
// Render Cards
// =========================

function renderCardsPDP(products) {
    if (!cardTemplate) console.warn("cardTemplate no cargado aún");

    productsLength = products.length;
   
    let allCards = "";
    const containerRC = document.querySelector("#random-cards");
    products.forEach((product) => {
        const formatosTexto = Array.isArray(product.formatos)
            ? product.formatos.join(" / ")
            : (product.formatos || "");

        function toSlug(text) {
            return text
                .toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
        }

        const slug = toSlug(product.titulo);

        const categoriaClase = (product.categoria || "")
            .split(" ")
            .map((c) => c.trim())
            .filter(Boolean)
            .join(" ");


        let html = cardTemplate
        .replace(/{{slug}}/g, slug)
        .replace(/{{id}}/g, product.id)
        .replace(/{{imagen}}/g, product.imagen)
        .replace(/{{titulo}}/g, product.titulo)
        .replace(/{{descripcion_corta}}/g, product.descripcion_corta)
        .replace(/{{formatosTexto}}/g, formatosTexto);

        allCards += `
            <div class="col-md-3 grid-item mb-3 mb-md-0 ${categoriaClase}">
                ${html}
            </div>
        `; 
        
    });

    containerRC.innerHTML = allCards; 
    containerRC.querySelectorAll('.card-ddvr').forEach(card => {
    card.style.visibility = 'visible';
});
    attachCardListener('.card-ddvr .btn-ddvr, .card-ddvr img');

}


// =========================
// Cargar template PDP
// =========================

function loadPdpTemplates() {
    return fetch(siteRoot + 'pages/pdp.html')
        .then(res => res.text())
        .then(html => {
            pdpTemplate = html;
            // Ahora cargar el template de la card
            return fetch(siteRoot + 'components/card.php');
        })
        .then(res => res.text())
        .then(html => {
            cardTemplate = html;
        })
        .catch(err => console.error("Error cargando templates", err));
}


// =========================
// Escucha del router
// =========================
document.addEventListener("pdpLoaded", () => {
    loadPdpTemplates().then(() => {
        initPdp();
    });
});
