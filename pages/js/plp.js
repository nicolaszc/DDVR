// =========================
// PLP
// =========================
function initPlp() {
    const siteRoot = document.getElementById('site-root').getAttribute('content');
    console.log('PLP cargada ✔ at ' + siteRoot); 
    // =========================
    // Variables globales
    // =========================
    const plp = document.getElementById("plp");

    const btnAutomotive = document.getElementById("btn-automotive-plp");
    const btnIndustrial = document.getElementById("btn-industrial-plp");

    const filtersGroup = document.querySelector(".filters-button-group");
    const filterGroupBtns = filtersGroup.querySelectorAll('button.btn-filter');

    let filterIconParent = null;
    const filterIconObject = document.getElementById('filter-icon');
    let myStorageObject = { storedElement: filterIconObject}; 

    const filterAnchor = document.getElementById('filter-anchor');
    const btnSort = document.querySelector(".btn-sort");

    let productsData = [];
    let iso = null;
    let actualFilter = "*";

    let cardTemplate = null;
    let pdpTemplate = "";

    // =========================
    // Cargar template de la card
    // =========================
    const templatesReady = fetch(siteRoot + 'components/card.html')
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


    // =========================   
    // Cargar catálogo desde JSON
    // =========================
    function loadPlp(jsonRoute) {
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
        const productsLength = products.length;

        products.forEach((product) => {
            const formatosTexto = Array.isArray(product.formatos)
                ? product.formatos.join(" / ")
                : (product.formatos || "");

            function toSlug(text) {
                return text
                    .toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Elimina tildes
                    .replace(/[^a-z0-9]+/g, "-") // Reemplaza lo no válido por -
                    .replace(/^-+|-+$/g, ""); // Limpia guiones del inicio o fin
            }

            const slug = toSlug(product.titulo);

            // Clases de categoría para filtros Isotope
            const categoriaClase = (product.categoria || "")
                .split(" ")
                .map((c) => c.trim())
                .filter(Boolean)
                .join(" ");

            const col = document.createElement("div");
            col.className = `col grid-item ${categoriaClase}`;
            col.id = `${product.id}`;

            // Template card
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

                 // Ficha
                window.pendingPdpHtml = renderPdpHtml(product);

                // Random cards
                window.pendingRandomCards = renderRandomCardsHtml(product);
                
                navigate(`/producto/${slug}?id=${productId}`);
            });
        });

        // =========================
        // Render PDP
        // =========================
        function renderPdpHtml(product) {

            const formatosTexto = Array.isArray(product.formatos)
                ? product.formatos.join(' / ')
                : (product.formatos || "");

            const pdfHtml = product.pdf 
                ? `<p class="mb-0"><a href="${product.pdf}" target="_blank" class="pdf d-flex align-items-center"><i class="bi bi-file-earmark-pdf pe-2"></i> Descargar Ficha</a></p>`
                : '';

            const beneficiosHtml = Array.isArray(product.beneficios)
                ? `<h4 class="mb-1">Beneficios</h4>
                <ul class="product-text">
                    ${product.beneficios.map(b => `<li>${b}</li>`).join('')}
                </ul>`
                : '';

            const instruccionesHtml = Array.isArray(product.instrucciones)
                ? `<h4 class="mt-4 mb-1">Instrucciones</h4>
                <ul class="product-text">
                    ${product.instrucciones.map(b => `<li>${b}</li>`).join('')}
                </ul>`
                : '';

            const aplicacionesHtml = Array.isArray(product.aplicaciones)
                ? `<h4 class="mt-4 mb-1">Aplicaciones</h4>
                <ul class="product-text">
                    ${product.aplicaciones.map(b => `<li>${b}</li>`).join('')}
                </ul>`
                : '';

            const precaucionesHtml = Array.isArray(product.precauciones)
                ? `<h4 class="mt-4 mb-1">Precauciones</h4>
                <ul class="product-text">
                    ${product.precauciones.map(b => `<li>${b}</li>`).join('')}
                </ul>`
                : '';


            return pdpTemplate
                .replace(/{{titulo}}/g, product.titulo)
                .replace(/{{categoria}}/g, product.categoria)
                .replace(/{{imagen}}/g, product.imagen)
                .replace(/{{descripcion}}/g, product.descripcion)
                .replace(/{{formatosTexto}}/g, formatosTexto)
                .replace(/{{pdfHtml}}/g, pdfHtml)
                .replace(/{{beneficiosHtml}}/g, beneficiosHtml)
                .replace(/{{instruccionesHtml}}/g, instruccionesHtml)
                .replace(/{{aplicacionesHtml}}/g, aplicacionesHtml)
                .replace(/{{precaucionesHtml}}/g, precaucionesHtml);
        }
      
        // =========================
        // Random numbers para cards
        // =========================
        function renderUniqueRandomCards(min, max, count) {
            const uniqueCards = new Set();
            while (uniqueCards.size < count) {
                const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
                uniqueCards.add(randomNumber);
            }
            return Array.from(uniqueCards); // Convert the Set to an array

        }

        const uniqueCardsArray = renderUniqueRandomCards(1, productsLength, 4);

        function renderRandomCardsHtml(currentProduct) {
            const max = productsLength;
            const ids = renderUniqueRandomCards(1, max, 4)
                .filter(id => id !== currentProduct.id); // No mostrar el mismo

            let html = "";

            ids.forEach(id => {
                const original = document.getElementById(String(id));
                if (!original) return;

                const clone = original.cloneNode(true);
                clone.removeAttribute('style');
                clone.id = ""; // limpiar duplicados

                html += clone.outerHTML;
            });
            html = 
            `<div class="container mb-4">
                <h2 class="product-title mb-3 mt-4">Otros usuarios también vieron</h1>
                <div id="plp" class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-3 product">
                    ${html}
                </div>
            </div>`;
            return html;
        }

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

            // activar todos los demás .shareButtons
            shareButtons.forEach((el) => {
                if (el !== btn) el.classList.remove("active");
            });

            // Alternar el actual
            btn.classList.toggle("active");

            // Cerrar todos los demás .rrss
            const allRrss = document.querySelectorAll(".rrss");
            allRrss.forEach((el) => {
                if (el !== rrssCurrent) el.classList.remove("active");
            });

            // Alternar el actual
            rrssCurrent.classList.toggle("active");
        })          
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
            name: '.name' // text from querySelector
            }
        });
        } else {
        iso.reloadItems();
        }

        iso.arrange({ filter: actualFilter });       
    }

    // =========================
    // Botones catálogo
    // =========================
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
    
    let filterOpenBtn = document.querySelector(('button:has(span#filter-icon-container'));

    if (filtersGroup) {
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
    }

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

    // Catálogo inicial
    loadPlp(siteRoot + "data/automotive.json");
}

// =========================
// Esperar a que include.js termine de insertar componentes
// =========================
if (document.readyState === "loading") {
   document.addEventListener("plpLoaded", initPlp);
} else {
  initPlp();
}