// include.js
document.addEventListener("DOMContentLoaded", () => {
Promise.all([
    includeHTML("components/header.html", "header"),
    includeHTML("components/footer.html", "footer"),
    includeHTML("components/theme-toggle.html", "theme-toggle"),
    includeHTML("components/product-modal.html", "product-modal"),
    includeHTML("components/contact-form.html", "contact-form")
  ]).then(() => {
    console.log("Componentes cargados ✅");
    document.dispatchEvent(new Event("componentsLoaded"));
  });
});

function includeHTML(file, elementId) {
  return fetch(file)
    .then(response => {
      if (!response.ok) throw new Error(`No se pudo cargar ${file}`);
      return response.text();
    })
    .then(data => {
      document.getElementById(elementId).innerHTML = data;
    });
}


