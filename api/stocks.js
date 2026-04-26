/* ════════════════════════════════════════════════════════════
   api/stocks.js
   GET  /api/stocks  → ambil semua stok (TANPA foto, cepat)
   POST /api/stocks  → tambah stok baru (foto disimpan terpisah)
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
    if (req.method === 'GET') {
      const stocks = await redisGet('stocks') || [];
      const light = stocks.map(({ photos, ...s }) => ({
        ...s,
        thumb: photos?.[0] || null,
      }));
      return res.status(200).json({ ok: true, data: light });
    }

    if (req.method === 'POST') {
      const { game, photos, price, desc, bind, tags } = req.body;
      if (!game || !photos || photos.length === 0)
        return res.status(400).json({ ok: false, error: 'game dan photos wajib' });

      const stocks   = await redisGet('stocks') || [];
      const sameGame = stocks.filter(s => s.game === game);
      const id       = Date.now();

      const newStock = {
        id, no: sameGame.length + 1,
        game,
        price: parseInt(price) || 0,
        desc:  desc  || '',
        bind:  bind  || '',
        tags:  tags  || [],
        createdAt: id,
        photoCount: photos.length,
      };

      await redisSet(`photos:${id}`, photos);
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
