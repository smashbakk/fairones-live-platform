import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const args = process.argv.slice(2);
const portArg = args.findIndex((item) => item === '--port');
const port = portArg >= 0 ? Number(args[portArg + 1]) : 4173;
const root = join(process.cwd(), 'dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };

createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const requested = normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, '');
  let file = join(root, requested === '/' ? 'index.html' : requested);
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(root, 'index.html');
  res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
  createReadStream(file).pipe(res);
}).listen(port, '0.0.0.0');

console.log(`Fair Ones preview ready on ${port}`);
