/* ════════════════════════════════════════════════════════════
   api/settings.js
   GET  /api/settings  → ambil settings publik
   POST /api/settings  → simpan settings
   ════════════════════════════════════════════════════════════ */

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const DEFAULTS = {
  waNumber:  '6281234567890',
  adminName: 'Meg',
  tagIcons:  {},
};

async function redisGet(key) {
  const res  = await fetch(`${UPSTASH_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  const json = await res.json();
  return json.result ? JSON.parse(json.result) : null;
}

async function redisSet(key, value) {
  await fetch(`${UPSTASH_URL}/set/${key}`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(JSON.stringify(value)),
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    /* ── GET ──────────────────────────────────────────────── */
    if (req.method === 'GET') {
      const settings = await redisGet('settings') || DEFAULTS;
      // kirim waNumber & tagIcons saja, adminName tetap server-side
      return res.status(200).json({
        ok: true,
        data: { waNumber: settings.waNumber, tagIcons: settings.tagIcons || {} },
      });
    }

    /* ── POST ─────────────────────────────────────────────── */
    if (req.method === 'POST') {
      const current = await redisGet('settings') || DEFAULTS;
      const body    = req.body || {};
      const updated = { ...current };
      if (body.waNumber  !== undefined) updated.waNumber  = body.waNumber;
      if (body.adminName !== undefined) updated.adminName = body.adminName;
      if (body.tagIcons  !== undefined) updated.tagIcons  = body.tagIcons;
      await redisSet('settings', updated);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('[settings]', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
