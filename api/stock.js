/* ════════════════════════════════════════════════════════════
   api/stock.js
   PUT    /api/stock?id=xxx   → edit stok
   DELETE /api/stock?id=xxx   → hapus stok
   ════════════════════════════════════════════════════════════ */

import { kv } from '@vercel/kv';

/* ─── renumber per game setelah delete ─────────────────────── */
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
  if (!id) return res.status(400).json({ ok: false, error: 'id wajib diisi' });

  try {
    let stocks = await kv.get('stocks') || [];

    /* ── PUT: edit stok ───────────────────────────────────────── */
    if (req.method === 'PUT') {
      const idx = stocks.findIndex(s => s.id === id);
      if (idx === -1) return res.status(404).json({ ok: false, error: 'Stok tidak ditemukan' });

      const { price, desc, bind, tags, photos } = req.body;
      stocks[idx] = {
        ...stocks[idx],
        price:  parseInt(price) || stocks[idx].price,
        desc:   desc   ?? stocks[idx].desc,
        bind:   bind   ?? stocks[idx].bind,
        tags:   tags   ?? stocks[idx].tags,
        photos: photos ?? stocks[idx].photos,
      };

      await kv.set('stocks', stocks);
      return res.status(200).json({ ok: true, data: stocks[idx] });
    }

    /* ── DELETE: hapus stok ───────────────────────────────────── */
    if (req.method === 'DELETE') {
      const exists = stocks.find(s => s.id === id);
      if (!exists) return res.status(404).json({ ok: false, error: 'Stok tidak ditemukan' });

      stocks = renumber(stocks.filter(s => s.id !== id));
      await kv.set('stocks', stocks);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });

  } catch (err) {
    console.error('[/api/stock]', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}
