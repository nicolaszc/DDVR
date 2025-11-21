/// Contact form Verificacion y envio ///
function initContactForm() {
  const form = document.getElementById("contact_form");
  if (!form) return;

  const nameInput = document.getElementById("name");
  const lastNameInput = document.getElementById("last-name");
  const mailInput = document.getElementById("mail");
  const phoneInput = document.getElementById("phone");
  const subjectSelect = document.getElementById("subject");
  const messageTextarea = document.getElementById("message");
  const btnSubmit = document.getElementById("btn-submit");
  const feedback = document.getElementById("contactFeedback");

  const iconName = document.getElementById("icon-name");
  const iconLastName = document.getElementById("icon-last-name");
  const iconMail = document.getElementById("icon-mail");
  const iconPhone = document.getElementById("icon-phone");
  const iconSubject = document.getElementById("icon-subject");
  const iconMessage = document.getElementById("icon-message");

  // ==== FILTROS DE CARACTERES ====

  // BLOQUEAR CARACTERES NO PERMITIDOS EN NOMBRE Y APELLIDO
  function filtrarNombre(input) {
    input.value = input.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ -]/g, "");
  }

  // BLOQUEAR NO-NÚMEROS EN TELÉFONO
  function filtrarTelefono(input) {
    input.value = input.value.replace(/[^0-9]/g, "");
  }

  // ==== VALIDACIONES ====

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
      inputEl.classList.remove("valid-fill");
      return;
    }

    if (valid === true) {
      inputEl.classList.add("valid-fill");
      iconEl.innerHTML =
        '<i class="bi bi-check-circle-fill text-success"></i>';
    } else {
      inputEl.classList.remove("valid-fill");
      iconEl.innerHTML =
        '<i class="bi bi-x-circle-fill text-danger"></i>';
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
    setIcon(
      iconLastName,
      lastNameInput,
      lastNameInput.value.length > 0 ? vApellido : null
    );
    setIcon(
      iconMail,
      mailInput,
      mailInput.value.length > 0 ? vMail : null
    );
    setIcon(
      iconPhone,
      phoneInput,
      phoneInput.value.length > 0 ? vTel : null
    );
    setIcon(
      iconSubject,
      subjectSelect,
      subjectSelect.selectedIndex > 0 ? vAsunto : null
    );
    setIcon(
      iconMessage,
      messageTextarea,
      messageTextarea.value.length > 0 ? vMsg : null
    );

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

    return todoValido;
  }

  // ==== LISTENERS DE INPUT ====

  nameInput.addEventListener("input", () => {
    filtrarNombre(nameInput);
    actualizar();
  });

  lastNameInput.addEventListener("input", () => {
    filtrarNombre(lastNameInput);
    actualizar();
  });

  phoneInput.addEventListener("input", () => {
    filtrarTelefono(phoneInput);
    actualizar();
  });

  mailInput.addEventListener("input", actualizar);
  messageTextarea.addEventListener("input", actualizar);
  subjectSelect.addEventListener("change", actualizar);

  // Estado inicial
  actualizar();

  // ==== SUBMIT CON AJAX ====

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const todoValido = actualizar();
    if (!todoValido) return;

    if (feedback) feedback.innerHTML = "";

    if (btnSubmit) {
      btnSubmit.disabled = true;
      const originalText =
        btnSubmit.dataset.originalText || btnSubmit.innerText;
      btnSubmit.dataset.originalText = originalText;
      btnSubmit.innerText = "Enviando...";
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action || "assets/js/send-mail/send-mail.php", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Respuesta servidor:", data);

      if (data.success) {
        if (feedback) {
          feedback.innerHTML = `
            <div class="alert alert-success py-2 mb-2" role="alert">
              ${data.message || "Mensaje enviado con éxito."}
            </div>
          `;
        }

        form.reset();
        actualizar();

        const offcanvasElement = document.getElementById("contactForm");
        if (offcanvasElement && window.bootstrap) {
          const offcanvasInstance =
            bootstrap.Offcanvas.getInstance(offcanvasElement) ||
            new bootstrap.Offcanvas(offcanvasElement);

          setTimeout(() => {
            offcanvasInstance.hide();
            if (feedback) feedback.innerHTML = "";
          }, 3000);
        }
      } else {
        if (feedback) {
          feedback.innerHTML = `
            <div class="alert alert-danger py-2 mb-2" role="alert">
              ${data.message || "No se pudo enviar el mensaje. Inténtalo nuevamente."}
            </div>
          `;
        }
      }
    } catch (error) {
      console.error("Error en el envío:", error);
      if (feedback) {
        feedback.innerHTML = `
          <div class="alert alert-danger py-2 mb-2" role="alert">
            Ocurrió un error de conexión. Inténtalo más tarde.
          </div>
        `;
      }
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = true; // vuelve a quedar bloqueado hasta que todo sea válido de nuevo
        btnSubmit.innerText =
          btnSubmit.dataset.originalText || "Enviar";
        btnSubmit.classList.remove("btn-primary");
        btnSubmit.classList.add("btn-secondary");
      }
    }
  });
}

// Esperar a que include.js termine de insertar los componentes (igual que app.js)
if (document.readyState === "loading") {
  document.addEventListener("componentsLoaded", initContactForm);
} else {
  initContactForm();
}
