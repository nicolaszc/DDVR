// =========================
// Root
// =========================

//let siteRoot = null; 


// =========================
// Variables globales
// =========================
let btnAutomotive = null; 
let btnIndustrial = null; 
let filtersGroup = null; 
let filterGroupBtns = null; 
let filterAnchor = null; 
let filterIconParent = null;
let filterIconObject = null;
let myStorageObject = null;
let filterOpenBtn = "";

let plp = null;

let iso = null;   
let actualFilter = "*";

let productsData = [];

let pdpTemplate = "";
let cardTemplate = "";

// ⬅️ ESTA ES LA ÚNICA LÍNEA CAMBIADA ARRIBA
let templatesReady = null;


// =========================
// Init
// =========================
function initPlp() {

    // ====== SELECTORES ======
    console.log('PLP cargada ✔ at ' + siteRoot);
    plp = document.getElementById("plp");

    // ====== CARGA INICIAL ======
    loadPlp(siteRoot + "data/automotive.json");
}


// =========================
// Cargar catálogo desde JSON
// =========================

function loadPlp(jsonRoute) {
    const plp = document.getElementById("plp");
    plp.innerHTML = `
    <div class="col-12 text-center py-4">
        <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
        </div>
    </div>
    `;

    fetch(jsonRoute)
    .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar " + jsonRoute);
        return res.json();
    })
    .then((data) => {
        productsData = data;
        templatesReady.then(() => {
            renderCards(data);
            initIsotope();  
            bindPlpControls();        
        });
    })
    .catch((err) => {
        console.error(err);
        plp.innerHTML = `
        <div class="col-12">
            <div class="alert alert-danger">
            Error al cargar el catálogo (${jsonRoute}). Revisa la ruta del JSON y ejecuta el sitio desde http:// (no file://).
            </div>
        </div>
        `; 
    });   
     
}


// =========================
// Render Cards
// =========================
function renderCards(products) {
    if (!cardTemplate) console.warn("cardTemplate no cargado aún");
    plp.innerHTML = "";
    productsLength = products.length;

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

        const col = document.createElement("div");
        col.className = `col grid-item ${categoriaClase}`;
        col.id = `${product.id}`;

        let html = cardTemplate
        .replace(/{{slug}}/g, slug)
        .replace(/{{id}}/g, product.id)
        .replace(/{{imagen}}/g, product.imagen)
        .replace(/{{titulo}}/g, product.titulo)
        .replace(/{{descripcion_corta}}/g, product.descripcion_corta)
        .replace(/{{formatosTexto}}/g, formatosTexto);

        col.innerHTML = html;
        plp.appendChild(col);
    });

    // =========================
    // Navegar a PDP
    // =========================
    const buttons = document.querySelectorAll('.card .btn-ddvr[data-product-slug]');
    buttons.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            const slug = btn.dataset.productSlug;
            const productId = btn.dataset.productId;

            // Buscar el producto en productsData
            const product = productsData.find(p => String(p.id) === String(productId));
            if (!product) return console.error("Producto no encontrado");

            //scrollToTop();

            // Random cards
            window.pendingRandomCards = renderRandomCardsHtml(product);
            
            navigate(`/producto/${slug}?id=${productId}`);
        });
    });

    // =========================
    // Agregar listeners de share
    // =========================
    const shareButtons = document.querySelectorAll(".share-btn");       
    
    document.querySelector('main').addEventListener('click', e => {  
        const btn = e.target.closest('.share-btn');
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        const rrssCurrent = btn.closest(".share-container").querySelector(".rrss");
        if (!rrssCurrent) return;

        shareButtons.forEach((el) => {
            if (el !== btn) el.classList.remove("active");
        });

        btn.classList.toggle("active");

        const allRrss = document.querySelectorAll(".rrss");
        allRrss.forEach((el) => {
            if (el !== rrssCurrent) el.classList.remove("active");
        });

        rrssCurrent.classList.toggle("active");
    });
}


// ===============================
// Inicializar / refrescar Isotope
// ===============================
function initIsotope() {
    if (!window.Isotope) return;

    if (!iso) {
        iso = new Isotope(plp, {
            itemSelector: ".grid-item",
            layoutMode: "fitRows",
            fitRows: {
                equalheight: true
            },
            getSortData: {
                name: '.name'
            }
        });
    } else {
        iso.reloadItems();
    }

    iso.arrange({ filter: actualFilter });  
       
}


