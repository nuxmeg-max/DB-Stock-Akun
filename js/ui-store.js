/* ════════════════════════════════════════════════════════════
   ui-store.js — Halaman stok (tampilan user & detail modal)
   ════════════════════════════════════════════════════════════ */

/* ─── RENDER GRID STOK ──────────────────────────────────────── */
function renderStore() {
  const query = document.getElementById('search-input')?.value || '';
  const game  = document.getElementById('filter-game')?.value  || 'all';
  const sort  = document.getElementById('filter-sort')?.value  || 'newest';

  const stocks = getFilteredStocks({ query, game, sort });
  const grid   = document.getElementById('stock-grid');
  if (!grid) return;

  if (stocks.length === 0) {
    grid.innerHTML = `
      <div class="stock-no-result">
        <i class="fa-solid fa-box-open"></i>
        STOK KOSONG
      </div>`;
    return;
  }

  grid.innerHTML = stocks.map(s => renderStockCard(s)).join('');
}

/* ─── RENDER SATU CARD ──────────────────────────────────────── */
function renderStockCard(s) {
  const gameName = s.game === 'ML' ? 'Mobile Legends' : 'Free Fire';
  const photos   = s.photos.slice(0, 4);
  const collage  = photos.map(p => `<img src="${p}" loading="lazy" alt="">`).join('');
  const tags     = (s.tags || []).slice(0, 4).map(t => tagDisplayHtml(t)).join('');
  const moreTags = (s.tags || []).length > 4
    ? `<span class="tag">+${s.tags.length - 4}</span>` : '';

  return `
    <div class="stock-card" onclick="openDetail(${s.id})">
      <div class="collage-wrap">${collage}</div>
      <div class="stock-card-body">
        <div class="stock-card-game">
          <i class="fa-solid fa-gamepad"></i> ${gameName}
        </div>
        <div class="stock-card-id">Akun ${s.game} #${s.no}</div>
        <div class="stock-card-tags">${tags}${moreTags}</div>
        <div class="stock-card-price">
          <span class="currency">Rp</span>${parseInt(s.price).toLocaleString('id-ID')}
        </div>
      </div>
    </div>
  `;
}

/* ─── DETAIL MODAL ──────────────────────────────────────────── */
function openDetail(id) {
  const s = getStockById(id);
  if (!s) return;

  // judul
  document.getElementById('modal-title').textContent =
    `Akun ${s.game} #${s.no}`;

  // gallery foto
  document.getElementById('modal-gallery').innerHTML = s.photos.map(p => `
    <img src="${p}" loading="lazy" alt=""
         onclick="openLightbox('${p.replace(/'/g, "\\'")}')">
  `).join('');

  // detail info
  const rows = [];
  if (s.game === 'ML' && s.bind) {
    rows.push(`
      <div class="detail-item">
        <label>Bind / Platform</label>
        <div class="val">${s.bind}</div>
      </div>`);
  }
  if (s.desc) {
    rows.push(`
      <div class="detail-item">
        <label>Deskripsi</label>
        <div class="val">${s.desc.replace(/\n/g, '<br>')}</div>
      </div>`);
  }
  if (s.tags && s.tags.length) {
    rows.push(`
      <div class="detail-item">
        <label>Tags</label>
        <div class="val" style="display:flex;flex-wrap:wrap;gap:4px">
          ${s.tags.map(t => tagDisplayHtml(t)).join('')}
        </div>
      </div>`);
  }
  document.getElementById('modal-detail').innerHTML = rows.join('');

  // harga
  document.getElementById('modal-price').innerHTML =
    `<span class="currency">Rp</span>${parseInt(s.price).toLocaleString('id-ID')}`;

  // tombol buy
  document.getElementById('modal-buy-btn').onclick = () => openWA(s.game, s.no);

  // buka modal
  document.getElementById('detail-modal').classList.add('open');
}

function closeDetailModal() {
  document.getElementById('detail-modal').classList.remove('open');
}
