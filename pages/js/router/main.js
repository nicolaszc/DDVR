// main.js

// Detecta si estamos en /testing o producción
/* window.basePath = window.location.pathname.includes('/develop')
  ? '/develop'
  : '';

Promise.all([
  includeHTML('./components/header.html', 'header', 'include'),
  includeHTML('./components/footer.html', 'footer', 'include'),
  includeHTML('./components/fixed-btns.html', 'fixed-menu', 'include'),
  includeHTML('./components/contact-form.html', 'contact-form', 'include')
])
.then(() => {
  // Avisar a app.js que ya están los componentes
  document.dispatchEvent(new Event("componentsLoaded"));

  // Lógica general
  if (typeof initApp === 'function') initApp();

  // Iniciar router
  router();

  // Soporta back/forward
  window.onpopstate = router;
})
.catch(err => console.error(err)); */

// main.js

window.basePath = window.location.pathname.includes('/develop')
  ? '/develop'
  : '';

Promise.all([
  includeHTML(`components/header.html`, 'header', 'include'),
  includeHTML(`components/footer.html`, 'footer', 'include'),
  includeHTML(`components/fixed-btns.html`, 'fixed-menu', 'include'),
  includeHTML(`components/contact-form.html`, 'contact-form', 'include')
])

.then(() => {
  document.dispatchEvent(new Event("componentsLoaded"));

  if (typeof initApp === 'function') initApp();

  // Ejecutar router al cargar la página
  router();

  // Detectar si hay un id de producto en la URL y disparar initPdp
  /* const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  if (productId) {
    document.addEventListener('pdpLoaded', () => {
      initPdp();
    }, { once: true });
  } */

  // Soporta back/forward
  window.onpopstate = router;
})
.catch(err => console.error(err));

