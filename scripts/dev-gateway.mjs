/**
 * Unified dev entry: http://localhost:3000
 * Proxies to internal apps (start via `npm run dev` from repo root).
 */
import http from 'http';
import httpProxy from 'http-proxy';

const SITE = process.env.DEV_SITE_URL || 'http://127.0.0.1:3050';
const API = process.env.DEV_API_URL || 'http://127.0.0.1:3001';
const DASH = process.env.DEV_DASH_URL || 'http://127.0.0.1:5174';
const DASH_API = process.env.DEV_DASH_API_URL || 'http://127.0.0.1:3002';
const PORT = Number(process.env.DEV_GATEWAY_PORT || 3000);

const proxy = httpProxy.createProxyServer({ ws: true, xfwd: true });

function isDashboardReferer(referer) {
  return referer.includes('/dashboard') || referer.includes('/login');
}

function targetFor(req) {
  const url = (req.url ?? '/').split('?')[0];
  const referer = req.headers.referer ?? '';

  if (url.startsWith('/api/channel-landing-pages')) return DASH;
  if (url.startsWith('/api/auth')) return DASH_API;
  if (url.startsWith('/api/cms')) return DASH_API;
  // Public form POSTs (newsletter signup, contact) → marketing API; admin GET → dashboard API
  if (url.startsWith('/api/interactions')) {
    return req.method === 'POST' ? API : DASH_API;
  }
  if (url.startsWith('/api') && isDashboardReferer(referer)) return DASH_API;
  if (url.startsWith('/api')) return API;

  if (
    url.startsWith('/dashboard') ||
    url.startsWith('/login') ||
    (url.startsWith('/_next') && isDashboardReferer(referer))
  ) {
    return DASH;
  }

  return SITE;
}

proxy.on('error', (err, req, res) => {
  console.error('[dev-gateway]', err.message);
  if (res && 'writeHead' in res && !res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(
      'Dev gateway: upstream not ready. From repo root run: npm run dev\n\n' +
        `Tried: ${req?.url ?? ''}\n`,
    );
  }
});

const server = http.createServer((req, res) => {
  proxy.web(req, res, { target: targetFor(req), changeOrigin: true });
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, { target: targetFor(req), changeOrigin: true });
});

server.listen(PORT, () => {
  console.log(`\nPMS dev gateway  http://localhost:${PORT}`);
  console.log(`  Marketing   ${SITE}`);
  console.log(`  Public API  ${API}  (via /api)`);
  console.log(`  Dashboard   ${DASH}  (via /dashboard, /login)`);
  console.log(`  Dash API    ${DASH_API}  (GET /api/interactions, dashboard /api)\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n[dev-gateway] Port ${PORT} is already in use.\n` +
        '  Stop the other process (often an old `next dev -p 3000`) and run `npm run dev` again.\n' +
        '  Browser URL should be http://localhost:3000 via this gateway only.\n',
    );
    process.exit(1);
  }
  throw err;
});
