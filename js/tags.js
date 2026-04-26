/* ════════════════════════════════════════════════════════════
   tags.js — Definisi semua tag untuk ML dan FF
   Tambah / hapus / edit tag di sini
   ════════════════════════════════════════════════════════════ */

const TAGS = {

  /* ─── MOBILE LEGENDS ─────────────────────────────────────── */
  ML: {

    rank: [
      'Warrior', 'Elite', 'Master', 'GrandMaster',
      'Epic', 'Legend', 'Mythic',
      'Mythical Honor', 'Mythical Glory', 'Mythical Immortal',
    ],

    collector: [
      // Amatir
      'Kolektor Amatir I', 'Kolektor Amatir II', 'Kolektor Amatir III',
      'Kolektor Amatir IV', 'Kolektor Amatir V',
      // Junior
      'Kolektor Junior I', 'Kolektor Junior II', 'Kolektor Junior III',
      'Kolektor Junior IV', 'Kolektor Junior V',
      // Senior
      'Kolektor Senior I', 'Kolektor Senior II', 'Kolektor Senior III',
      'Kolektor Senior IV', 'Kolektor Senior V',
      // Ahli
      'Kolektor Ahli I', 'Kolektor Ahli II', 'Kolektor Ahli III',
      'Kolektor Ahli IV', 'Kolektor Ahli V',
      // Ternama
      'Kolektor Ternama I', 'Kolektor Ternama II', 'Kolektor Ternama III',
      'Kolektor Ternama IV', 'Kolektor Ternama V',
      // Terhormat
      'Kolektor Terhormat I', 'Kolektor Terhormat II', 'Kolektor Terhormat III',
      'Kolektor Terhormat IV', 'Kolektor Terhormat V',
      // Juragan
      'Kolektor Juragan I', 'Kolektor Juragan II', 'Kolektor Juragan III',
      'Kolektor Juragan IV', 'Kolektor Juragan V',
      // Sultan
      'Kolektor Sultan I', 'Kolektor Sultan II', 'Kolektor Sultan III',
      'Kolektor Sultan IV', 'Kolektor Sultan V',
    ],

    emblem: [
      // Common
      'Emblem Common Lv1–60', 'Emblem Common Max',
      // Per tipe
      'Tank Lv1–60', 'Tank Max',
      'Assassin Lv1–60', 'Assassin Max',
      'Mage Lv1–60', 'Mage Max',
      'Fighter Lv1–60', 'Fighter Max',
      'Support Lv1–60', 'Support Max',
      'Marksman Lv1–60', 'Marksman Max',
    ],

    skin: [
      // Rarity dasar
      'Skin Common', 'Skin Exceptional', 'Skin Deluxe',
      'Skin Exquisite', 'Skin Grand', 'Skin Legend',
      // Seri & Kolaborasi
      'Shadow Covenant',
      'Seri Eternal Seasons',
      'Seri Kolab SpongeBob SquarePants',
      'Soul Vessels',
      'Seri Nexus Sea',
      'Seri P.Ace',
      'Mystic Meow',
      'Metro Zero',
      'Seri The Aspirants',
      'Seri MLBB x NARUTO',
      'Neobeasts',
      'HUNTER x HUNTER',
      'Seri Kishin Densetsu',
      'Seri The Exorcists',
      'KOF',
      'Seri ALLSTAR',
      'Attack on Titan',
      'Seri Mistbenders',
      'Seri Beyond The Clouds',
      'Seri Ducati',
      'Seri Atomic Pop',
      'Seri Dawning Stars',
      'Seri Jujutsu Kaisen',
      'Seri Saint Seiya',
      'Kung Fu Panda',
      'Heavenly Artifact',
      'MLBB x Transformers',
      '515 eParty',
      'MLBB x Sanrio Characters',
      'MLBB x Star Wars',
      'Blazing Bounties',
      'Dragon Tamer',
      'Lightborn',
      'V.E.N.O.M Squad',
      'S.A.B.E.R Squad',
      'Zodiac',
      'STARLIGHT',
    ],

  },

  /* ─── FREE FIRE ──────────────────────────────────────────── */
  FF: {

    rank: [
      'Bronze I', 'Bronze II', 'Bronze III',
      'Silver I', 'Silver II', 'Silver III',
      'Gold I', 'Gold II', 'Gold III', 'Gold IV',
      'Platinum I', 'Platinum II', 'Platinum III', 'Platinum IV',
      'Diamond I', 'Diamond II', 'Diamond III', 'Diamond IV',
      'Heroic', 'Master', 'Grandmaster',
    ],

    special: [
      'Prime I', 'Prime II', 'Prime III', 'Prime IV',
      'Prime V', 'Prime VI', 'Prime VII', 'Prime VIII',
      'Boyah Pass',
      'User Old',
      'SG Lobby',
      'Evo Gun',
    ],

    collab: [
      'Collab BTS',
      'Attack on Titan',
      'One Punch Man',
      'Naruto',
      'McLaren',
      'Lamborghini',
      'Bugatti',
      'Street Fighter',
      'Spider-Verse',
      'Venom',
      'Demon Slayer',
      'Money Heist',
      'Jujutsu Kaisen',
      "Assassin's Creed",
      'Devil May Cry 5',
      'Blue Lock',
      'Gintama',
    ],

  },

};

