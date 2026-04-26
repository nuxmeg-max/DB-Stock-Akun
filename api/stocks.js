/* ════════════════════════════════════════════════════════════
   api/stocks.js
   GET  /api/stocks  → ambil semua stok
   POST /api/stocks  → tambah stok baru
   ════════════════════════════════════════════════════════════ */

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

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
      const stocks = await redisGet('stocks') || [];
      return res.status(200).json({ ok: true, data: stocks });
    }

    /* ── POST ─────────────────────────────────────────────── */
    if (req.method === 'POST') {
      const { game, photos, price, desc, bind, tags } = req.body;
      if (!game || !photos || photos.length === 0)
        return res.status(400).json({ ok: false, error: 'game dan photos wajib' });

      const stocks   = await redisGet('stocks') || [];
      const sameGame = stocks.filter(s => s.game === game);
      const newStock = {
        id: Date.now(), no: sameGame.length + 1,
        game, photos, price: parseInt(price) || 0,
        desc: desc || '', bind: bind || '', tags: tags || [],
        createdAt: Date.now(),
      };
      stocks.push(newStock);
      await redisSet('stocks', stocks);
      return res.status(200).json({ ok: true, data: newStock });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('[stocks]', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
