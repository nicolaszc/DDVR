// main.js

window.basePath = window.location.pathname.includes('/develop')
  ? '/develop'
  : '';

Promise.all([
  includeHTML(`components/header.php`, 'header', 'include'),
  includeHTML(`components/footer.html`, 'footer', 'include'),
  includeHTML(`components/fixed-btns.html`, 'fixed-menu', 'include'),
  includeHTML(`components/contact-form.html`, 'contact-form', 'include')
])

.then(() => {
  document.dispatchEvent(new Event("componentsLoaded"));

  if (typeof initApp === 'function') initApp();

  // Ejecutar router al cargar la página
  router();

  window.onpopstate = router;
})
.catch(err => console.error(err));

