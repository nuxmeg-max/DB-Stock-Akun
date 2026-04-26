/* ════════════════════════════════════════════════════════════
   ui-store.js — Halaman stok (tampilan user & detail modal)
   ════════════════════════════════════════════════════════════ */

function renderStore() {
  const query = document.getElementById('search-input')?.value || '';
  const game  = document.getElementById('filter-game')?.value  || 'all';
  const sort  = document.getElementById('filter-sort')?.value  || 'newest';
  const stocks = getFilteredStocks({ query, game, sort });
  const grid   = document.getElementById('stock-grid');
  if (!grid) return;
  if (stocks.length === 0) {
    grid.innerHTML = `<div class="stock-no-result"><i class="fa-solid fa-box-open"></i>STOK KOSONG</div>`;
    return;
  }
  grid.innerHTML = stocks.map(s => renderStockCard(s)).join('');
}

function renderStockCard(s) {
  const gameName = s.game === 'ML' ? 'Mobile Legends' : 'Free Fire';
  const thumb    = s.thumb
    ? `<img src="${s.thumb}" loading="lazy" alt="">`
    : `<div style="width:100%;height:100%;background:var(--bg3);display:flex;align-items:center;justify-content:center;color:var(--text3);font-size:10px;letter-spacing:1px">NO IMAGE</div>`;
  const photoInfo = s.photoCount > 1
    ? `<span class="tag"><i class="fa-solid fa-images"></i> ${s.photoCount} foto</span>` : '';
  const tags     = (s.tags || []).slice(0, 3).map(t => tagDisplayHtml(t)).join('');
  const moreTags = (s.tags || []).length > 3 ? `<span class="tag">+${s.tags.length - 3}</span>` : '';
  return `
    <div class="stock-card" onclick="openDetail(${s.id})">
      <div class="collage-wrap">${thumb}</div>
      <div class="stock-card-body">
        <div class="stock-card-game"><i class="fa-solid fa-gamepad"></i> ${gameName}</div>
        <div class="stock-card-id">Akun ${s.game} #${s.no}</div>
        <div class="stock-card-tags">${tags}${moreTags}${photoInfo}</div>
        <div class="stock-card-price"><span class="currency">Rp</span>${parseInt(s.price).toLocaleString('id-ID')}</div>
      </div>
    </div>`;
}

async function openDetail(id) {
  document.getElementById('modal-title').textContent = 'Memuat...';
  document.getElementById('modal-gallery').innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text3)">
      <i class="fa-solid fa-circle-notch fa-spin"></i>
    </div>`;
  document.getElementById('modal-detail').innerHTML = '';
  document.getElementById('modal-price').innerHTML  = '';
  document.getElementById('detail-modal').classList.add('open');

  const s = await fetchStockDetail(id);
  if (!s) { document.getElementById('modal-title').textContent = 'Gagal memuat'; return; }

  document.getElementById('modal-title').textContent = `Akun ${s.game} #${s.no}`;
  document.getElementById('modal-gallery').innerHTML = (s.photos || []).map(p => `
    <img src="${p}" loading="lazy" alt="" onclick="openLightbox('${p.replace(/'/g,"\\'")}')">
  `).join('') || '<div style="color:var(--text3);font-size:10px">Tidak ada foto</div>';

  const rows = [];
  if (s.game === 'ML' && s.bind)
    rows.push(`<div class="detail-item"><label>Bind / Platform</label><div class="val">${s.bind}</div></div>`);
  if (s.desc)
    rows.push(`<div class="detail-item"><label>Deskripsi</label><div class="val">${s.desc.replace(/\n/g,'<br>')}</div></div>`);
  if (s.tags && s.tags.length)
    rows.push(`<div class="detail-item"><label>Tags</label><div class="val" style="display:flex;flex-wrap:wrap;gap:4px">${s.tags.map(t => tagDisplayHtml(t)).join('')}</div></div>`);
  document.getElementById('modal-detail').innerHTML = rows.join('');
  document.getElementById('modal-price').innerHTML  =
    `<span class="currency">Rp</span>${parseInt(s.price).toLocaleString('id-ID')}`;
  document.getElementById('modal-buy-btn').onclick = () => openWA(s.game, s.no);
}

function closeDetailModal() {
  document.getElementById('detail-modal').classList.remove('open');
}
