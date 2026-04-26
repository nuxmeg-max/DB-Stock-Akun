/* ════════════════════════════════════════════════════════════
   ui-admin.js — Form tambah stok, manage list, edit modal
   ════════════════════════════════════════════════════════════ */

let currentGameType = 'ML';
let editingId       = null;

/* ─── SWITCH GAME TYPE (ML / FF) ────────────────────────────── */
function switchGameType(type, el) {
  currentGameType = type;
  document.querySelectorAll('#game-type-tabs .inner-tab')
    .forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('form-ML').style.display = type === 'ML' ? '' : 'none';
  document.getElementById('form-FF').style.display = type === 'FF' ? '' : 'none';
}

/* ─── SUBMIT STOK BARU ──────────────────────────────────────── */
async function submitStock(game) {
  const type   = game.toLowerCase();
  const photos = [...photoBuffers[type]];

  if (photos.length === 0) {
    showNotif('⚠ Upload minimal 1 foto dulu');
    return;
  }

  const price = document.getElementById(type + '-price').value;
  const desc  = document.getElementById(type + '-desc').value.trim();
  const bind  = game === 'ML'
    ? document.getElementById('ml-bind').value.trim()
    : '';

  let tags = [];
  if (game === 'ML') {
    tags = [
      ...getSelectedTags('ml-tags-rank'),
      ...getSelectedTags('ml-tags-collector'),
      ...getSelectedTags('ml-tags-emblem'),
      ...getSelectedTags('ml-tags-skin'),
    ];
  } else {
    tags = [
      ...getSelectedTags('ff-tags-rank'),
      ...getSelectedTags('ff-tags-special'),
      ...getSelectedTags('ff-tags-collab'),
    ];
  }

  // disable tombol saat loading
  const btn = document.querySelector(`#form-${game} .btn-primary`);
  if (btn) { btn.disabled = true; btn.textContent = 'MENYIMPAN...'; }

  const newStock = await addStock({ game, photos, price, desc, bind, tags });

  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> SIMPAN STOK ' + game; }

  if (!newStock) return; // error sudah ditampilkan di addStock

  // reset form
  resetPhotoBuffer(type);
  document.getElementById(type + '-price').value = '';
  document.getElementById(type + '-desc').value  = '';
  if (game === 'ML') document.getElementById('ml-bind').value = '';
  renderAllTagSelectors();

  showNotif(`✓ Stok ${game} #${newStock.no} ditambahkan!`);

  // refresh cache & UI
  await refreshStockCache();
  renderStore();
  renderManageList();
}

