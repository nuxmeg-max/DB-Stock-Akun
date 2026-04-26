/* ════════════════════════════════════════════════════════════
   app.js — Login, logout, navigasi, remember name, init
   ════════════════════════════════════════════════════════════ */

const SESSION_KEY  = 'meg_session_name';   // nama yang diingat di browser

let currentUser = null;
let isAdmin     = false;

/* ════════════════════════════════════════════════════════════
   LOGIN & LOGOUT
   ════════════════════════════════════════════════════════════ */

function doLogin() {
  const input = document.getElementById('login-name');
  const name  = input.value.trim();
  if (!name) return;

  const adminName = getAdminName();
  currentUser = name;
  isAdmin     = name.toLowerCase() === adminName.toLowerCase();

  // simpan nama ke localStorage agar diingat
  localStorage.setItem(SESSION_KEY, name);

  applySession();
}

function doLogout() {
  // hapus sesi yang disimpan
  localStorage.removeItem(SESSION_KEY);

  currentUser = null;
  isAdmin     = false;

  // reset UI
  document.getElementById('login-name').value = '';
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('app').classList.remove('visible');

  // kembali ke halaman store
  switchPage('store');
}

/* ─── TERAPKAN SESI SETELAH LOGIN ───────────────────────────── */
function applySession() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.add('visible');
  document.getElementById('display-name').textContent = currentUser;

  const adminBadge = document.getElementById('admin-badge');
  adminBadge.style.display = isAdmin ? '' : 'none';

  const nav = document.getElementById('main-nav');
  if (isAdmin) nav.classList.add('is-admin');
  else         nav.classList.remove('is-admin');

  renderStore();
}

/* ════════════════════════════════════════════════════════════
   NAVIGASI HALAMAN
   ════════════════════════════════════════════════════════════ */

function switchPage(page) {
  // sembunyikan semua page
  document.querySelectorAll('.page-section')
    .forEach(s => s.classList.remove('active'));

  // nonaktifkan semua tab
  document.querySelectorAll('.nav-tab')
    .forEach(t => t.classList.remove('active'));

  // tampilkan page yang dipilih
  document.getElementById('page-' + page)?.classList.add('active');
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

  // render konten sesuai page
  if (page === 'admin') {
    renderAllTagSelectors();
    renderManageList();
  }
  if (page === 'settings') {
    renderSettingsPage();
  }
}

/* ════════════════════════════════════════════════════════════
   INIT — dijalankan saat halaman pertama kali dibuka
   ════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── cek apakah ada nama yang tersimpan ─────────────────────
  const savedName = localStorage.getItem(SESSION_KEY);

  if (savedName) {
    // langsung login tanpa perlu isi nama lagi
    const adminName = getAdminName();
    currentUser = savedName;
    isAdmin     = savedName.toLowerCase() === adminName.toLowerCase();

    // isi input juga (kalau user sempat lihat)
    document.getElementById('login-name').value = savedName;

    applySession();
  }
  // kalau tidak ada sesi → tampilkan login screen (default)

  // ─── Enter key di login input ────────────────────────────────
  document.getElementById('login-name')
    .addEventListener('keydown', e => {
      if (e.key === 'Enter') doLogin();
    });

});
