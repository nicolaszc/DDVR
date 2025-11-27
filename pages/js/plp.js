// =========================
// Variables globales
// =========================
let hero = null; 
let btnAutomotive = null; 
let btnIndustrial = null;
let filtersGroup = null; 
let filterGroupBtns = null; 
let filterAnchor = null; 
let filterIconParent = null;
let filterIconObject = null;
let myStorageObject = null;
let filterOpenBtn = "";
let btn = "";
let btnSort = "";

let plp = null;

let grid = null;   
let actualFilter = "*";
let sortByValue = null;

let productsData = [];
let currentCatalog = "automotive"
function getJsonRoute() {
  return `${siteRoot}data/${currentCatalog}.json`;
}

function changeCatalog(name) {
  currentCatalog = name;
  catalogBtnsActive(name);
  loadPlp(getJsonRoute());

}

// ⬅️ ESTA ES LA ÚNICA LÍNEA CAMBIADA ARRIBA
let templatesReady = null;

const main = document.querySelector('main');
let currentHeight = "";

// =========================
// Init
// =========================

function initPlp() {
    // ====== SELECTORES ======
    console.log('PLP cargada ✔ at ' + siteRoot);
    plp = document.getElementById("plp");

    // ====== CARGA INICIAL ======
    hero = document.getElementById("hero");
    btnAutomotive = document.getElementById("btn-automotive");
    btnIndustrial = document.getElementById("btn-industrial");
    footer = document.querySelector("footer");
    changeCatalog(currentCatalog);
    
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
        col.querySelector('.card-ddvr').style.visibility = 'visible';
    });
    animateView('.plp-container');
    attachCardListener('.card-ddvr .btn-ddvr, .card-ddvr img');
}


// ===============================
// Inicializar / refrescar Isotope
// ===============================

function initIsotope() {
    if (!window.Isotope) return;

    if (!grid) {
        grid = new Isotope(plp, {
            itemSelector: ".grid-item",
            layoutMode: "fitRows",
            fitRows: {
                equalheight: true
            },
            getSortData: {
                name: '.name'
            }
        });
        bindPlpControls();  
    } else {
        grid.reloadItems();
    }
    
    grid.arrange({ filter: actualFilter });     
    grid.arrange({ sortBy : sortByValue });  
}


// ===============================
// Bind Filter, Sort y Btns
// ===============================

function bindPlpControls() {
    console.log("Binding PLP controls...");   
    
    filtersGroup = document.querySelector(".filters-button-group");
    filterGroupBtns = document.querySelectorAll("button.btn-filter");
    btnSort = document.getElementById("sort");
    filterAnchor = document.getElementById("filter-anchor");
    filterIconParent = null;
    filterIconObject = document.getElementById('filter-icon');
    myStorageObject = { storedElement: filterIconObject}; 
    filterOpenBtn = document.querySelector(('button:has(span#filter-icon-container'));

    console.log('1. ' + sortByValue)
    if(!btn){ 
        btn = document.querySelector('[data-filter = "*"');
    }else{
        btn = document.querySelector('[data-filter = "' + actualFilter + '"]');
    }

    if(!sortByValue){
        sortByValue = "original-order";
    }
    filterActive(btn);
    
    console.log('2. ' + sortByValue)
    sortActive();
    if (btnAutomotive) {
        btnAutomotive.addEventListener("click", (e) => {
        e.preventDefault();
        changeCatalog("automotive");
        });
    }

    if (btnIndustrial) {
        btnIndustrial.addEventListener("click", (e) => {
        e.preventDefault();
        changeCatalog("industrial");       
        });
    }
   
        filtersGroup.addEventListener('click', (e) => {
            btn = e.target.closest('button.btn-filter');
            if (!btn || !grid) return;           

            filterActive(btn)

            // aplicar filtro
            actualFilter = btn.getAttribute('data-filter') || '*';
            console.log(actualFilter)
            grid.arrange({ filter: actualFilter });
            // Esperar a que termine Isotope de reorganizar
grid.once('arrangeComplete', () => {
    filterAnchor.scrollIntoView({ behavior: 'smooth' });
});
            
        });
    

    if(btnSort){
        btnSort.addEventListener('click', () =>{
            if (!btnSort || !grid) return;

            sortByValue = btnSort.getAttribute('data-sort-by');
            grid.arrange({ sortBy : sortByValue });

            sortActive()
           
        })
    }
}


// =========================================
// Activar Filter, Sort y Btns
// =========================================

function catalogBtnsActive(name){
    if(name == 'automotive'){
        btnIndustrial.classList.replace("btn-primary", "btn-secondary");
        btnAutomotive.classList.replace("btn-secondary", "btn-primary");
        hero.classList.replace("industrial", "automotriz");
    }
    if(name == 'industrial'){
        btnIndustrial.classList.replace("btn-secondary", "btn-primary");
        btnAutomotive.classList.replace("btn-primary", "btn-secondary");
        hero.classList.replace("automotriz", "industrial");
    }
}

function filterActive(btn){
    filterIconParent = document.getElementById('filter-icon-container');
    filterIconParent.removeChild(filterIconObject);
    filterIconParent.removeAttribute('id');

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
    
}

function sortActive(){
    console.log('3. ' + sortByValue)
    if(sortByValue == 'name'){
        btnSort.setAttribute('data-sort-by' , 'original-order');
        btnSort.classList.add('active')
    }else{
        btnSort.setAttribute('data-sort-by' , 'name');
        btnSort.classList.remove('active')
       
    }  
    console.log('4. ' + sortByValue)  
}

// =========================
// Esperar include.js
// =========================

document.addEventListener("plpLoaded", () => {

    templatesReady = fetch(siteRoot + 'components/card.php')
    .then(res => res.text())
    .then(html => {
        cardTemplate = html;
    })
    .catch(err => console.error("Error cargando card template", err));

    initPlp();
    //bindPlpControls();     
});
