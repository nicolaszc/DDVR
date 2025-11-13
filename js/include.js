// include.js
document.addEventListener("DOMContentLoaded", () => {
Promise.all([
    includeHTML("../header.html", "header"),
    includeHTML("../footer.html", "footer"),
    includeHTML("../components.html", "components")
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


