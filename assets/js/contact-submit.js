document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact_form");
  const feedback = document.getElementById("contactFeedback");
  const submitBtn = document.getElementById("btn-submit");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // que no recargue la página

    // Limpia mensaje anterior
    feedback.innerHTML = "";

    // Por si tu validación dejó el botón activo:
    if (submitBtn) {
      submitBtn.disabled = true;
      const originalText = submitBtn.dataset.originalText || submitBtn.innerText;
      submitBtn.dataset.originalText = originalText;
      submitBtn.innerText = "Enviando...";
    }

    // Capturamos datos del formulario
    const formData = new FormData(form);

    try {
      const response = await fetch(form.action || "send-mail.php", {
        method: "POST",
        body: formData,
      });

      // Intentamos leer JSON
      const data = await response.json();

      if (data.success) {
        feedback.innerHTML = `
          <div class="alert alert-success py-2 mb-2" role="alert">
            ${data.message || "Mensaje enviado con éxito."}
          </div>
        `;

        // Reseteamos el formulario (si quieres)
        form.reset();

        // Si usas íconos de validación, acá también podrías limpiarlos

        // Opcional: cerrar el offcanvas después de un ratito
        const offcanvasElement = document.getElementById("contactForm");
        if (offcanvasElement && window.bootstrap) {
          const offcanvasInstance =
            bootstrap.Offcanvas.getInstance(offcanvasElement) ||
            new bootstrap.Offcanvas(offcanvasElement);

          setTimeout(() => {
            offcanvasInstance.hide();
            feedback.innerHTML = "";
          }, 1500);
        }

      } else {
        feedback.innerHTML = `
          <div class="alert alert-danger py-2 mb-2" role="alert">
            ${data.message || "No se pudo enviar el mensaje. Inténtalo nuevamente."}
          </div>
        `;
      }

    } catch (error) {
      console.error("Error en el envío:", error);
      feedback.innerHTML = `
        <div class="alert alert-danger py-2 mb-2" role="alert">
          Ocurrió un error de conexión. Inténtalo más tarde.
        </div>
      `;
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = submitBtn.dataset.originalText || "Enviar";
      }
    }
  });
});