function bindPlpControls() {
    console.log("Rebinding PLP controls...");
    
    btnAutomotive = document.getElementById("btn-automotive");
    btnIndustrial = document.getElementById("btn-industrial");
    filtersGroup = document.querySelector(".filters-button-group");
    filterGroupBtns = document.querySelectorAll("button.btn-filter");
    btnSort = document.getElementById("btn-sort");
    filterAnchor = document.getElementById("filter-anchor");
    filterIconParent = null;
    filterIconObject = document.getElementById('filter-icon');
    myStorageObject = { storedElement: filterIconObject}; 
    filterOpenBtn = document.querySelector(('button:has(span#filter-icon-container'));

     if (btnAutomotive) {
        btnAutomotive.addEventListener("click", (e) => {
        e.preventDefault();
        loadPlp(siteRoot + "data/automotive.json");

        btnAutomotive.classList.add("btn-primary");
        btnAutomotive.classList.remove("btn-secondary");
        if (btnIndustrial) {
            btnIndustrial.classList.add("btn-secondary");
            btnIndustrial.classList.remove("btn-primary");
        }
        });
    }

    if (btnIndustrial) {
        btnIndustrial.addEventListener("click", (e) => {
        e.preventDefault();
        loadPlp(siteRoot + "data/industrial.json");

        btnIndustrial.classList.add("btn-primary");
        btnIndustrial.classList.remove("btn-secondary");
        if (btnAutomotive) {
            btnAutomotive.classList.add("btn-secondary");
            btnAutomotive.classList.remove("btn-primary");
        }
        });
    }
    

   
        filtersGroup.addEventListener('click', (e) => {
            const btn = e.target.closest('button.btn-filter');
            if (!btn || !iso) return;

            filterAnchor.scrollIntoView();

            filterIconParent = document.getElementById('filter-icon-container');
            filterIconParent.removeChild(filterIconObject);
            filterIconParent.removeAttribute('id');

            console.log('clickeo');
            // activo visual
            filterGroupBtns.forEach(function(b){
                    b.classList.remove('active');
                    b.classList.toggle('d-none');
                }
            );
            
            const iconContainer = btn.querySelector('.filter-icon-container')
            iconContainer.prepend(myStorageObject.storedElement);
            iconContainer.setAttribute('id', 'filter-icon-container');
            btn.classList.remove('d-none');
            btn.classList.add('active');

            // aplicar filtro
            actualFilter = btn.getAttribute('data-filter') || '*';
            iso.arrange({ filter: actualFilter });
        });
    

    if(btnSort){
        btnSort.addEventListener('click', (e) =>{
            if (!btnSort || !iso) return;

            var sortByValue = btnSort.getAttribute('data-sort-by');
            iso.arrange({ sortBy : sortByValue });

            if(sortByValue == 'name'){
            btnSort.setAttribute('data-sort-by' , 'original-order');
            }else{
            btnSort.setAttribute('data-sort-by' , 'name');
            }
            
            btnSort.classList.toggle('active');
        })
    }
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
    const max = productsLength;
    const ids = renderUniqueRandomCards(1, max, 4)
        .filter(id => id !== currentProduct.id);

    let html = "";

    ids.forEach(id => {
        const original = document.getElementById(String(id));
        if (!original) return;

        const clone = original.cloneNode(true);
        clone.removeAttribute('style');
        clone.id = "";

        html += clone.outerHTML;
    });

    html = 
    `<div class="container mb-4">
        <h2 class="product-title mb-3 mt-4 fs-4">Otros usuarios también vieron</h1>
        <div id="plp" class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-3 product">
            ${html}
        </div>
    </div>`;
    return html;
}


// =========================
// Esperar include.js
// =========================

document.addEventListener("plpLoaded", () => {

    // Se obtiene el siteRoot AQUÍ
    //siteRoot = document.getElementById('site-root').getAttribute('content');

    // ⬇️ SE MUEVE AQUÍ el fetch de templates
    templatesReady = fetch(siteRoot + 'components/card.php')
        .then(res => res.text())
        .then(html => {
            cardTemplate = html;
            return fetch(siteRoot + 'pages/pdp.html');
        })
        .then(res => res.text())
        .then(html => {
            pdpTemplate = html;
        })
        .catch(err => console.error("Error cargando templates", err));
    // ⬆️

    initPlp();
    //bindPlpControls();  
    
});
