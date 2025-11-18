//////////////// CATALOG //////////////////////
function initCatalog() {

    const catalog = document.getElementById("catalog");
    const modalEl = document.getElementById("modal-product");
    const modalTitleSpan = modalEl ? modalEl.querySelector("#modal-product-label span") : null;
    const modalImg = document.getElementById("modal-img");
    const modalBenefitsList = document.getElementById("modal-product-beneficios");
    const modalPDF = document.getElementById("modal-pdf");

    const btnAutomotive = document.getElementById("btn-automotive-catalog");
    const btnIndustrial = document.getElementById("btn-industrial-catalog");

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

    // Cargar catálogo desde JSON

    function cargarCatalogo(jsonRoute) {
        catalog.innerHTML = `
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
            renderizarCards(data);
            initIsotope();
        })
        .catch((err) => {
            console.error(err);
            catalog.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                Error al cargar el catálogo (${jsonRoute}). Revisa la ruta del JSON y ejecuta el sitio desde http:// (no file://).
                </div>
            </div>
            `;
        });
    }

    // Pintar cards
    function renderizarCards(products) {
        catalog.innerHTML = "";

        products.forEach((product) => {
        const formatosTexto = Array.isArray(product.formatos)
            ? product.formatos.join(" / ")
            : (product.formatos || "");

        // clases de categoría para filtros Isotope
        const categoriaClase = (product.categoria || "")
            .split(" ")
            .map((c) => c.trim())
            .filter(Boolean)
            .join(" ");

        const col = document.createElement("div");
        col.className = `col grid-item ${categoriaClase}`;

        col.innerHTML = `
            <div class="card shadow mb-2 h-100 d-flex flex-column card-ddvr">
            <div class="card-img pt-5">
                <img src="assets/img/${product.imagen}" alt="${product.titulo}">
            </div>
            <div data-bs-theme="dark" class="bg-dark card-body d-flex flex-column py-4">
                <div class="card-main-info">
                <h4 class="name">${product.titulo}</h4>
                <p class="card-text flex-grow-1">${product.descripcion}</p>
                </div>
                <p class="card-presentation d-flex align-items-center mb-2">
                <strong class="me-2">Formatos:</strong> ${formatosTexto}
                </p>
                <div class="d-flex justify-content-between align-items-center mt-4">
                <button
                    type="button"
                    class="btn btn-sm btn-primary btn-ddvr py-2 px-4"
                    data-bs-toggle="modal"
                    data-bs-target="#modal-product"
                    data-product-id="${product.id}">
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
        `;

        catalog.appendChild(col);
        });

        // 🔹 Agregar listeners de share después de renderizar todas las cards
        const shareButtons = catalog.querySelectorAll(".share-btn");

        shareButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const rrssCurrent = btn.closest(".share-container").querySelector(".rrss");
            if (!rrssCurrent) return;

            // 🔹 activar todos los demás .shareButtons
            shareButtons.forEach((el) => {
            if (el !== btn) el.classList.remove("active");
            });

            // 🔹 Alternar el actual
            btn.classList.toggle("active");

            // 🔹 Cerrar todos los demás .rrss
            const allRrss = catalog.querySelectorAll(".rrss");
            allRrss.forEach((el) => {
            if (el !== rrssCurrent) el.classList.remove("active");
            });

            // 🔹 Alternar el actual
            rrssCurrent.classList.toggle("active");
        });
        });

    }

    // Inicializar / refrescar Isotope
    function initIsotope() {
        if (!window.Isotope) return;

        if (!iso) {
        iso = new Isotope(catalog, {
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

    // Modal beneficios
    if (modalEl && modalTitleSpan && modalBenefitsList) {
        modalEl.addEventListener("show.bs.modal", (event) => {
        const boton = event.relatedTarget;
        if (!boton) return;

        const productId = boton.getAttribute("data-product-id");
        const product = productsData.find(
            (p) => String(p.id) === String(productId)
        );
        if (!product) return;

        modalTitleSpan.textContent = product.titulo;
        modalImg.innerHTML = `<img src="assets/img/${product.imagen}" alt="${product.titulo}">`;
        modalBenefitsList.innerHTML = "";

        if (Array.isArray(product.beneficios)) {
            product.beneficios.forEach((b) => {
            const li = document.createElement("li");
            li.textContent = b;
            modalBenefitsList.appendChild(li);
            });
        }
        modalPDF.innerHTML = `<a href="javascript: void(0)"><i class="bi bi-filetype-pdf me-2"></i>Descargar Ficha del Product</a>`;

        });
    }

    // Botones catálogo
    if (btnAutomotive) {
        btnAutomotive.addEventListener("click", (e) => {
        e.preventDefault();
        cargarCatalogo("data/automotive.json");

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
        cargarCatalogo("data/industrial.json");

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
    cargarCatalogo("data/automotive.json");

}
// Esperar a que include.js termine de insertar los componentes (igual que app.js)
if (document.readyState === "loading") {
  document.addEventListener("componentsLoaded", initCatalog);
} else {
  initCatalog();
}