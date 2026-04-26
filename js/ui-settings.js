/* ════════════════════════════════════════════════════════════
   ui-settings.js — Halaman settings (admin only)
   ════════════════════════════════════════════════════════════ */

/* ─── RENDER HALAMAN SETTINGS ───────────────────────────────── */
function renderSettingsPage() {
  document.getElementById('wa-number').value =
    getSetting('waNumber', CONFIG.DEFAULT_WA_NUMBER);
  document.getElementById('admin-name-setting').value =
    getSetting('adminName', CONFIG.DEFAULT_ADMIN_NAME);

  renderTagIconSettings();
}

/* ─── SIMPAN SETTING ─────────────────────────────────────────── */
function saveSetting(key, val) {
  if (!val.trim()) {
    showNotif('⚠ Tidak boleh kosong');
    return;
  }
  setSetting(key, val.trim());
  showNotif('✓ Tersimpan');
}

/* ─── RENDER TAG ICON SETTINGS ──────────────────────────────── */
function renderTagIconSettings() {
  const allTags = getAllTags();
  const icons   = getTagIcons();
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
    if (prev && prev.classList.contains('setting-preview')) {
      prev.remove();
    }
  }
}

/* ─── SIMPAN SEMUA IKON TAG ─────────────────────────────────── */
function saveTagIcons() {
  const icons = {};
  document.querySelectorAll('.ti-input').forEach(inp => {
    const val = inp.value.trim();
    if (val) icons[inp.dataset.tag] = val;
  });
  localStorage.setItem('meg_tagicons', JSON.stringify(icons));

  // refresh semua tag selector & store agar ikon muncul
  renderAllTagSelectors();
  renderStore();
  showNotif('✓ Ikon tag tersimpan');
}
