function initApp() {

  const headerAnchor = document.getElementById("header");
  const btnAbout = document.getElementById("btn-about");
  const aboutClassToCheck = 'collapsed';
  let hasClass = true;
  
  const catalog = document.getElementById("catalog");
  const modalEl = document.getElementById("modal-product");
  const modalTitleSpan = modalEl ? modalEl.querySelector("#modal-product-label span") : null;
  const modalImg = document.getElementById("modal-img");
  const modalBenefitsList = document.getElementById("modal-product-beneficios");
  const modalPDF = document.getElementById("modal-pdf");

  const btnAutomotive = document.getElementById("btn-automotive-catalog");
  const btnIndustrial = document.getElementById("btn-industrial-catalog");

  const filtersGroup = document.querySelector(".filters-button-group");
  const filterGroupBtns = filtersGroup.querySelectorAll('button.btn-filter');

  let filterIconParent = null;
  const filterIconObject = document.getElementById('filter-icon');
  let myStorageObject = { storedElement: filterIconObject}; 

  const filterAnchor = document.getElementById('filter-anchor');
  const btnSort = document.querySelector(".btn-sort");
  
  /////////////// ABOUT SCROLL //////////////

  if(btnAbout){
    btnAbout.addEventListener('click', (e) => {
      hasClass = btnAbout.classList.contains(aboutClassToCheck);
      if(hasClass){ 
        headerAnchor.scrollIntoView();
      }
      
    });
  }

  ///////// QR //////////
  
  // Definir todos los elementos del flujo QR
  const whatsappLink = document.getElementById('share-whatsapp');
  // Get the element where the QR code will be displayed
  const qrContainer = document.getElementById("qr-code");
  // Define the data to be encoded in the QR code
  const qrLocation = window.location.href;
  const copyQr = document.getElementById('copy-qr');
  const ogImage = document.querySelector('meta[property="og:image"]');


  //////////////// GENERAR QR ////////////////

  // Create a new QRCode instance
  const qrcode = new QRCode(qrContainer, {
      width: 300,
      height: 300,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.L
  });

  qrcode.makeCode(qrLocation);

  let qrImage = qrContainer.querySelector('img');

  ///////////////// OG:IMAGE ////////////////

  function fillOgImageContent(imgData) {

        ogImage.setAttribute('content', imgData);
        //window.removeEventListener('scroll', fillOgImageContent());
          
  }
  
  //window.addEventListener('scroll', fillOgImageContent());

  // --- Observer para esperar que se cree la imagen ---
  const observer = new MutationObserver((async (mutationsList, observer) => {
    const imageUrl = qrImage.src;
    fetch(imageUrl)
    .then(response => response.blob()) // Get the image as a Blob
    .then(blob => createImageBitmap(blob)) // Create an ImageBitmap from the Blob
    .then(imageBitmap => {
      // Now you have an ImageBitmap, which can be drawn onto a canvas
      // or transferred to a Web Worker.
      const canvas = document.createElement('canvas');
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;
      canvas.type = imageBitmap.type;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imageBitmap, 0, 0);
      //document.body.appendChild(canvas);
      ogImage.setAttribute('content', canvas);
    })
    .catch(error => {
      console.error('Error creating ImageBitmap:', error);
    });
    /* <<<<<<<image = new Image();
    try {
      // Intentamos copiar la imagen como blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      stopQrAnimation();
      image
      fillOgImageContent(createImageBitmap(blob));
      console.log("QR para og:image");

    } catch (err) {
        // Si falla, hacemos fallback copiando la URL
        try {
          ogImage.setAttribute('content', 'qr.png');
          console.log("QR no se pudo copiar como imagen, se copió la URL 📋");

        } catch (err2) {
            console.error("No se pudo copiar el QR ni la URL:", err2);
        }
    } */
    observer.disconnect();
  }))

  observer.observe(qrContainer, { subtree: true, childList: true, attributes: true });

  ////////// ANIMATIONS /////////////////

  let timeoutId;
  let copyQrContent = copyQr.querySelector('span');
  function startQrCopyAnimation(){
    copyQr.classList.add('bounce');
    copyQr.classList.remove('copied');
    copyQrContent.innerText = 'Click y\ncopia QR';
    qrContainer.classList.remove('pe-anone');
    qrContainer.classList.add('pe-all');
  }

  function stopQrAnimation(){
    copyQr.classList.remove('bounce');
    whatsappLink.classList.remove('pulse');
    copyQr.classList.add('copied');
    copyQrContent.innerText = 'QR copiado!';
    qrContainer.classList.remove('pe-all');
    qrContainer.classList.add('pe-none');
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      startTimeout();
    }
  }

  // Animación botones del QR  
  copyQr.addEventListener('animationend',  function(){
    copyQr.classList.remove('bounce');
    whatsappLink.classList.add('pulse');
  });

  whatsappLink.addEventListener('animationend',  function(){
    this.classList.remove('pulse');
    startTimeout();
  });

  function startTimeout() {
    // Clear any existing timeout before setting a new one
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => { startQrCopyAnimation() }, 6000); // Set a new timeout for 2 seconds
  }

  ///////////// COPY QR ///////////////////////

  if (qrContainer) {
      qrContainer.addEventListener("click", async () => {
          // Tomamos la URL a copiar desde data-share o src si no existe
          const imageUrl = qrImage.src;
          try {
              // Intentamos copiar la imagen como blob
              const response = await fetch(imageUrl);
              const blob = await response.blob();

              stopQrAnimation();
              
              const clipboardItem = new ClipboardItem({ [blob.type]: blob });
              await navigator.clipboard.write([clipboardItem]);

             
          } catch (err) {
              // Si falla, hacemos fallback copiando la URL
              try {
                  await navigator.clipboard.writeText(imageUrl);
              } catch (err2) {
              }
          }
      });
  }

  ////////////// WHATSAPP LINK /////////////////////

  const message = `Comparte 🙏\nQR: ${qrLocation}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

  if (whatsappLink) {
      whatsappLink.href = whatsappUrl;
  }


  //////////////// CATALOG //////////////////////

  let productsData = [];
  let iso = null;
  let actualFilter = "*";

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

    const filterContainer = document.getElementById('filters');
    let filterOpenBtn = document.querySelector(('button:has(span#filter-icon-container'));

    if(window.innerWidth < 768){
        filterOpenBtn.addEventListener('click', (e) => {
          filterGroupBtns.forEach((b) => 
            b.classList.toggle('w-100').remove('d-none').add('d-block')
          );
        });
     }

    if (filtersGroup) {
      filtersGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('button.btn-filter');
        let filterOpenBtn = document.querySelector(('button:has(span#filter-icon-container'));
        if (!btn || !iso) return;

        filterAnchor.scrollIntoView();

        filterIconParent = document.getElementById('filter-icon-container');
        filterIconParent.removeChild(filterIconObject);
        filterIconParent.removeAttribute('id');
        
        // activo visual
        filterGroupBtns.forEach((b) => 
          b.classList.remove('active', 'pe-none')
          
        );
       
        const iconContainer = btn.querySelector('.filter-icon-container')
        iconContainer.prepend(myStorageObject.storedElement);
        iconContainer.setAttribute('id', 'filter-icon-container');
        btn.classList.add('active pe-none');


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

  }
};
if (document.readyState === "loading") {
  document.addEventListener("componentsLoaded", initApp);
} else {
  initApp();
}