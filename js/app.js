/* ════════════════════════════════════════════════════════════
   app.js — Login, logout, navigasi, remember name, init
   ════════════════════════════════════════════════════════════ */

const SESSION_KEY = 'meg_session_name';

let currentUser = null;
let isAdmin     = false;

/* ════════════════════════════════════════════════════════════
   STOCK CACHE — refresh dari API
   ════════════════════════════════════════════════════════════ */

async function refreshStockCache() {
  _stockCache = await getStocks();
}

/* ════════════════════════════════════════════════════════════
   LOGIN & LOGOUT
   ════════════════════════════════════════════════════════════ */

function doLogin() {
  const input = document.getElementById('login-name');
  const name  = input.value.trim();
  if (!name) return;

  const adminName = getSetting('adminName', CONFIG.DEFAULT_ADMIN_NAME);
  currentUser = name;
  isAdmin     = name.toLowerCase() === adminName.toLowerCase();

  localStorage.setItem(SESSION_KEY, name);
  applySession();
}

function doLogout() {
  localStorage.removeItem(SESSION_KEY);
  currentUser = null;
  isAdmin     = false;

  document.getElementById('login-name').value = '';
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('app').classList.remove('visible');

  switchPage('store');
}

/* ─── TERAPKAN SESI ─────────────────────────────────────────── */
function applySession() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.add('visible');
  document.getElementById('display-name').textContent = currentUser;

  document.getElementById('admin-badge').style.display = isAdmin ? '' : 'none';

  const nav = document.getElementById('main-nav');
  if (isAdmin) nav.classList.add('is-admin');
  else         nav.classList.remove('is-admin');

  renderStore();
}

/* ════════════════════════════════════════════════════════════
   NAVIGASI
   ════════════════════════════════════════════════════════════ */

function switchPage(page) {
  document.querySelectorAll('.page-section')
    .forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab')
    .forEach(t => t.classList.remove('active'));

  document.getElementById('page-' + page)?.classList.add('active');
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

  if (page === 'admin') {
    renderAllTagSelectors();
    renderManageList();
  }
  if (page === 'settings') {
    renderSettingsPage();
  }
}

/* ════════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {

  // 1. Load settings dari API (waNumber, tagIcons)
  _settingsCache = await fetchPublicSettings();

  // 2. Load semua stok ke cache
  setGridLoading(true);
  await refreshStockCache();

  // 3. Cek sesi tersimpan (remember name)
  const savedName = localStorage.getItem(SESSION_KEY);
  if (savedName) {
    const adminName = getSetting('adminName', CONFIG.DEFAULT_ADMIN_NAME);
    currentUser = savedName;
    isAdmin     = savedName.toLowerCase() === adminName.toLowerCase();
    document.getElementById('login-name').value = savedName;
    applySession();
  } else {
    // tidak ada sesi — tampilkan login, tapi render store dulu biar siap
    renderStore();
  }

  // 4. Enter key di input login
  document.getElementById('login-name')
    .addEventListener('keydown', e => {
      if (e.key === 'Enter') doLogin();
    });

});
