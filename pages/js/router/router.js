
async function router() {
  const main = document.getElementById('main');
  const path = window.location.pathname.replace(window.basePath, '');

  main.innerHTML = '';

  if (path === '/' || path === '/index.html') {
    await includeHTML('pages/plp.html', 'main', 'include');
    //animatePlp();
    console.log('router PLP')
    document.dispatchEvent(new Event('plpLoaded'));
  }
  else if (path.startsWith('/producto/')) {
    const slug = decodeURIComponent(path.split('/producto/')[1]);
    await includeHTML('pages/pdp.html', 'main', 'include');
    console.log('router PDP')
    document.dispatchEvent(new CustomEvent('pdpLoaded', { detail: { name: slug }}));
  }
  else {
    main.innerHTML = '<h2>Página no encontrada</h2>';
  }
}

// Función para navegar sin recargar
function navigate(url) {
  window.history.pushState(null, null, basePath + url);
  router();
}