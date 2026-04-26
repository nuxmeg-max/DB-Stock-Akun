/* ════════════════════════════════════════════════════════════
   api/stocks.js
   GET  /api/stocks        → ambil semua stok
   POST /api/stocks        → tambah stok baru
   ════════════════════════════════════════════════════════════ */

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // ─── CORS ──────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {

    /* ── GET: ambil semua stok ──────────────────────────────── */
    if (req.method === 'GET') {
      const stocks = await kv.get('stocks') || [];
      return res.status(200).json({ ok: true, data: stocks });
    }

    /* ── POST: tambah stok baru ─────────────────────────────── */
    if (req.method === 'POST') {
      const { game, photos, price, desc, bind, tags } = req.body;

      // validasi minimal
      if (!game || !photos || photos.length === 0) {
        return res.status(400).json({ ok: false, error: 'game dan photos wajib diisi' });
      }

      const stocks = await kv.get('stocks') || [];

      // hitung nomor urut per game
      const sameGame = stocks.filter(s => s.game === game);
      const no       = sameGame.length + 1;

      const newStock = {
        id:        Date.now(),
        no,
        game,
        photos:    photos || [],
        price:     parseInt(price)  || 0,
        desc:      desc             || '',
        bind:      bind             || '',
        tags:      tags             || [],
        createdAt: Date.now(),
      };

      stocks.push(newStock);
      await kv.set('stocks', stocks);

      return res.status(200).json({ ok: true, data: newStock });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });

  } catch (err) {
    console.error('[/api/stocks]', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}
