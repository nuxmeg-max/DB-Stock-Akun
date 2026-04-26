/* ════════════════════════════════════════════════════════════
   api/stock.js
   PUT    /api/stock?id=xxx  → edit stok
   DELETE /api/stock?id=xxx  → hapus stok
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

function renumber(arr) {
  const ml = arr.filter(s => s.game === 'ML').map((s, i) => ({ ...s, no: i + 1 }));
  const ff = arr.filter(s => s.game === 'FF').map((s, i) => ({ ...s, no: i + 1 }));
  return [...ml, ...ff];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const id = parseInt(req.query.id);
  if (!id) return res.status(400).json({ ok: false, error: 'id wajib' });

  try {
    let stocks = await redisGet('stocks') || [];

    /* ── PUT ──────────────────────────────────────────────── */
    if (req.method === 'PUT') {
      const idx = stocks.findIndex(s => s.id === id);
      if (idx === -1) return res.status(404).json({ ok: false, error: 'Tidak ditemukan' });

      const { price, desc, bind, tags, photos } = req.body;
      stocks[idx] = {
        ...stocks[idx],
        price:  parseInt(price)  ?? stocks[idx].price,
        desc:   desc   ?? stocks[idx].desc,
        bind:   bind   ?? stocks[idx].bind,
        tags:   tags   ?? stocks[idx].tags,
        photos: photos ?? stocks[idx].photos,
      };
      await redisSet('stocks', stocks);
      return res.status(200).json({ ok: true, data: stocks[idx] });
    }

    /* ── DELETE ───────────────────────────────────────────── */
    if (req.method === 'DELETE') {
      if (!stocks.find(s => s.id === id))
        return res.status(404).json({ ok: false, error: 'Tidak ditemukan' });

      stocks = renumber(stocks.filter(s => s.id !== id));
      await redisSet('stocks', stocks);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('[stock]', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
