import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'server_data');
const TENANTS_DIR = path.join(DATA_DIR, 'tenants');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(TENANTS_DIR)) fs.mkdirSync(TENANTS_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.end(JSON.stringify(payload));
}

function arapyDiskDatabasePlugin() {
  const attachMiddleware = (middlewares) => {
    ensureDirs();

    middlewares.use(async (req, res, next) => {
      const url = new URL(req.url || '/', 'http://localhost');
      const pathname = url.pathname;

      if (!pathname.startsWith('/api/')) {
        return next();
      }

      try {
        // 1. Master Registry of Tenants (ARAPY Control)
        if (pathname === '/api/registry') {
          const regFile = path.join(DATA_DIR, 'registry.json');
          if (req.method === 'GET') {
            if (!fs.existsSync(regFile)) {
              return sendJson(res, 200, { initialized: false, tenants: [] });
            }
            const raw = fs.readFileSync(regFile, 'utf-8');
            return sendJson(res, 200, { initialized: true, ...JSON.parse(raw) });
          }
          if (req.method === 'PUT' || req.method === 'POST') {
            const body = await readJsonBody(req);
            const payload = {
              updatedAt: new Date().toISOString(),
              tenants: Array.isArray(body.tenants) ? body.tenants : [],
              arapyConfig: body.arapyConfig || {}
            };
            fs.writeFileSync(regFile, JSON.stringify(payload, null, 2), 'utf-8');
            return sendJson(res, 200, { ok: true, ...payload });
          }
        }

        // 2. Per-Tenant Isolated Database (/api/tenants/:slug)
        if (pathname.startsWith('/api/tenants/')) {
          const rawSlug = decodeURIComponent(pathname.replace('/api/tenants/', '')).trim();
          const safeSlug = rawSlug.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
          if (!safeSlug) return sendJson(res, 400, { error: 'Invalid tenant slug' });

          const tenantFile = path.join(TENANTS_DIR, `${safeSlug}.json`);

          if (req.method === 'GET') {
            if (!fs.existsSync(tenantFile)) {
              return sendJson(res, 200, { exists: false, slug: safeSlug, data: null });
            }
            const raw = fs.readFileSync(tenantFile, 'utf-8');
            return sendJson(res, 200, {
              exists: true,
              slug: safeSlug,
              data: JSON.parse(raw)
            });
          }

          if (req.method === 'PUT' || req.method === 'POST') {
            const body = await readJsonBody(req);
            const tenantData = body.data || body;
            tenantData._diskSavedAt = new Date().toISOString();
            tenantData.slug = safeSlug;
            const tmpFile = `${tenantFile}.tmp`;
            fs.writeFileSync(tmpFile, JSON.stringify(tenantData, null, 2), 'utf-8');
            fs.renameSync(tmpFile, tenantFile);
            return sendJson(res, 200, {
              ok: true,
              slug: safeSlug,
              savedAt: tenantData._diskSavedAt
            });
          }

          if (req.method === 'DELETE') {
            if (fs.existsSync(tenantFile)) {
              fs.unlinkSync(tenantFile);
            }
            return sendJson(res, 200, { ok: true, deleted: safeSlug });
          }
        }

        // 3. Physical Disk Image Upload (/api/upload)
        if (pathname === '/api/upload' && req.method === 'POST') {
          const body = await readJsonBody(req);
          const safeSlug = String(body.slug || 'shared')
            .replace(/[^a-zA-Z0-9_-]/g, '-')
            .toLowerCase();
          const dataUrl = String(body.dataUrl || '');
          const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);

          if (!match) {
            return sendJson(res, 400, { error: 'Formato de imagen inválido' });
          }

          let ext = match[1].toLowerCase();
          if (ext === 'jpeg') ext = 'jpg';
          if (ext === 'svg+xml') ext = 'svg';
          const buffer = Buffer.from(match[2], 'base64');

          const slugUploadDir = path.join(UPLOADS_DIR, safeSlug);
          if (!fs.existsSync(slugUploadDir)) {
            fs.mkdirSync(slugUploadDir, { recursive: true });
          }

          const cleanLabel = String(body.label || 'img')
            .replace(/[^a-zA-Z0-9_-]/g, '-')
            .toLowerCase()
            .slice(0, 32);
          const fileName = `${cleanLabel}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
          const filePath = path.join(slugUploadDir, fileName);

          fs.writeFileSync(filePath, buffer);
          const publicUrl = `/uploads/${safeSlug}/${fileName}`;

          return sendJson(res, 200, {
            ok: true,
            url: publicUrl,
            bytes: buffer.length,
            savedAt: new Date().toISOString()
          });
        }

        return sendJson(res, 404, { error: 'API route not found' });
      } catch (err) {
        console.error('[ARAPY Disk DB Error]:', err);
        return sendJson(res, 500, { error: err.message || 'Internal Server Error' });
      }
    });
  };

  return {
    name: 'arapy-disk-database-plugin',
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), arapyDiskDatabasePlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
