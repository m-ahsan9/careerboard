import http from 'node:http';
import {readFile} from 'node:fs/promises';
const files = {'/':['index.html','text/html'],'/index.html':['index.html','text/html'],'/styles.css':['styles.css','text/css'],'/app.js':['app.js','text/javascript'],'/domain.js':['domain.js','text/javascript']};
const port = Number(process.env.PORT || 3000);
http.createServer(async (req,res) => {
  const file = files[new URL(req.url,'http://localhost').pathname];
  if (!file || !['GET','HEAD'].includes(req.method)) { res.writeHead(404); res.end('Not found'); return; }
  try { const data = await readFile(new URL(file[0],import.meta.url)); res.writeHead(200,{'Content-Type':file[1]+'; charset=utf-8','X-Content-Type-Options':'nosniff'}); res.end(req.method === 'HEAD' ? undefined : data); }
  catch { res.writeHead(500); res.end('Unable to load file'); }
}).listen(port,'127.0.0.1',() => console.log(`CareerBoard: http://localhost:${port}`));
