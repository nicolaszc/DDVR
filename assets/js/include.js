// include.js
document.addEventListener('DOMContentLoaded', () => {

  
    console.log('Home');
  
    Promise.all([
      includeHTML('components/header.html', 'header', 'include'),
      includeHTML('components/catalogo.html', 'main', 'include'),
      includeHTML('components/hero.html', 'main', 'insert'),
      includeHTML('components/footer.html', 'footer', 'include'),
      includeHTML('components/fixed-menu.html', 'fixed-menu', 'include'),
      includeHTML('components/product-modal.html', 'product-modal', 'include'),
      includeHTML('components/contact-form.html', 'contact-form', 'include')
    ]).then(() => {
      console.log('Componentes cargados ✅');
      document.dispatchEvent(new Event('componentsLoaded'));
    });
  
});

function includeHTML(file, elementId, method) {
  let includeElementTarget = document.getElementById(elementId);
  return fetch(file)
    .then(response => {
      if (!response.ok) throw new Error(`No se pudo cargar ${file}`);
      return response.text();
    })
    .then(data => {
      if(method == 'include'){
        includeElementTarget.innerHTML = data;
      }
      if(method == 'insert'){
        includeElementTarget.insertAdjacentHTML('afterbegin', data);
      }
    });
}


