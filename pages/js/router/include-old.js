document.addEventListener('DOMContentLoaded', () => {
  // Detecta si estamos en /testing o en la raíz

  // Cargar componentes globales que siempre están: header, footer, botones, modales, contacto
  Promise.all([
    includeHTML('/components/header.html', 'header', 'include'),
    includeHTML('/components/footer.html', 'footer', 'include'),
    includeHTML('/components/fixed-btns.html', 'fixed-menu', 'include'),
    includeHTML('/components/contact-form.html', 'contact-form', 'include')
  ]).then(() => {
    console.log('Componentes globales cargados ✅');
    document.dispatchEvent(new Event('componentsLoaded'));

    // Inicializa la app general (scroll, header, etc.)
    if (typeof initApp === 'function') initApp();

    // Inicializa el router
    router();
    window.onpopstate = router; // Back/forward del navegador
  });
});

// Función de router: decide qué cargar en main según la URL
async function router() {
  const main = document.getElementById('main');
  const path = window.location.pathname;

  // Limpia el contenido previo
  main.innerHTML = '';

  if(path === '/' || path.endsWith('/') || path === '/index.html') {
    // Página home / catálogo
    await includeHTML('/components/plp.html', 'main', 'include');
    document.dispatchEvent(new Event('plpLoaded'));
  } 
  else if(path.startsWith('/producto/')) {
    // Página PDP
    const productName = decodeURIComponent(path.split('/producto/')[1]);
    await includeHTML('/components/pdp.html', 'main', 'include');
    document.dispatchEvent(new CustomEvent('pdpLoaded', { detail: { name: productName }}));
  } 
  else {
    // Página no encontrada
    main.innerHTML = '<h2>Página no encontrada:</h2>';
  }
}

// Función para navegar sin recargar
function navigate(url) {
  window.history.pushState(null, null, url);
  router();
}

// Función de inclusión de HTML (async)
async function includeHTML(file, elementId, method) {
  let includeElementTarget = document.getElementById(elementId);
  const response = await fetch(file);
  if (!response.ok) throw new Error(`No se pudo cargar ${file}`);
  const data = await response.text();
  if (method === 'include') includeElementTarget.innerHTML = data;
  if (method === 'insert') includeElementTarget.insertAdjacentHTML('afterbegin', data);
}
