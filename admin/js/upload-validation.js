// js/upload-validation.js

document.addEventListener("DOMContentLoaded", function () {

    // Extensiones permitidas según el name del input
    const allowedByField = {
        automotive_json: ["json"],
        industrial_json: ["json"],
        images: ["jpg", "jpeg", "png", "webp", "gif"],
        pdfs: ["pdf"]
    };

    function getBaseName(name) {
        // "images[]" -> "images"
        return name.replace(/\[\]$/, "");
    }

    // Valida un input file y SOLO aplica clases CSS (sin mensajes nativos)
    function validateFileInput(input) {
        const files = input.files;
        const baseName = getBaseName(input.name);
        const allowed = allowedByField[baseName] || [];

        let isValid = true;

        // Campo vacío
        if (!files || files.length === 0) {
            isValid = false;
        } else if (allowed.length > 0) {
            // Revisar extensiones de todos los archivos
            for (let i = 0; i < files.length; i++) {
                const name = files[i].name;
                const ext = name.split(".").pop().toLowerCase();
                if (!allowed.includes(ext)) {
                    isValid = false;
                    break;
                }
            }
        }

        // Limpiar clases previas
        input.classList.remove("is-valid", "is-invalid");

        if (isValid) {
            input.classList.add("is-valid");   // ✔
        } else {
            input.classList.add("is-invalid"); // ✖
        }

        // Muy importante: vaciar siempre el mensaje nativo
        input.setCustomValidity("");

        return isValid;
    }

    // Valida selects de categoría (img_categoria / pdf_categoria)
    function validateCategoriaSelect(select) {
        const value = select.value;
        const validValues = ["automotriz", "industrial"];

        const isValid = validValues.includes(value);

        select.classList.remove("is-valid", "is-invalid");

        if (isValid) {
            select.classList.add("is-valid");
        } else {
            select.classList.add("is-invalid");
        }

        // También limpiamos mensajes nativos
        select.setCustomValidity("");

        return isValid;
    }

    // Validación en vivo para inputs file
    document.querySelectorAll('input[type="file"]').forEach(function (input) {
        input.addEventListener("change", function () {
            validateFileInput(input);
        });
    });

    // Validación en vivo para selects de categoría
    document
        .querySelectorAll('select[name="img_categoria"], select[name="pdf_categoria"]')
        .forEach(function (select) {
            select.addEventListener("change", function () {
                validateCategoriaSelect(select);
            });
        });

    // Validación al enviar cada formulario
    document.querySelectorAll("form.js-upload-form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            // Bloqueamos SIEMPRE la validación nativa del navegador
            event.preventDefault();
            event.stopPropagation();

            let ok = true;

            // 1) Validar inputs file de este formulario
            form.querySelectorAll('input[type="file"]').forEach(function (input) {
                const valid = validateFileInput(input);
                if (!valid) ok = false;
            });

            // 2) Validar selects de categoría (si existen)
            form.querySelectorAll('select[name="img_categoria"], select[name="pdf_categoria"]')
                .forEach(function (select) {
                    const valid = validateCategoriaSelect(select);
                    if (!valid) ok = false;
                });

            // Si TODO está correcto, enviamos manualmente (sin validación HTML5)
            if (ok) {
                form.submit(); // esto no muestra "Please select a file"
            }
        });
    });

});

