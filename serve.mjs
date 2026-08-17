import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST = join(__dirname, 'dist')
const PORT = 8888
const API_TARGET = 'http://127.0.0.1:8080'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json'
}

async function proxyApi(req, res) {
  const url = new URL(req.url, API_TARGET)
  const opts = {
    method: req.method,
    headers: { ...req.headers, host: url.host }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = []
    for await (const c of req) chunks.push(c)
    opts.body = Buffer.concat(chunks)
  }
  try {
    const r = await fetch(url, opts)
    res.writeHead(r.status, {
      'Content-Type': r.headers.get('content-type') || 'application/json'
    })
    const buf = Buffer.from(await r.arrayBuffer())
    res.end(buf)
  } catch {
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ code: -1, message: '后端网关不可达' }))
  }
}

const server = http.createServer(async (req, res) => {
  const url = req.url || '/'

  if (url.startsWith('/api/')) return proxyApi(req, res)

  let path = decodeURIComponent(url.split('?')[0])
  if (path === '/') path = '/index.html'

  const filePath = normalize(join(DIST, path))
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403)
    return res.end('Forbidden')
  }

  try {
    const s = await stat(filePath)
    if (s.isDirectory()) {
      const idx = join(filePath, 'index.html')
      try {
        await stat(idx)
        const data = await readFile(idx)
        res.writeHead(200, { 'Content-Type': MIME['.html'] })
        return res.end(data)
      } catch { /* fall through to 404 -> SPA fallback */ }
    }
    const data = await readFile(filePath)
    const ext = extname(filePath).toLowerCase()
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
    })
    res.end(data)
  } catch {
    const idx = await readFile(join(DIST, 'index.html')).catch(() => null)
    if (idx) {
      res.writeHead(200, { 'Content-Type': MIME['.html'] })
      res.end(idx)
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
    }
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`前端已部署: http://localhost:${PORT}`)
  console.log(`API 代理到:   ${API_TARGET}`)
})
