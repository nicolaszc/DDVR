function initApp() {

  const headerAnchor = document.getElementById("header");
  const btnAbout = document.getElementById("btn-about");
  const toTop = document.querySelector('.to-top');
  const aboutClassToCheck = 'collapsed';
  let hasClass = true;

  ///////////// TO TOP //////////////////
  
  if(toTop){
    toTop.addEventListener('click', (e) => {
      e.preventDefault();
      headerAnchor.scrollIntoView();
  })
  }
  
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
  }

  // --- Observer para esperar que se cree la imagen y pasarla al OG---
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


  
};
if (document.readyState === "loading") {
  document.addEventListener("componentsLoaded", initApp);
} else {
  initApp();
}