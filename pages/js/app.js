let siteRoot = document.getElementById('site-path').content; // o lo que estés usando
siteRoot = siteRoot + '/';
/* [...document.getElementsByTagName('script')].forEach(scriptTag => {
  let src = scriptTag.getAttribute('src');

  // ignora scripts inline o externos absolutos
  if (!src || src.startsWith('http') || src.startsWith(siteRoot)) return;

  // si empieza con "./" o "/"
  if (src.startsWith('./')) src = src.slice(1);
  if (src.startsWith('/')) src = src.slice(1);

  scriptTag.src = siteRoot + src;
});

[...document.getElementsByTagName('link')].forEach(linkTag => {
  let src = linkTag.getAttribute('href');

  // ignora scripts inline o externos absolutos
  if (!src || src.startsWith('http') || src.startsWith(siteRoot)) return;

  // si empieza con "./" o "/"
  if (src.startsWith('./')) src = src.slice(1);
  if (src.startsWith('/')) src = src.slice(1);

  linkTag.src = siteRoot + src;
}); */
// =========================
// Variables globales
// =========================
const headerAnchor = document.getElementById("header");
let hasClass = null;
const aboutClassToCheck = 'collapsed';
let btnAbout = null;
const toTop = document.querySelector('.to-top');


// =========================
// Init
// =========================
function initApp() {
  
  btnAbout = document.getElementById("btn-about");
   
  hasClass = btnAbout.classList.contains(aboutClassToCheck);
 
  const iconAt = document.getElementById("icon-at");
  const iconLg = document.getElementById("icon-lg");
  const iconSm = document.getElementById("icon-sm");
 
  //const metaSiteRoot = document.getElementById("site-root");
  iconAt.setAttribute('href', siteRoot + 'assets/img/ico.png');
  iconLg.setAttribute('href', siteRoot + 'assets/img/ico.png');
  iconSm.setAttribute('href', siteRoot + 'assets/img/ico.png');

  
  //metaSiteRoot.setAttribute('content', siteRoot)

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

function scrollToTop(){
  headerAnchor.scrollIntoView();
  console.log('toTop');
}
function navbarHeaderCollapsel() {
  var navbarHeaderCollapse = new bootstrap.Collapse(document.getElementById('navbarHeader'), {
      toggle: false // Prevent default toggling
  });
  navbarHeaderCollapse.hide();
}

if (document.readyState === "loading") {
  document.addEventListener("componentsLoaded", initApp);
  
} else {
  initApp();
}