/* ─── HELPER: semua tag (untuk settings icon) ────────────────── */
function getAllTags() {
  return [
    ...TAGS.ML.rank,
    ...TAGS.ML.collector,
    ...TAGS.ML.emblem,
    ...TAGS.ML.skin,
    ...TAGS.FF.rank,
    ...TAGS.FF.special,
    ...TAGS.FF.collab,
  ];
}

/* ─── HELPER: render satu tag chip (display, bukan selector) ─── */
function tagDisplayHtml(name) {
  const ic = getTagIcon(name);
  return `<span class="tag">
    ${ic ? `<img src="${ic}" onerror="this.style.display='none'" alt="">` : ''}
    ${name}
  </span>`;
}

/* ─── HELPER: render tag option (di form selector) ─────────── */
function tagOptionHtml(name, selected = false) {
  const ic  = getTagIcon(name);
  const cls = selected ? 'tag-option selected' : 'tag-option';
  const safe = name.replace(/\\/g,'\\\\').replace(/'/g, "\\'");
  return `<span class="${cls}" onclick="toggleTag(this,'${safe}')">
    ${ic ? `<img src="${ic}" onerror="this.style.display='none'" alt="">` : ''}
    ${name}
  </span>`;
}

/* ─── HELPER: render semua tag ke dalam container ───────────── */
function renderTagSelector(elId, tags, selectedArr = []) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = tags.map(t => tagOptionHtml(t, selectedArr.includes(t))).join('');
}

/* ─── HELPER: toggle pilih tag ─────────────────────────────── */
function toggleTag(el, name) {
  el.classList.toggle('selected');
  const img = el.querySelector('img');
  if (img) img.style.filter = el.classList.contains('selected') ? 'invert(1)' : '';
}

/* ─── HELPER: ambil tag yang dipilih dari container ─────────── */
function getSelectedTags(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return [];
  return [...el.querySelectorAll('.tag-option.selected')]
    .map(e => e.textContent.trim());
}

/* ─── HELPER: render semua tag selector (form admin) ────────── */
function renderAllTagSelectors(mlSelected = {}, ffSelected = {}) {
  renderTagSelector('ml-tags-rank',      TAGS.ML.rank,      mlSelected.rank      || []);
  renderTagSelector('ml-tags-collector', TAGS.ML.collector, mlSelected.collector || []);
  renderTagSelector('ml-tags-emblem',    TAGS.ML.emblem,    mlSelected.emblem    || []);
  renderTagSelector('ml-tags-skin',      TAGS.ML.skin,      mlSelected.skin      || []);
  renderTagSelector('ff-tags-rank',      TAGS.FF.rank,      ffSelected.rank      || []);
  renderTagSelector('ff-tags-special',   TAGS.FF.special,   ffSelected.special   || []);
  renderTagSelector('ff-tags-collab',    TAGS.FF.collab,    ffSelected.collab    || []);
}
