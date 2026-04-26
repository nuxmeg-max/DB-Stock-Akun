/* ════════════════════════════════════════════════════════════
   config.js — Konfigurasi utama MEG STORE
   Edit file ini untuk ubah setting dasar website
   ════════════════════════════════════════════════════════════ */

const CONFIG = {

  // ─── NAMA ADMIN (password login) ────────────────────────────
  // Nama ini yang bisa masuk sebagai admin
  // Bisa diubah juga dari halaman Settings di website
  DEFAULT_ADMIN_NAME: 'Meg',

  // ─── NOMOR WHATSAPP ─────────────────────────────────────────
  // Format: 62 + nomor tanpa 0 di depan
  // Contoh: 081234567890 → 6281234567890
  DEFAULT_WA_NUMBER: '6281234567890',

  // ─── NAMA WEBSITE ───────────────────────────────────────────
  SITE_NAME: 'MEG STORE',
  SITE_SUBTITLE: 'ML & FF ACCOUNT STOCK',

  // ─── PESAN WHATSAPP ─────────────────────────────────────────
  // {game} = MLBB atau Free Fire
  // {no}   = nomor stok
  WA_MESSAGE_TEMPLATE: 'Halo kak, saya mau beli Stok akun {game} #{no}',

};

/* ─── HELPER: localStorage wrapper ─────────────────────────── */
function getSetting(key, defaultVal) {
  return localStorage.getItem('meg_' + key) || defaultVal;
}
function setSetting(key, val) {
  localStorage.setItem('meg_' + key, val);
}

/* ─── HELPER: nomor WA aktif (dari settings atau default) ───── */
function getActiveWA() {
  return getSetting('waNumber', CONFIG.DEFAULT_WA_NUMBER);
}

/* ─── HELPER: nama admin aktif ─────────────────────────────── */
function getAdminName() {
  return getSetting('adminName', CONFIG.DEFAULT_ADMIN_NAME);
}

/* ─── HELPER: format rupiah ─────────────────────────────────── */
function formatRp(num) {
  return 'Rp ' + parseInt(num || 0).toLocaleString('id-ID');
}

/* ─── HELPER: buka WhatsApp ─────────────────────────────────── */
function openWA(game, no) {
  const wa  = getActiveWA();
  const msg = CONFIG.WA_MESSAGE_TEMPLATE
    .replace('{game}', game === 'ML' ? 'MLBB' : 'Free Fire')
    .replace('{no}', no);
  window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank');
}

/* ─── HELPER: notification toast ───────────────────────────── */
let _notifTimer;
function showNotif(msg) {
  const el = document.getElementById('notif');
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(_notifTimer);
  _notifTimer = setTimeout(() => el.style.display = 'none', 2500);
}

/* ─── HELPER: lightbox ──────────────────────────────────────── */
function openLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

/* ─── HELPER: modal background click ───────────────────────── */
function closeModalBg(event, modalId, closeFn) {
  if (event.target === document.getElementById(modalId)) {
    window[closeFn]();
  }
}

/* ─── HELPER: tag icons (localStorage) ─────────────────────── */
function getTagIcons() {
  try { return JSON.parse(localStorage.getItem('meg_tagicons') || '{}'); }
  catch { return {}; }
}
function getTagIcon(name) {
  return getTagIcons()[name] || null;
}
