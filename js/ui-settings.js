/* ════════════════════════════════════════════════════════════
   ui-settings.js — Halaman settings (admin only)
   ════════════════════════════════════════════════════════════ */

/* ─── RENDER HALAMAN SETTINGS ───────────────────────────────── */
function renderSettingsPage() {
  // ambil dari cache settings yang sudah di-load saat init
  document.getElementById('wa-number').value =
    _settingsCache.waNumber || CONFIG.DEFAULT_WA_NUMBER;
  document.getElementById('admin-name-setting').value =
    getSetting('adminName', CONFIG.DEFAULT_ADMIN_NAME); // adminName tetap localStorage (keamanan)

  renderTagIconSettings();
}

/* ─── SIMPAN WA / ADMIN NAME ─────────────────────────────────── */
async function saveSetting(key, val) {
  if (!val.trim()) { showNotif('⚠ Tidak boleh kosong'); return; }

  if (key === 'waNumber') {
    // simpan ke KV via API
    const ok = await postSettings({ waNumber: val.trim() });
    if (ok) {
      _settingsCache.waNumber = val.trim();
      showNotif('✓ Nomor WA tersimpan');
    } else {
      showNotif('⚠ Gagal menyimpan');
    }
  }

  if (key === 'adminName') {
    // adminName disimpan di localStorage saja (tidak dikirim ke API agar aman)
    setSetting('adminName', val.trim());
    showNotif('✓ Nama admin tersimpan');
  }
}

/* ─── RENDER TAG ICON SETTINGS ──────────────────────────────── */
function renderTagIconSettings() {
  const allTags = getAllTags();
  const icons   = getTagIcons(); // dari _settingsCache
  const el      = document.getElementById('tag-icon-settings');
  if (!el) return;

  el.innerHTML = allTags.map(t => {
    const safe = t.replace(/"/g, '&quot;');
    return `
      <div class="setting-item">
        <label title="${safe}">${safe}</label>
        <input
          class="ti-input"
          data-tag="${safe}"
          type="text"
          placeholder="https://i.imgur.com/..."
          value="${icons[t] || ''}"
          oninput="previewTagIcon(this)"
        >
        ${icons[t]
          ? `<img class="setting-preview" src="${icons[t]}"
                  onerror="this.style.display='none'" alt="">`
          : ''}
      </div>
    `;
  }).join('');
}

/* ─── PREVIEW IKON SAAT MENGETIK ────────────────────────────── */
function previewTagIcon(input) {
  let prev = input.nextElementSibling;
  if (input.value.trim()) {
    if (!prev || !prev.classList.contains('setting-preview')) {
      prev = document.createElement('img');
      prev.className = 'setting-preview';
      input.after(prev);
    }
    prev.src     = input.value.trim();
    prev.onerror = () => { prev.style.display = 'none'; };
    prev.style.display = '';
  } else {
    if (prev && prev.classList.contains('setting-preview')) prev.remove();
  }
}

/* ─── SIMPAN SEMUA IKON TAG ─────────────────────────────────── */
async function saveTagIcons() {
  const icons = {};
  document.querySelectorAll('.ti-input').forEach(inp => {
    const val = inp.value.trim();
    if (val) icons[inp.dataset.tag] = val;
  });

  const ok = await postSettings({ tagIcons: icons });
  if (ok) {
    _settingsCache.tagIcons = icons; // update cache lokal
    renderAllTagSelectors();
    renderStore();
    showNotif('✓ Ikon tag tersimpan');
  } else {
    showNotif('⚠ Gagal menyimpan ikon');
  }
}