/* ─── MANAGE LIST ───────────────────────────────────────────── */
function renderManageList() {
  const stocks = [..._stockCache].reverse();
  const el     = document.getElementById('manage-list');
  if (!el) return;

  if (stocks.length === 0) {
    el.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-inbox"></i>
        <p>Belum ada stok</p>
      </div>`;
    return;
  }

  el.innerHTML = stocks.map(s => `
    <div class="manage-item">
      <img class="manage-item-img"
           src="${s.photos[0] || ''}"
           onerror="this.style.background='var(--bg3)'"
           alt="">
      <div class="manage-item-info">
        <div class="name">Akun ${s.game} #${s.no}</div>
        <div class="meta">
          ${formatRp(s.price)}
          &nbsp;·&nbsp; ${(s.tags || []).length} tag
          &nbsp;·&nbsp; ${s.photos.length} foto
        </div>
      </div>
      <div class="manage-item-actions">
        <button class="btn btn-ghost btn-sm" onclick="openEdit(${s.id})">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="handleDelete(${s.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

/* ─── DELETE ─────────────────────────────────────────────────── */
async function handleDelete(id) {
  const ok = await deleteStock(id);
  if (ok) {
    showNotif('✓ Stok dihapus');
    await refreshStockCache();
    renderStore();
    renderManageList();
  }
}

/* ─── EDIT MODAL: BUKA ──────────────────────────────────────── */
function openEdit(id) {
  const s = getStockById(id);
  if (!s) return;

  editingId        = id;
  editPhotoBuffers = [...s.photos];

  const tagGroups = s.game === 'ML'
    ? [
        { id: 'e-ml-rank',      label: 'Rank',       tags: TAGS.ML.rank      },
        { id: 'e-ml-collector', label: 'Kolektor',    tags: TAGS.ML.collector },
        { id: 'e-ml-emblem',    label: 'Emblem',      tags: TAGS.ML.emblem    },
        { id: 'e-ml-skin',      label: 'Skin',        tags: TAGS.ML.skin      },
      ]
    : [
        { id: 'e-ff-rank',    label: 'Rank',          tags: TAGS.FF.rank    },
        { id: 'e-ff-special', label: 'Pass & Special', tags: TAGS.FF.special },
        { id: 'e-ff-collab',  label: 'Kolaborasi',    tags: TAGS.FF.collab  },
      ];

  const bindField = s.game === 'ML' ? `
    <div class="form-group">
      <label>Bind / Platform</label>
      <input type="text" id="e-bind" value="${s.bind || ''}">
    </div>` : '';

  document.getElementById('edit-modal-body').innerHTML = `
    <div class="form-group">
      <label>Harga (Rp)</label>
      <input type="number" id="e-price" value="${s.price}">
    </div>
    ${bindField}
    <div class="form-group">
      <label>Deskripsi</label>
      <textarea id="e-desc" rows="3">${s.desc || ''}</textarea>
    </div>
    ${tagGroups.map(g => `
      <div class="form-group">
        <label>${g.label}</label>
        <div class="tag-selector" id="${g.id}">
          ${g.tags.map(t => tagOptionHtml(t, (s.tags || []).includes(t))).join('')}
        </div>
      </div>
    `).join('')}
    <div class="form-group">
      <label>Foto</label>
      <div class="upload-zone" onclick="document.getElementById('e-upload').click()">
        <input type="file" id="e-upload" accept="image/*" multiple onchange="handleEditPhotos(this)">
        <i class="fa-solid fa-cloud-arrow-up"></i>
        <p>tambah foto</p>
      </div>
      <div class="photo-previews" id="e-previews"></div>
    </div>
    <button class="btn btn-primary btn-full" id="edit-save-btn" onclick="saveEdit('${s.game}')">
      <i class="fa-solid fa-floppy-disk"></i> SIMPAN PERUBAHAN
    </button>
  `;

  renderEditPreviews();
  document.getElementById('edit-modal').classList.add('open');
}

/* ─── EDIT MODAL: SIMPAN ────────────────────────────────────── */
async function saveEdit(game) {
  if (!editingId) return;

  const tagGroupIds = game === 'ML'
    ? ['e-ml-rank', 'e-ml-collector', 'e-ml-emblem', 'e-ml-skin']
    : ['e-ff-rank', 'e-ff-special', 'e-ff-collab'];

  const tags  = tagGroupIds.flatMap(id => getSelectedTags(id));
  const price = document.getElementById('e-price').value;
  const desc  = document.getElementById('e-desc').value.trim();
  const bind  = game === 'ML'
    ? (document.getElementById('e-bind')?.value.trim() || '')
    : '';

  const btn = document.getElementById('edit-save-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'MENYIMPAN...'; }

  const ok = await updateStock(editingId, {
    price: parseInt(price) || 0,
    desc, bind, tags,
    photos: editPhotoBuffers,
  });

  if (!ok) {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> SIMPAN PERUBAHAN'; }
    return;
  }

  closeEditModal();
  showNotif('✓ Stok berhasil diupdate');
  await refreshStockCache();
  renderStore();
  renderManageList();
}

/* ─── EDIT MODAL: TUTUP ─────────────────────────────────────── */
function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('open');
  editingId        = null;
  editPhotoBuffers = [];
}
