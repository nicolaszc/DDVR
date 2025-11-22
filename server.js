/* // --- Servidor básico con página 404 personalizada ---
// Usa sintaxis CommonJS (compatible con Node.js sin configuración especial)
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

http.createServer((req, res) => {
  // Ruta solicitada
  let filePath = req.url.split("?")[0].substring(1) || "index.html";
  const extname = path.extname(filePath);
  const basePath = __dirname;

  // Si no tiene extensión, asumimos .html
  if (!extname) filePath += ".html";

  const fullPath = path.join(basePath, filePath);

  // Intentamos leer el archivo solicitado
  fs.readFile(fullPath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        // Si no se encuentra, enviamos error404.html
        const errorPath = path.join(basePath, "error404.html");
        fs.readFile(errorPath, (error404, content404) => {
          res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          res.end(content404 || "<h1>404 - Página no encontrada</h1>");
        });
      } else {
        // Otro error (por ejemplo permisos)
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error interno del servidor");
      }
    } else {
      // Si existe, lo servimos con el tipo correcto
      res.writeHead(200, { "Content-Type": getContentType(extname) });
      res.end(content);
    }
  });
}).listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// --- Tipos de contenido ---
function getContentType(ext) {
  const types = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };
  return types[ext] || "text/plain";
}
 */

/* const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

// --- Función para validar rutas de SPA ---
function isValidRoute(urlPath) {
  if (urlPath === "/" || urlPath === "/index.html") return true;
  if (urlPath.startsWith("/producto/")) return true;
  return false;
}

http.createServer((req, res) => {
  let urlPath = req.url.split("?")[0];
  const extname = path.extname(urlPath);
  const fullPath = path.join(__dirname, urlPath.substring(1) || "index.html");

  fs.readFile(fullPath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        // Validar si es ruta SPA
        if (isValidRoute(urlPath)) {
          // Servir index.html para rutas SPA válidas
          const fallbackPath = path.join(__dirname, "index.html");
          fs.readFile(fallbackPath, (errIndex, indexContent) => {
            if (errIndex) {
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Error interno del servidor");
              return;
            }
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(indexContent);
          });
        } else {
          // Ruta inválida → 404 real
          res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          res.end("<h1>404 - Página no encontrada</h1>");
        }
      } else {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error interno del servidor");
      }
    } else {
      // Archivo existe → servir normalmente
      res.writeHead(200, { "Content-Type": getContentType(extname) });
      res.end(content);
    }
  });
}).listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

function getContentType(ext) {
  const types = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };
  return types[ext] || "text/plain";
} */

// --- Servidor básico con página 404 personalizada y soporte SPA ---
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

http.createServer((req, res) => {
  let requestedPath = req.url.split("?")[0].substring(1); // quitar "/"
  const basePath = __dirname;

  // Rutas válidas que son "directas" (index.html, assets, componentes, etc.)
  const fullPath = path.join(basePath, requestedPath);
  const extname = path.extname(fullPath);

  // Si existe archivo real, lo servimos
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (!err && extname) {
      fs.readFile(fullPath, (errRead, content) => {
        if (errRead) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Error interno del servidor");
        } else {
          res.writeHead(200, { "Content-Type": getContentType(extname) });
          res.end(content);
        }
      });
    } else {
      // Si no existe archivo real: 
      // - si ruta empieza con 'producto/', devolvemos index.html para PDP
      // - si ruta es raíz o index.html, devolvemos index.html
      // - si no, 404
      if (requestedPath === "" || requestedPath === "index.html" || requestedPath.startsWith("producto/")) {
        fs.readFile(path.join(basePath, "index.html"), (errRead, content) => {
          if (errRead) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Error interno del servidor");
          } else {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(content);
          }
        });
      } else {
        // 404 real
        fs.readFile(path.join(basePath, "error404.html"), (err404, content404) => {
          res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          res.end(content404 || "<h1>404 - Página no encontrada</h1>");
        });
      }
    }
  });

}).listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// --- Tipos de contenido ---
function getContentType(ext) {
  const types = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };
  return types[ext] || "text/plain";
}

