const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'dist');
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function sendFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {'Content-Type': contentTypes[ext] || 'application/octet-stream'});
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(root, safePath === '/' ? 'index.html' : safePath);

  fs.stat(filePath, (fileErr, stats) => {
    if (!fileErr && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.access(filePath, fs.constants.R_OK, (accessErr) => {
      if (!accessErr) {
        sendFile(filePath, res);
        return;
      }

      const spaFallback = path.join(root, 'index.html');
      fs.access(spaFallback, fs.constants.R_OK, (fallbackErr) => {
        if (fallbackErr) {
          res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
          res.end('Not found');
          return;
        }

        sendFile(spaFallback, res);
      });
    });
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Static app available at http://localhost:${port}/`);
});
