document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("catalog");
  const modalEl = document.getElementById("modal-producto");
  const modalTitleSpan = modalEl
    ? modalEl.querySelector("#modal-producto-label span")
    : null;
  const modalBeneficiosList = document.getElementById("modal-producto-beneficios");

  const btnAutomotriz = document.getElementById("btn-catalogo-automotriz");
  const btnIndustrial = document.getElementById("btn-catalogo-industrial");

  let productosData = [];
  let iso = null; // para Isotope si luego lo agregas

  // Cargar catálogo desde JSON
  function cargarCatalogo(rutaJson) {
    contenedor.innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
    `;

    fetch(rutaJson)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar " + rutaJson);
        return res.json();
      })
      .then((data) => {
        productosData = data;
        renderizarCards(data);
      })
      .catch((err) => {
        console.error(err);
        contenedor.innerHTML = `
          <div class="col-12">
            <div class="alert alert-danger">
              Error al cargar el catálogo (${rutaJson}). Revisa la ruta del JSON o ejecuta el sitio desde un servidor (no file://).
            </div>
          </div>
        `;
      });
  }

  // Render de las cards
  function renderizarCards(productos) {
    contenedor.innerHTML = "";

    productos.forEach((producto) => {
      const formatosTexto = Array.isArray(producto.formatos)
        ? producto.formatos.join(" / ")
        : (producto.formatos || "");

      // Clases de categoría (para futuros filtros con Isotope)
      const categoriaClase = (producto.categoria || "")
        .split(" ")
        .map((c) => c.trim())
        .filter(Boolean)
        .join(" ");

      const col = document.createElement("div");
      col.className = `col grid-item ${categoriaClase}`;

      col.innerHTML = `
        <div class="card shadow-sm h-100 d-flex flex-column">
          <div class="card-img">
            <img src="img/${producto.imagen}" alt="${producto.titulo}">
          </div>
          <div class="card-body d-flex flex-column">
            <h4>${producto.titulo}</h4>
            <p class="card-text flex-grow-1">${producto.descripcion}</p>
            <p class="card-presentation d-flex align-items-center mb-2">
              <i class="bi bi-info-circle me-2"></i><strong class="me-2">Formatos:</strong> ${formatosTexto}
            </p>
            <div class="d-flex justify-content-between align-items-center mt-4">
              <button
                type="button"
                class="btn btn-sm btn-primary p-2"
                data-bs-toggle="modal"
                data-bs-target="#modal-producto"
                data-product-id="${producto.id}">
                Ver Más
              </button>
              <a href="jvascript: void(0)" class="share-btn">
                <small class="text-body-secondary">
                        <i class="bi bi-share-fill"></i> Compartir
                </small>
              </a>
            </div>
          </div>
        </div>
      `;

      contenedor.appendChild(col);
    });

    // Si Isotope está cargado en la página, se inicializa/actualiza
    if (window.Isotope) {
      if (!iso) {
        iso = new Isotope(contenedor, {
          itemSelector: ".grid-item",
          layoutMode: "fitRows"
        });
      } else {
        iso.reloadItems();
        iso.layout();
      }
    }
  }

  // change is-checked class on buttons
  var buttonGroups = document.querySelectorAll(".filters-button-group");
  for (var i = 0, len = buttonGroups.length; i < len; i++) {
    var buttonGroup = buttonGroups[i];
    filterButtonGroup(buttonGroup);
  }

  function filterButtonGroup(buttonGroup) {
    buttonGroup.addEventListener("click", function(event) {
      // only work with buttons
      if (!matchesSelector(event.target, "button")) {
        return;
      }
      buttonGroup.querySelector(".active").classList.remove("active");
      event.target.classList.add("active");
    });
  }

  // Lógica del modal
  if (modalEl && modalTitleSpan && modalBeneficiosList) {
    modalEl.addEventListener("show.bs.modal", (event) => {
      const boton = event.relatedTarget;
      if (!boton) return;

      const productId = boton.getAttribute("data-product-id");
      const producto = productosData.find(
        (p) => String(p.id) === String(productId)
      );
      if (!producto) return;

      modalTitleSpan.textContent = producto.titulo;
      modalBeneficiosList.innerHTML = "";

      if (Array.isArray(producto.beneficios)) {
        producto.beneficios.forEach((b) => {
          const li = document.createElement("li");
          li.textContent = b;
          modalBeneficiosList.appendChild(li);
        });
      }
    });
  }

  // Eventos botones catálogo
  if (btnAutomotriz) {
    btnAutomotriz.addEventListener("click", (e) => {
      e.preventDefault();
      cargarCatalogo("data/catalogo-automotriz.json");

      btnAutomotriz.classList.add("btn-primary");
      btnAutomotriz.classList.remove("btn-secondary");
      if (btnIndustrial) {
        btnIndustrial.classList.add("btn-secondary");
        btnIndustrial.classList.remove("btn-primary");
      }
    });
  }

  if (btnIndustrial) {
    btnIndustrial.addEventListener("click", (e) => {
      e.preventDefault();
      cargarCatalogo("data/catalogo-industrial.json");

      btnIndustrial.classList.add("btn-primary");
      btnIndustrial.classList.remove("btn-secondary");
      if (btnAutomotriz) {
        btnAutomotriz.classList.add("btn-secondary");
        btnAutomotriz.classList.remove("btn-primary");
      }
    });
  }

  // (Opcional futuro) filtros con Isotope si agregas .filters-button-group
  const filtersGroup = document.querySelector(".filters-button-group");
  if (filtersGroup) {
    filtersGroup.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn || !iso) return;
      const filterValue = btn.getAttribute("data-filter");
      iso.arrange({ filter: filterValue });
    });
  }

  // Catálogo inicial
  cargarCatalogo("data/catalogo-automotriz.json");
});
