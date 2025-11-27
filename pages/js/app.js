// =========================
// Site Root from <?= $base ?>
// =========================

let siteRoot = document.getElementById('site-path').content; // o lo que estés usando
siteRoot = siteRoot + '/';


// =========================
// Variables globales
// =========================

const headerAnchor = document.getElementById("header");
let hasClass = null;
const aboutClassToCheck = 'collapsed';
let btnAbout = null;
const toTop = document.querySelector('.to-top');
window._lastPath = window.location.pathname;

// =========================
// Restaurar scroll manual
// =========================
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}


// =========================
// Init
// =========================

function initApp() {
  
  btnAbout = document.getElementById("btn-about");
   
  hasClass = btnAbout.classList.contains(aboutClassToCheck);
 
  const iconAt = document.getElementById("icon-at");
  const iconLg = document.getElementById("icon-lg");
  const iconSm = document.getElementById("icon-sm");
 
  iconAt.setAttribute('href', siteRoot + 'assets/img/ico.png');
  iconLg.setAttribute('href', siteRoot + 'assets/img/ico.png');
  iconSm.setAttribute('href', siteRoot + 'assets/img/ico.png');

  // TO TOP
  if (toTop) {
    toTop.addEventListener('click', e => {
      e.preventDefault();
        scrollToTop();
    });
  }

  // ABOUT scroll
  if (btnAbout) {
    btnAbout.addEventListener('click', e => {
      if (hasClass) scrollToTop();
    });
  }

}


// =========================
// Scroll top
// =========================

function scrollToTop(){
  headerAnchor.scrollIntoView();
}


// =========================
// Cerrar about
// =========================

function navbarHeaderCollapsel() {
  var navbarHeaderCollapse = new bootstrap.Collapse(document.getElementById('navbarHeader'), {
      toggle: false // Prevent default toggling
  });
  navbarHeaderCollapse.hide();
}


// =========================
// Listener Btns Card
// =========================

function attachCardListener(){
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

            currentHeight = main.offsetHeight;
            main.style.height = currentHeight + 'px';
            el.classList.remove("show");
            footer.classList.remove("show");

            navigate(`/producto/${slug}?id=${productId}`);
      
        });
    });
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


// =========================
// Animar vistas
// =========================

function animateView(selector) {
    el = document.querySelector(selector);
    if (!el) return;

    const currentPath = window.location.pathname;
    const isNewView = currentPath !== window._lastPath;
    window._lastPath = currentPath; // actualizar para la próxima navegación

    if (isNewView) {
        history.scrollRestoration = 'manual';
    }

    const startAnimation = () => {
        el.classList.add("show");
        main.style.height = '';
        footer.classList.add("show");
    };

    if (window.scrollY === 0) {
        startAnimation();
    } else {
        window.addEventListener('scrollend', startAnimation, { once: true });
        scrollToTop();
    }

}


// =========================
// Esperar include.js
// =========================

if (document.readyState === "loading") {
  document.addEventListener("componentsLoaded", initApp); 
} else {
  initApp();
}
