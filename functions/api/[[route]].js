/**
 * Stafferton Drive Hub — Cloudflare Worker API
 * Handles all /api/* routes. The React SPA is served by Cloudflare Pages.
 *
 * Routes:
 *   GET    /api/clients              → list all clients
 *   POST   /api/clients              → create client
 *   DELETE /api/clients/:id          → delete client (+ cascade docs)
 *
 *   GET    /api/docs                 → list all docs (optional ?clientId=)
 *   POST   /api/docs                 → create doc
 *   PUT    /api/docs/:id             → update doc
 *   DELETE /api/docs/:id             → delete doc
 *
 *   GET    /api/share/:slug          → public read-only client view (validates share token)
 *   POST   /api/share/:slug          → generate/rotate share token for a client
 *
 * Bindings required in wrangler.toml:
 *   [[d1_databases]]
 *   binding = "DB"
 *   database_name = "doc-hub"
 *   database_id = "YOUR_DATABASE_ID"
 *
 *   [vars]
 *   ADMIN_SECRET = "set-via-wrangler-secret"
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function err(msg, status = 400) {
  return json({ error: msg }, status);
}

// ── Auth middleware ───────────────────────────────────────────────────────────
// Admin routes require: Authorization: Bearer <ADMIN_SECRET>
// Share routes require: ?key=<share_token>

function isAdmin(request, env) {
  const auth = request.headers.get('Authorization') || '';
  return auth === `Bearer ${env.ADMIN_SECRET}`;
}

// ── Router ───────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    // ── Clients ──────────────────────────────────────────────────────────────

    if (path === '/api/clients') {
      if (method === 'GET') {
        const rows = await env.DB.prepare(
          'SELECT * FROM clients ORDER BY name ASC'
        ).all();
        return json(rows.results);
      }

      if (method === 'POST') {
        if (!isAdmin(request, env)) return err('Unauthorized', 401);
        const body = await request.json();
        const { name, color, initials } = body;
        if (!name || !color || !initials) return err('name, color, initials required');
        const id = crypto.randomUUID().slice(0, 8);
        await env.DB.prepare(
          'INSERT INTO clients (id, name, color, initials) VALUES (?, ?, ?, ?)'
        ).bind(id, name, color, initials).run();
        return json({ id, name, color, initials }, 201);
      }
    }

    const clientMatch = path.match(/^\/api\/clients\/([^/]+)$/);
    if (clientMatch) {
      const clientId = clientMatch[1];

      if (method === 'DELETE') {
        if (!isAdmin(request, env)) return err('Unauthorized', 401);
        await env.DB.prepare('DELETE FROM docs WHERE clientId = ?').bind(clientId).run();
        await env.DB.prepare('DELETE FROM clients WHERE id = ?').bind(clientId).run();
        return json({ deleted: clientId });
      }
    }

    // ── Docs ─────────────────────────────────────────────────────────────────

    if (path === '/api/docs') {
      if (method === 'GET') {
        const clientId = url.searchParams.get('clientId');
        let stmt;
        if (clientId) {
          stmt = env.DB.prepare(
            'SELECT * FROM docs WHERE clientId = ? ORDER BY pinned DESC, title ASC'
          ).bind(clientId);
        } else {
          stmt = env.DB.prepare(
            'SELECT * FROM docs ORDER BY pinned DESC, title ASC'
          );
        }
        const rows = await stmt.all();
        // Convert integer pinned back to boolean
        const results = rows.results.map(r => ({ ...r, pinned: r.pinned === 1 }));
        return json(results);
      }

      if (method === 'POST') {
        if (!isAdmin(request, env)) return err('Unauthorized', 401);
        const body = await request.json();
        const { title, url: docUrl, clientId, category, type, notes, pinned } = body;
        if (!title || !docUrl || !clientId || !category || !type) {
          return err('title, url, clientId, category, type required');
        }
        const id = crypto.randomUUID().slice(0, 8);
        await env.DB.prepare(
          `INSERT INTO docs (id, title, url, clientId, category, type, notes, pinned)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(id, title, docUrl, clientId, category, type, notes || '', pinned ? 1 : 0).run();
        return json({ id, title, url: docUrl, clientId, category, type, notes: notes || '', pinned: !!pinned }, 201);
      }
    }

    const docMatch = path.match(/^\/api\/docs\/([^/]+)$/);
    if (docMatch) {
      const docId = docMatch[1];

      if (method === 'PUT') {
        if (!isAdmin(request, env)) return err('Unauthorized', 401);
        const body = await request.json();
        const { title, url: docUrl, clientId, category, type, notes, pinned } = body;
        await env.DB.prepare(
          `UPDATE docs SET title=?, url=?, clientId=?, category=?, type=?, notes=?, pinned=?
           WHERE id=?`
        ).bind(title, docUrl, clientId, category, type, notes || '', pinned ? 1 : 0, docId).run();
        return json({ id: docId, ...body, pinned: !!pinned });
      }

      if (method === 'DELETE') {
        if (!isAdmin(request, env)) return err('Unauthorized', 401);
        await env.DB.prepare('DELETE FROM docs WHERE id = ?').bind(docId).run();
        return json({ deleted: docId });
      }
    }

    // ── Share ─────────────────────────────────────────────────────────────────
    // Public share links: /api/share/:slug?key=TOKEN
    // Each client can have a share_token in the DB.

    const shareMatch = path.match(/^\/api\/share\/([^/]+)$/);
    if (shareMatch) {
      const slug = shareMatch[1];

      if (method === 'GET') {
        const key = url.searchParams.get('key');
        if (!key) return err('key required', 401);

        const client = await env.DB.prepare(
          'SELECT * FROM clients WHERE share_slug = ? AND share_token = ?'
        ).bind(slug, key).first();

        if (!client) return err('Invalid share link', 403);

        const docs = await env.DB.prepare(
          'SELECT * FROM docs WHERE clientId = ? ORDER BY pinned DESC, title ASC'
        ).bind(client.id).all();

        return json({
          client: { id: client.id, name: client.name, color: client.color, initials: client.initials },
          docs: docs.results.map(r => ({ ...r, pinned: r.pinned === 1 })),
        });
      }

      // Generate / rotate share token for a client (admin only)
      if (method === 'POST') {
        if (!isAdmin(request, env)) return err('Unauthorized', 401);
        const body = await request.json();
        const { clientId } = body;
        if (!clientId) return err('clientId required');

        const token = crypto.randomUUID();
        await env.DB.prepare(
          'UPDATE clients SET share_slug = ?, share_token = ? WHERE id = ?'
        ).bind(slug, token, clientId).run();

        return json({ slug, token, url: `https://docs.stafferton.digital/share/${slug}?key=${token}` });
      }
    }

    return err('Not found', 404);
  },
};
