/* ════════════════════════════════════════════════════════════
   api/settings.js
   GET  /api/settings        → ambil semua settings
   POST /api/settings        → simpan settings
   ════════════════════════════════════════════════════════════ */

import { kv } from '@vercel/kv';

const DEFAULTS = {
  waNumber:  '6281234567890',
  adminName: 'Meg',
  tagIcons:  {},
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {

    /* ── GET: ambil settings ────────────────────────────────── */
    if (req.method === 'GET') {
      const settings = await kv.get('settings') || DEFAULTS;
      // jangan kirim adminName ke client (keamanan)
      // client hanya butuh waNumber & tagIcons
      const { adminName, ...publicSettings } = settings;
      return res.status(200).json({ ok: true, data: publicSettings });
    }

    /* ── POST: simpan settings ──────────────────────────────── */
    if (req.method === 'POST') {
      const current  = await kv.get('settings') || DEFAULTS;
      const incoming = req.body || {};

      // merge — hanya update field yang dikirim
      const updated = { ...current };
      if (incoming.waNumber  !== undefined) updated.waNumber  = incoming.waNumber;
      if (incoming.adminName !== undefined) updated.adminName = incoming.adminName;
      if (incoming.tagIcons  !== undefined) updated.tagIcons  = incoming.tagIcons;

      await kv.set('settings', updated);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });

  } catch (err) {
    console.error('[/api/settings]', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}
