// include.js
document.addEventListener('DOMContentLoaded', () => {
    
    Promise.all([
      // Inculde in all
      includeHTML(window.location.origin + '/components/header.html', 'header', 'include'),
      includeHTML(window.location.origin + '/components/catalogue.html', 'main', 'include'),
      includeHTML(window.location.origin + '/components/footer.html', 'footer', 'include'),
      includeHTML(window.location.origin + '/components/fixed-btns.html', 'fixed-menu', 'include'),
      includeHTML(window.location.origin + '/components/product-modal.html', 'product-modal', 'include'),
      includeHTML(window.location.origin + '/components/contact-form.html', 'contact-form', 'include')
      
    ]).then(() => {
      console.log('Componentes cargados ✅');
      document.dispatchEvent(new Event('componentsLoaded'));
    });
  
});




