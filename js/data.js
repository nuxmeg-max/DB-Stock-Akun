/* ════════════════════════════════════════════════════════════
   data.js — CRUD stok (baca, simpan, hapus, edit)
   Semua operasi data ada di sini
   ════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'meg_stocks';

/* ─── READ ──────────────────────────────────────────────────── */
function getStocks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function getStockById(id) {
  return getStocks().find(s => s.id === id) || null;
}

/* ─── WRITE ─────────────────────────────────────────────────── */
function saveStocks(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

/* ─── RENUMBER: atur ulang nomor per game ───────────────────── */
function renumberAndSave(arr) {
  const ml = arr.filter(s => s.game === 'ML').map((s, i) => ({ ...s, no: i + 1 }));
  const ff = arr.filter(s => s.game === 'FF').map((s, i) => ({ ...s, no: i + 1 }));
  const result = [...ml, ...ff];
  saveStocks(result);
  return result;
}

/* ─── ADD ───────────────────────────────────────────────────── */
function addStock({ game, photos, price, desc, bind, tags }) {
  const stocks = getStocks();

  // hitung nomor berikutnya untuk game ini
  const sameGame = stocks.filter(s => s.game === game);
  const no = sameGame.length + 1;

  const newStock = {
    id:        Date.now(),
    no,
    game,
    photos:    photos   || [],
    price:     parseInt(price) || 0,
    desc:      desc     || '',
    bind:      bind     || '',   // hanya ML
    tags:      tags     || [],
    createdAt: Date.now(),
  };

  stocks.push(newStock);
  saveStocks(stocks);
  return newStock;
}

/* ─── UPDATE ────────────────────────────────────────────────── */
function updateStock(id, changes) {
  const stocks = getStocks();
  const idx = stocks.findIndex(s => s.id === id);
  if (idx === -1) return false;
  stocks[idx] = { ...stocks[idx], ...changes };
  saveStocks(stocks);
  return true;
}

/* ─── DELETE ────────────────────────────────────────────────── */
function deleteStock(id) {
  if (!confirm('Hapus stok ini?')) return false;
  const stocks = getStocks().filter(s => s.id !== id);
  renumberAndSave(stocks);
  return true;
}

/* ─── FILTER & SORT (untuk tampilan store) ──────────────────── */
function getFilteredStocks({ query = '', game = 'all', sort = 'newest' } = {}) {
  let stocks = getStocks();

  // filter game
  if (game !== 'all') {
    stocks = stocks.filter(s => s.game === game);
  }

  // filter search
  if (query) {
    const q = query.toLowerCase();
    stocks = stocks.filter(s => {
      const tagStr  = (s.tags || []).join(' ').toLowerCase();
      const gameStr = s.game === 'ML' ? 'mobile legends mlbb' : 'free fire ff';
      return (
        gameStr.includes(q) ||
        ('akun ' + s.game.toLowerCase() + ' #' + s.no).includes(q) ||
        (s.desc || '').toLowerCase().includes(q) ||
        (s.bind || '').toLowerCase().includes(q) ||
        tagStr.includes(q)
      );
    });
  }

  // sort
  if (sort === 'newest')     stocks.sort((a, b) => b.createdAt - a.createdAt);
  if (sort === 'price-asc')  stocks.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') stocks.sort((a, b) => b.price - a.price);

  return stocks;
}

/* ─── PHOTO BUFFER (sementara, sebelum disimpan) ───────────── */
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
  input.value = ''; // reset input agar file yang sama bisa diupload lagi
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

/* ─── EDIT PHOTO BUFFER ─────────────────────────────────────── */
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
