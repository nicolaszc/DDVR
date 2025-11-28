///////// QR //////////
function initQr() { 
    // Definir todos los elementos del flujo QR
    const whatsappLink = document.getElementById('share-whatsapp');
    // Get the element where the QR code will be displayed
    const qrContainer = document.getElementById("qr-code");
    // Define the data to be encoded in the QR code
    const ogImage = document.getElementById("ogImage");
    const qrLocation = window.location.href;
    const copyQr = document.getElementById('copy-qr');

    //////////////// MOSTRAR QR DINAMICO qr-get.php ////////////////
    let qrSource =  window.location.origin + siteRoot + 'api/qr/qr-get.php?url=' + encodeURIComponent(qrLocation);
    let qrImage = qrContainer.querySelector('img');
    qrImage.src = qrSource;
    qrImage.setAttribute('src', qrImage.src);
    ogImage.setAttribute('content', qrSource)
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
}

if (document.readyState === "loading") {
  document.addEventListener("componentsLoaded", initQr);
} else {
  initQr();
}