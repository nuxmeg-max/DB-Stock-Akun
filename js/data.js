/* ════════════════════════════════════════════════════════════
   data.js — CRUD stok via API (Vercel KV)
   Semua data sekarang disimpan di cloud, bukan localStorage
   ════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════
   API CALLS
   ════════════════════════════════════════════════════════════ */

/* ─── GET semua stok ────────────────────────────────────────── */
async function getStocks() {
  try {
    const res  = await fetch('/api/stocks');
    const json = await res.json();
    return json.ok ? json.data : [];
  } catch (err) {
    console.error('getStocks error:', err);
    return [];
  }
}

/* ─── GET stok by ID (dari cache lokal) ─────────────────────── */
// dipanggil setelah getStocks() load data ke _stockCache
let _stockCache = [];
function getStockById(id) {
  return _stockCache.find(s => s.id === id) || null;
}

/* ─── ADD stok baru ─────────────────────────────────────────── */
async function addStock({ game, photos, price, desc, bind, tags }) {
  try {
    const res  = await fetch('/api/stocks', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ game, photos, price, desc, bind, tags }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error);
    return json.data;
  } catch (err) {
    console.error('addStock error:', err);
    showNotif('⚠ Gagal menyimpan stok');
    return null;
  }
}

/* ─── UPDATE stok ───────────────────────────────────────────── */
async function updateStock(id, changes) {
  try {
    const res  = await fetch(`/api/stock?id=${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(changes),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error);
    return true;
  } catch (err) {
    console.error('updateStock error:', err);
    showNotif('⚠ Gagal update stok');
    return false;
  }
}

/* ─── DELETE stok ───────────────────────────────────────────── */
async function deleteStock(id) {
  if (!confirm('Hapus stok ini?')) return false;
  try {
    const res  = await fetch(`/api/stock?id=${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error);
    return true;
  } catch (err) {
    console.error('deleteStock error:', err);
    showNotif('⚠ Gagal menghapus stok');
    return false;
  }
}

/* ════════════════════════════════════════════════════════════
   SETTINGS VIA API
   ════════════════════════════════════════════════════════════ */

/* ─── GET settings publik (waNumber, tagIcons) ──────────────── */
async function fetchPublicSettings() {
  try {
    const res  = await fetch('/api/settings');
    const json = await res.json();
    return json.ok ? json.data : {};
  } catch {
    return {};
  }
}

/* ─── POST settings ─────────────────────────────────────────── */
async function postSettings(payload) {
  try {
    const res  = await fetch('/api/settings', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const json = await res.json();
    return json.ok;
  } catch {
    return false;
  }
}

/* ─── Override getTagIcons() — ambil dari cache settings ─────── */
// Di-populate saat init oleh app.js
let _settingsCache = {};
function getTagIcons() {
  return _settingsCache.tagIcons || {};
}
function getTagIcon(name) {
  return getTagIcons()[name] || null;
}

/* ════════════════════════════════════════════════════════════
   FILTER & SORT (lokal, dari cache)
   ════════════════════════════════════════════════════════════ */

function getFilteredStocks({ query = '', game = 'all', sort = 'newest' } = {}) {
  let stocks = [..._stockCache];

  if (game !== 'all') {
    stocks = stocks.filter(s => s.game === game);
  }

  if (query) {
    const q = query.toLowerCase();
    stocks = stocks.filter(s => {
      const tagStr  = (s.tags || []).join(' ').toLowerCase();
      const gameStr = s.game === 'ML' ? 'mobile legends mlbb' : 'free fire ff';
      return (
        gameStr.includes(q) ||
        ('akun ' + s.game.toLowerCase() + ' #' + s.no).includes(q) ||
        (s.desc  || '').toLowerCase().includes(q) ||
        (s.bind  || '').toLowerCase().includes(q) ||
        tagStr.includes(q)
      );
    });
  }

  if (sort === 'newest')     stocks.sort((a, b) => b.createdAt - a.createdAt);
  if (sort === 'price-asc')  stocks.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') stocks.sort((a, b) => b.price - a.price);

  return stocks;
}

/* ════════════════════════════════════════════════════════════
   PHOTO BUFFER (sementara, sebelum disimpan)
   ════════════════════════════════════════════════════════════ */

const photoBuffers = { ml: [], ff: [] };

function handlePhotos(type, input) {
  const files = [...input.files];
  files.forEach(f => {
    const reader = new FileReader();
    reader.onload = e => {
      photoBuffers[type].push(e.target.result);
      renderPreviews(type);
    };
    reader.readAsDataURL(f);
  });
  input.value = '';
}

function removePhoto(type, idx) {
  photoBuffers[type].splice(idx, 1);
  renderPreviews(type);
}

function renderPreviews(type) {
  const el = document.getElementById(type + '-previews');
  if (!el) return;
  el.innerHTML = photoBuffers[type].map((src, i) => `
    <div class="preview-item">
      <img src="${src}" alt="preview">
      <button class="preview-remove" onclick="removePhoto('${type}', ${i})">×</button>
    </div>
  `).join('');
}

function resetPhotoBuffer(type) {
  photoBuffers[type] = [];
  renderPreviews(type);
}

/* ─── Edit photo buffer ─────────────────────────────────────── */
let editPhotoBuffers = [];

function handleEditPhotos(input) {
  [...input.files].forEach(f => {
    const r = new FileReader();
    r.onload = e => {
      editPhotoBuffers.push(e.target.result);
      renderEditPreviews();
    };
    r.readAsDataURL(f);
  });
  input.value = '';
}

function removeEditPhoto(idx) {
  editPhotoBuffers.splice(idx, 1);
  renderEditPreviews();
}

function renderEditPreviews() {
  const el = document.getElementById('e-previews');
  if (!el) return;
  el.innerHTML = editPhotoBuffers.map((src, i) => `
    <div class="preview-item">
      <img src="${src}" alt="preview">
      <button class="preview-remove" onclick="removeEditPhoto(${i})">×</button>
    </div>
  `).join('');
}

/* ════════════════════════════════════════════════════════════
   LOADING STATE helper
   ════════════════════════════════════════════════════════════ */

function setGridLoading(loading) {
  const grid = document.getElementById('stock-grid');
  if (!grid) return;
  if (loading) {
    grid.innerHTML = `
      <div class="stock-no-result">
        <i class="fa-solid fa-circle-notch fa-spin"></i>
        MEMUAT STOK...
      </div>`;
  }
}
