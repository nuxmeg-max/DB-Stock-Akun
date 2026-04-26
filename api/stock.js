/* ════════════════════════════════════════════════════════════
   api/stock.js
   GET    /api/stock?id=xxx  → ambil detail + foto 1 stok
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

async function redisDel(key) {
  await fetch(`${UPSTASH_URL}/del/${key}`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
}

function renumber(arr) {
  const ml = arr.filter(s => s.game === 'ML').map((s, i) => ({ ...s, no: i + 1 }));
  const ff = arr.filter(s => s.game === 'FF').map((s, i) => ({ ...s, no: i + 1 }));
  return [...ml, ...ff];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const id = parseInt(req.query.id);
  if (!id) return res.status(400).json({ ok: false, error: 'id wajib' });

  try {
    let stocks = await redisGet('stocks') || [];

    if (req.method === 'GET') {
      const stock = stocks.find(s => s.id === id);
      if (!stock) return res.status(404).json({ ok: false, error: 'Tidak ditemukan' });
      const photos = await redisGet(`photos:${id}`) || [];
      return res.status(200).json({ ok: true, data: { ...stock, photos } });
    }

    if (req.method === 'PUT') {
      const idx = stocks.findIndex(s => s.id === id);
      if (idx === -1) return res.status(404).json({ ok: false, error: 'Tidak ditemukan' });

      const { price, desc, bind, tags, photos } = req.body;

      if (photos && photos.length > 0) {
        await redisSet(`photos:${id}`, photos);
        stocks[idx].photoCount = photos.length;
        stocks[idx].thumb      = photos[0];
      }

      stocks[idx] = {
        ...stocks[idx],
        price: parseInt(price) ?? stocks[idx].price,
        desc:  desc  ?? stocks[idx].desc,
        bind:  bind  ?? stocks[idx].bind,
        tags:  tags  ?? stocks[idx].tags,
      };

      await redisSet('stocks', stocks);
      return res.status(200).json({ ok: true, data: stocks[idx] });
    }

    if (req.method === 'DELETE') {
      if (!stocks.find(s => s.id === id))
        return res.status(404).json({ ok: false, error: 'Tidak ditemukan' });

      await redisDel(`photos:${id}`);
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
