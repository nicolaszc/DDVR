// include.js
document.addEventListener("DOMContentLoaded", () => {

  if (window.location.href === "https://ddvr.cl" || window.location.href === "http://localhost:3000/") {
    console.log("Index");
  
    Promise.all([includeHTML("components/header-no-nav.html", "header"),
      includeHTML("components/footer.html", "footer")
    ]).then(() => {
      console.log("Componentes cargados ✅");
      document.dispatchEvent(new Event("componentsLoaded"));
    });
  }

  if (window.location.href === "https://ddvr.cl/home.html" || window.location.href === "http://localhost:3000/home.html") {
    console.log("Home");
  
    Promise.all([
      includeHTML("components/header.html", "header"),
      includeHTML("components/footer.html", "footer"),
      includeHTML("components/fixed-menu.html", "fixed-menu"),
      includeHTML("components/product-modal.html", "product-modal"),
      includeHTML("components/contact-form.html", "contact-form")
    ]).then(() => {
      console.log("Componentes cargados ✅");
      document.dispatchEvent(new Event("componentsLoaded"));
    });
  }
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


