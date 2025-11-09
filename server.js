// --- Servidor básico con página 404 personalizada ---
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
