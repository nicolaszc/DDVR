document.addEventListener("DOMContentLoaded", () => {

    // Get the element where the QR code will be displayed
    const qrCodeContainer = document.getElementById("qr-code");
    

    // Define the data to be encoded in the QR code
    const qrLocation = window.location.href;
    //const qrImage = document.getElementById("qr-code");
    //const qrOriginalImage = document.getElementById("qr-code");
    // Create a new QRCode instance
    const qrcode = new QRCode('qr-code', {
        width: 300,
        height: 300,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.L // Error correction level
    });
    
    function makeCode () {    
    var elText = qrLocation;
    qrcode.makeCode(elText);
    }

    makeCode();

    let qrCodeData = document.querySelector(".qr-code img");
    setTimeout(() => {
            qrCodeContainer.setAttribute('data-share', qrCodeData.src);
    }, 1000); 
        
        
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
})