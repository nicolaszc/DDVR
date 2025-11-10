document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("catalog");
  const modalEl = document.getElementById("modal-producto");
  const modalTitleSpan = modalEl
    ? modalEl.querySelector("#modal-producto-label span")
    : null;
  const modalBeneficiosList = document.getElementById("modal-producto-beneficios");

  const btnAutomotriz = document.getElementById("btn-catalogo-automotriz");
  const btnIndustrial = document.getElementById("btn-catalogo-industrial");
  const filtersGroup = document.querySelector(".filters-button-group");

  let productosData = [];
  let iso = null;
  let filtroActual = "*";

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
        initIsotope();
      })
      .catch((err) => {
        console.error(err);
        contenedor.innerHTML = `
          <div class="col-12">
            <div class="alert alert-danger">
              Error al cargar el catálogo (${rutaJson}). Revisa la ruta del JSON y ejecuta el sitio desde http:// (no file://).
            </div>
          </div>
        `;
      });
  }

  // Pintar cards
  function renderizarCards(productos) {
    contenedor.innerHTML = "";

    productos.forEach((producto) => {
      const formatosTexto = Array.isArray(producto.formatos)
        ? producto.formatos.join(" / ")
        : (producto.formatos || "");

      // clases de categoría para filtros Isotope
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
              <strong class="me-2">Formatos:</strong> ${formatosTexto}
            </p>
            <div class="d-flex justify-content-between align-items-center mt-4">
              <button
                type="button"
                class="btn btn-sm btn-primary btn-ddvr py-2 px-4"
                data-bs-toggle="modal"
                data-bs-target="#modal-producto"
                data-product-id="${producto.id}">
                Ver Más<i class="bi bi-arrow-right-short ms-2"></i>
              </button>
              <a href="jvascript: void(0)" class="share-btn">
                <small class="text-body-secondary lh-1">
                  <i class="bi bi-share-fill"></i>
                </small>
              </a>
            </div>
          </div>
        </div>
      `;

      contenedor.appendChild(col);
    });
  }

  // Inicializar / refrescar Isotope
  function initIsotope() {
    if (!window.Isotope) return;

    if (!iso) {
      iso = new Isotope(contenedor, {
        itemSelector: ".grid-item",
        layoutMode: "fitRows"
      });
    } else {
      iso.reloadItems();
    }

    iso.arrange({ filter: filtroActual });
  }

  // Modal beneficios
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

  // Botones catálogo
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

  // Filtros Isotope
  if (filtersGroup) {
    filtersGroup.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn || !iso) return;

      // activo visual
      filtersGroup.querySelectorAll("button").forEach((b) =>
        b.classList.remove("active")
      );
      btn.classList.add("active");

      // aplicar filtro
      filtroActual = btn.getAttribute("data-filter") || "*";
      iso.arrange({ filter: filtroActual });
    });
  }

  // Catálogo inicial
  cargarCatalogo("data/catalogo-automotriz.json");
});
