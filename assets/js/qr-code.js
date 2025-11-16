document.addEventListener("DOMContentLoaded", () => {
    
    const qrCode = document.getElementById('qr-code');
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
    }
})