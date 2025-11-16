function initApp() {

  const headerAnchor = document.getElementById("header");
  const btnAbout = document.getElementById("btn-about");
  const aboutClassToCheck = 'collapsed';
  let hasClass = true;
  
  const catalog = document.getElementById("catalog");
  const modalEl = document.getElementById("modal-product");
  const modalTitleSpan = modalEl
    ? modalEl.querySelector("#modal-product-label span")
    : null;
  const modalImg = document.getElementById("modal-img");
  const modalBenefitsList = document.getElementById("modal-product-beneficios");
  const modalPDF = document.getElementById("modal-pdf");

  const btnAutomotive = document.getElementById("btn-automotive-catalog");
  const btnIndustrial = document.getElementById("btn-industrial-catalog");

  const filtersGroup = document.querySelector(".filters-button-group");

  let filterIconParent = null;
  const filterIconObject = document.getElementById('filter-icon');
  let myStorageObject = {
      storedElement: filterIconObject
  }; 

  const filterAnchor = document.getElementById('filter-anchor');
  //const firstFilterIconParent = document.querySelector(".first.filter-icon-container");

  const btnSort = document.querySelector(".btn-sort");

  /* const qrCode = document.getElementById('qr-code');
  const copyQrCode = document.getElementById('copy-qr');
  if (qrCode) {
    qrCode.addEventListener("click", async () => {
      // Tomamos la URL a copiar desde data-share o src si no existe
      const imageUrl = qrCode.dataset.share || qrCode.src;
      console.log('click');
      try {
        // Intentamos copiar la imagen como blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        copyQrCode.innerText = 'QR copiado!';
        copyQrCode.classList.add('copied');
        const clipboardItem = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([clipboardItem]);

        console.log("QR copiado como imagen al portapapeles 📋");
        setTimeout(() => {
            copyQrCode.innerText = 'Click y\ncopia QR';
            copyQrCode.classList.remove('copied');
        }, 8000);
      } catch (err) {
        // Si falla, hacemos fallback copiando la URL
        try {
          await navigator.clipboard.writeText(imageUrl);
          console.log("QR no se pudo copiar como imagen, se copió la URL 📋");
        } catch (err2) {
          console.error("No se pudo copiar el QR ni la URL:", err2);
        }
      }
    });
  } */

 
  // --- 1️⃣ Generar QR ---
  // Get the element where the QR code will be displayed
const qrCodeContainer = document.getElementById("qr-code");

// Define the data to be encoded in the QR code
const qrLocation = window.location.href;

// Create a new QRCode instance
const qrcode = new QRCode(qrCodeContainer, {
    width: 100,
    height: 100,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.L
});

qrcode.makeCode(qrLocation);

let qrCodeData = qrCodeContainer.querySelector('img');

// --- Aquí reemplazamos el setTimeout por el observer ---

const observer = new MutationObserver(() => {
    
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (qrCodeData) {
        qrCodeContainer.setAttribute('data-share', qrCodeData.src);
        ogImage.setAttribute('content', qrCodeData.src);
        observer.disconnect();
    }
});
observer.observe(qrCodeContainer, { childList: true });

// --- Resto de tu código sin cambios ---
const copyQrCode = document.getElementById('copy-qr');
if (qrCodeContainer) {
    qrCodeContainer.addEventListener("click", async () => {
        // Tomamos la URL a copiar desde data-share o src si no existe
        const imageUrl = qrCodeContainer.dataset.share || qrCodeData.src;
        console.log('click');
        try {
            // Intentamos copiar la imagen como blob
            const response = await fetch(imageUrl);
            const blob = await response.blob();

            copyQrCode.innerText = 'QR copiado!';
            copyQrCode.classList.add('copied');
            const clipboardItem = new ClipboardItem({ [blob.type]: blob });
            await navigator.clipboard.write([clipboardItem]);

            console.log("QR copiado como imagen al portapapeles 📋");
            setTimeout(() => {
                copyQrCode.innerText = 'Click y\ncopia QR';
                copyQrCode.classList.remove('copied');
            }, 8000);
        } catch (err) {
            // Si falla, hacemos fallback copiando la URL
            try {
                await navigator.clipboard.writeText(imageUrl);
                console.log("QR no se pudo copiar como imagen, se copió la URL 📋");
            } catch (err2) {
                console.error("No se pudo copiar el QR ni la URL:", err2);
            }
        }
    });
}

// --- Generar link WhatsApp dinámico ---
const message = `Comparte 🙏\nQR: ${qrLocation}`;
const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

const whatsappLink = document.getElementById('share-whatsapp');
if (whatsappLink) {
    whatsappLink.href = whatsappUrl;
}



  let productsData = [];
  let iso = null;
  let actualFilter = "*";

  if(btnAbout){
    btnAbout.addEventListener('click', (e) => {
      console.log("click");
      hasClass = btnAbout.classList.contains(aboutClassToCheck);
      if(hasClass){ 
        console.log("open");
        headerAnchor.scrollIntoView();
      }
      
    });
  }
  // Cargar catálogo desde JSON
  if (window.location.href === "https://ddvr.cl/home.html" || window.location.href === "http://localhost:3000/home.html") {
    function cargarCatalogo(jsonRoute) {
      catalog.innerHTML = `
        <div class="col-12 text-center py-4">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      `;

      fetch(jsonRoute)
        .then((res) => {
          if (!res.ok) throw new Error("No se pudo cargar " + jsonRoute);
          return res.json();
        })
        .then((data) => {
          productsData = data;
          renderizarCards(data);
          initIsotope();
        })
        .catch((err) => {
          console.error(err);
          catalog.innerHTML = `
            <div class="col-12">
              <div class="alert alert-danger">
                Error al cargar el catálogo (${jsonRoute}). Revisa la ruta del JSON y ejecuta el sitio desde http:// (no file://).
              </div>
            </div>
          `;
        });
    }
 
    // Pintar cards
    function renderizarCards(products) {
      catalog.innerHTML = "";

      products.forEach((product) => {
        const formatosTexto = Array.isArray(product.formatos)
          ? product.formatos.join(" / ")
          : (product.formatos || "");

        // clases de categoría para filtros Isotope
        const categoriaClase = (product.categoria || "")
          .split(" ")
          .map((c) => c.trim())
          .filter(Boolean)
          .join(" ");

        const col = document.createElement("div");
        col.className = `col grid-item ${categoriaClase}`;

        col.innerHTML = `
          <div class="card shadow mb-2 h-100 d-flex flex-column card-ddvr">
            <div class="card-img pt-5">
              <img src="assets/img/${product.imagen}" alt="${product.titulo}">
            </div>
            <div data-bs-theme="dark" class="bg-dark card-body d-flex flex-column py-4">
              <div class="card-main-info">
                <h4 class="name">${product.titulo}</h4>
                <p class="card-text flex-grow-1">${product.descripcion}</p>
              </div>
              <p class="card-presentation d-flex align-items-center mb-2">
                <strong class="me-2">Formatos:</strong> ${formatosTexto}
              </p>
              <div class="d-flex justify-content-between align-items-center mt-4">
                <button
                  type="button"
                  class="btn btn-sm btn-primary btn-ddvr py-2 px-4"
                  data-bs-toggle="modal"
                  data-bs-target="#modal-product"
                  data-product-id="${product.id}">
                  Ver Más<i class="bi bi-arrow-right-short"></i>
                </button>
                  
                <div class="share-container d-flex align-items-center">
                  <ul class="list-unstyled d-flex m-0 rrss">
                    <li class="d-flex align-items-center my-0">
                        <a href="#"><i class="bi bi-whatsapp ms-2"></i></a> 
                    </li>
                    <li class="d-flex align-items-center my-0">
                        <a href="https://www.instagram.com/distribuidoradvr/" target="_blank"><i class="bi bi-instagram ms-2"></i></a>
                    </li>
                    <li class="d-flex align-items-center my-0">
                        <a href="https://cl.linkedin.com/company/distribuidora-dvr" target="_blank"><i class="bi bi-linkedin ms-2"></i></a> 
                    </li>
                  </ul>
                  <button class="btn share-btn lh-1 d-flex pe-0">
                      <i class="bi bi-share-fill"></i>
                  </button>
                </div>
            
              </div>
            </div>
          </div>
        `;

        catalog.appendChild(col);
      });

      // 🔹 Agregar listeners de share después de renderizar todas las cards
      const shareButtons = catalog.querySelectorAll(".share-btn");

      shareButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const rrssCurrent = btn.closest(".share-container").querySelector(".rrss");
          if (!rrssCurrent) return;

          // 🔹 activar todos los demás .shareButtons
          shareButtons.forEach((el) => {
            if (el !== btn) el.classList.remove("active");
          });

          // 🔹 Alternar el actual
          btn.classList.toggle("active");

          // 🔹 Cerrar todos los demás .rrss
          const allRrss = catalog.querySelectorAll(".rrss");
          allRrss.forEach((el) => {
            if (el !== rrssCurrent) el.classList.remove("active");
          });

          // 🔹 Alternar el actual
          rrssCurrent.classList.toggle("active");
        });
      });

    }

    // Inicializar / refrescar Isotope
    function initIsotope() {
      if (!window.Isotope) return;

      if (!iso) {
        iso = new Isotope(catalog, {
          itemSelector: ".grid-item",
          layoutMode: "fitRows",
          fitRows: {
              equalheight: true
            },
          getSortData: {
          name: '.name' // text from querySelector
          }
        });
      } else {
        iso.reloadItems();
      }

      iso.arrange({ filter: actualFilter });
      
    }

    // Modal beneficios
    if (modalEl && modalTitleSpan && modalBenefitsList) {
      modalEl.addEventListener("show.bs.modal", (event) => {
        const boton = event.relatedTarget;
        if (!boton) return;

        const productId = boton.getAttribute("data-product-id");
        const product = productsData.find(
          (p) => String(p.id) === String(productId)
        );
        if (!product) return;

        modalTitleSpan.textContent = product.titulo;
        modalImg.innerHTML = `<img src="assets/img/${product.imagen}" alt="${product.titulo}">`;
        modalPDF.innerHTML = `<a href="javascript: void(0)"><i class="bi bi-filetype-pdf me-2"></i>Descargar Ficha del Product</a>`;
        modalBenefitsList.innerHTML = "";

        if (Array.isArray(product.beneficios)) {
          product.beneficios.forEach((b) => {
            const li = document.createElement("li");
            li.textContent = b;
            modalBenefitsList.appendChild(li);
          });
        }
      });
    }

    // Botones catálogo
    if (btnAutomotive) {
      btnAutomotive.addEventListener("click", (e) => {
        e.preventDefault();
        cargarCatalogo("assets/data/catalogo-automotriz.json");

        btnAutomotive.classList.add("btn-primary");
        btnAutomotive.classList.remove("btn-secondary");
        if (btnIndustrial) {
          btnIndustrial.classList.add("btn-secondary");
          btnIndustrial.classList.remove("btn-primary");
        }
      });
    }

    if (btnIndustrial) {
      btnIndustrial.addEventListener("click", (e) => {
        e.preventDefault();
        cargarCatalogo("assets/data/catalogo-industrial.json");

        btnIndustrial.classList.add("btn-primary");
        btnIndustrial.classList.remove("btn-secondary");
        if (btnAutomotive) {
          btnAutomotive.classList.add("btn-secondary");
          btnAutomotive.classList.remove("btn-primary");
        }
      });
    }

    // Filtros Isotope
    if (window.innerWidth >= 768) {
      /* filterIconParent = document.getElementById('filter-icon-container');
      filterIconParent.removeChild(filterIconObject);
      filterIconParent.removeAttribute('id');
      firstFilterIconParent.prepend(myStorageObject.storedElement);
      firstFilterIconParent.setAttribute('id', 'filter-icon-container'); */
    }

    if (filtersGroup) {
      filtersGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('button.btn-filter');
        if (!btn || !iso) return;

        filterAnchor.scrollIntoView();
        const filterGroupBtns = filtersGroup.querySelectorAll('button.btn-filter');

        filterIconParent = document.getElementById('filter-icon-container');
        filterIconParent.removeChild(filterIconObject);
        filterIconParent.removeAttribute('id');
        
        // activo visual
        filterGroupBtns.forEach((b) => 
          b.classList.remove('active')
        );

        const iconContainer = btn.querySelector('.filter-icon-container')
        iconContainer.prepend(myStorageObject.storedElement);
        iconContainer.setAttribute('id', 'filter-icon-container');
        btn.classList.add('active');


        // aplicar filtro
        actualFilter = btn.getAttribute('data-filter') || '*';
        iso.arrange({ filter: actualFilter });
      });
    }

    if(btnSort){
      btnSort.addEventListener('click', (e) =>{
          if (!btnSort || !iso) return;

          var sortByValue = btnSort.getAttribute('data-sort-by');
          iso.arrange({ sortBy : sortByValue });

          if(sortByValue == 'name'){
            btnSort.setAttribute('data-sort-by' , 'original-order');
          }else{
            btnSort.setAttribute('data-sort-by' , 'name');
          }
          
          btnSort.classList.toggle('active');
      })
    }

    // Catálogo inicial
    cargarCatalogo("assets/data/catalogo-automotriz.json");

    // --- FORMULARIO DE CONTACTO ---
    const form = document.getElementById("contact_form");

    if (form) {
      const nameInput = document.getElementById("name");
      const lastNameInput = document.getElementById("last-name");
      const mailInput = document.getElementById("mail");
      const phoneInput = document.getElementById("phone");
      const subjectSelect = document.getElementById("subject");
      const messageTextarea = document.getElementById("message");
      const btnSubmit = document.getElementById("btn-submit");

      const iconName = document.getElementById("icon-name");
      const iconLastName = document.getElementById("icon-last-name");
      const iconMail = document.getElementById("icon-mail");
      const iconPhone = document.getElementById("icon-phone");
      const iconSubject = document.getElementById("icon-subject");
      const iconMessage = document.getElementById("icon-message");

      // BLOQUEAR CARACTERES NO PERMITIDOS EN NOMBRE Y APELLIDO
      function filtrarNombre(input) {
        input.value = input.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ -]/g, "");
      }

      // BLOQUEAR NO-NÚMEROS EN TELÉFONO
      function filtrarTelefono(input) {
        input.value = input.value.replace(/[^0-9]/g, "");
      }

      // VALIDACIONES
      function validarNombreApellido(valor) {
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ -]{3,}$/;
        return regex.test(valor.trim());
      }

      function validarEmail(valor) {
        const regex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[A-Za-z]{2,}$/;
        return regex.test(valor.trim());
      }


      function validarTelefono(valor) {
        return /^[0-9]{9}$/.test(valor.trim());
      }

      function validarAsunto(selectEl) {
        return selectEl.selectedIndex > 0;
      }

      function validarMensaje(valor) {
        return valor.trim().length > 3;
      }

      function setIcon(iconEl, inputEl, valid) {
        if (!iconEl) return;
        if (valid === null) { 
          iconEl.innerHTML = "";        
          return; 
        }
      /*  iconEl.innerHTML = valid 
            ? '<i class="bi bi-check-circle-fill text-success"></i>'
            : '<i class="bi bi-x-circle-fill text-danger"></i>'; */
        if(valid === true){
          inputEl.classList.add("valid-fill");
          iconEl.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i>'
        }else{
          inputEl.classList.remove("valid-fill");
          iconEl.innerHTML = '<i class="bi bi-x-circle-fill text-danger"></i>';
        }
      }

      function actualizar() {
      const vNombre = validarNombreApellido(nameInput.value);
      const vApellido = validarNombreApellido(lastNameInput.value);
      const vMail = validarEmail(mailInput.value);
      const vTel = validarTelefono(phoneInput.value);
      const vAsunto = validarAsunto(subjectSelect);
      const vMsg = validarMensaje(messageTextarea.value);

      // Íconos solo si se ha interactuado con el campo
      setIcon(iconName, nameInput, nameInput.value.length > 0 ? vNombre : null);
      setIcon(iconLastName, lastNameInput, lastNameInput.value.length > 0 ? vApellido : null);
      setIcon(iconMail, mailInput,mailInput.value.length > 0 ? vMail : null);
      setIcon(iconPhone, phoneInput, phoneInput.value.length > 0 ? vTel : null);
      setIcon(iconSubject, subjectSelect, subjectSelect.selectedIndex > 0 ? vAsunto : null);
      setIcon(iconMessage, messageTextarea, messageTextarea.value.length > 0 ? vMsg : null);

      // Validar todo el formulario
      const todoValido =
        vNombre &&
        vApellido &&
        vMail &&
        vTel &&
        vAsunto &&
        vMsg;

      // Activar/desactivar botón Enviar
      if (todoValido) {
        btnSubmit.disabled = false;
        btnSubmit.classList.remove("btn-secondary");
        btnSubmit.classList.add("btn-primary");
      } else {
        btnSubmit.disabled = true;
        btnSubmit.classList.remove("btn-primary");
        btnSubmit.classList.add("btn-secondary");
      }
    }

      // FILTROS DE CARACTERES
      nameInput.addEventListener("input", () => { filtrarNombre(nameInput); actualizar(); });
      lastNameInput.addEventListener("input", () => { filtrarNombre(lastNameInput); actualizar(); });
      phoneInput.addEventListener("input", () => {filtrarTelefono(phoneInput); actualizar(); });
      mailInput.addEventListener("input", actualizar);
      messageTextarea.addEventListener("input", actualizar);
      subjectSelect.addEventListener("change", actualizar);

      actualizar(); // inicial

      // SUBMIT
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        console.log("Formulario enviado");

        form.reset();
        actualizar();

        const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById("contactForm"));
        if (offcanvas) offcanvas.hide();
      });
    }
  }
};
if (document.readyState === "loading") {
  document.addEventListener("componentsLoaded", initApp);
} else {
  initApp();
}