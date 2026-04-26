# MEG STORE — ML & FF Account Stock

Website stok akun Mobile Legends & Free Fire. Monochrome, simple, deploy ke Vercel.

---

## STRUKTUR FILE

```
meg-store/
├── index.html              ← struktur HTML (jarang diedit)
├── vercel.json             ← konfigurasi Vercel (jangan diedit)
├── css/
│   └── style.css           ← TAMPILAN & WARNA
└── js/
    ├── config.js           ← SETTING UTAMA (WA, nama admin)
    ├── tags.js             ← DAFTAR TAG ML & FF
    ├── data.js             ← logika data / localStorage
    ├── ui-store.js         ← tampilan halaman stok (user)
    ├── ui-admin.js         ← form tambah, manage, edit stok
    ├── ui-settings.js      ← halaman settings admin
    └── app.js              ← login, logout, navigasi
```

---

## DEPLOY KE VERCEL (CARA CEPAT)

### 1. Buat repo GitHub
1. Buka https://github.com/new
2. Nama repo: `meg-store`
3. Visibility: **Public** (gratis di Vercel)
4. Klik **Create repository**

### 2. Upload file
**Cara A — lewat web GitHub (paling mudah):**
1. Di halaman repo, klik **Add file → Upload files**
2. Drag seluruh folder `meg-store` ke browser
3. Klik **Commit changes**

**Cara B — lewat Git:**
```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/USERNAME/meg-store.git
git push -u origin main
```

### 3. Deploy ke Vercel
1. Buka https://vercel.com → Login pakai GitHub
2. Klik **Add New → Project**
3. Pilih repo `meg-store` → klik **Import**
4. Setting biarkan default (Vercel otomatis detect static)
5. Klik **Deploy**
6. Selesai! Dapat domain `meg-store.vercel.app`

### 4. Custom domain (opsional)
- Di dashboard Vercel → Settings → Domains
- Tambah domain kamu sendiri

---

## CARA EDIT

### Ganti nomor WA atau nama admin default
Edit file `js/config.js`:
```js
DEFAULT_ADMIN_NAME: 'Meg',       // ← ganti nama admin
DEFAULT_WA_NUMBER: '6281234567890', // ← ganti nomor WA
```

### Ganti warna tema
Edit file `css/style.css`, bagian paling atas `:root`:
```css
:root {
  --bg:    #0a0a0a;   /* background utama */
  --white: #ffffff;   /* warna aksen */
  /* dst */
}
```

### Tambah / hapus tag
Edit file `js/tags.js`, tambah string ke array yang sesuai:
```js
ML: {
  skin: [
    'Skin Common',
    'Skin Legend',
    'Nama Seri Baru',   // ← tambah di sini
  ]
}
```

### Ganti pesan WhatsApp
Edit file `js/config.js`:
```js
WA_MESSAGE_TEMPLATE: 'Halo kak, saya mau beli Stok akun {game} #{no}',
// {game} = MLBB atau Free Fire
// {no}   = nomor stok (1, 2, 3, dst)
```

---

## FITUR

| Fitur | Keterangan |
|---|---|
| Login by nama | Nama `Meg` = admin, nama lain = user biasa |
| Remember name | Browser otomatis ingat nama, skip login |
| Stok ML | Upload foto, harga, bind, deskripsi, tags lengkap |
| Stok FF | Upload foto, harga, deskripsi, tags lengkap |
| Kolase foto | Foto otomatis disusun jadi kolase di card |
| Filter & search | Cari by nama, game, sort harga |
| Detail modal | Lihat semua foto + info + tombol buy WA |
| Lightbox | Klik foto = zoom fullscreen |
| Edit & delete stok | Dari halaman Admin |
| Ikon tag kustom | Upload URL ikon per tag di Settings |
| Responsive | Bisa dibuka di HP |

---

## CATATAN PENTING

- **Data tersimpan di localStorage browser** — data hanya ada di device yang dipakai admin input stok. Kalau pakai HP berbeda, stok tidak akan muncul.
- Kalau mau data sinkron semua device, perlu upgrade ke backend (Vercel KV / Supabase).
- Foto dikonversi ke base64 dan disimpan di localStorage — jangan upload terlalu banyak foto resolusi tinggi karena ada batas storage ~5MB per domain.

---

## UPDATE WEBSITE

Kalau edit file dan mau update:
1. Push ke GitHub (otomatis re-deploy di Vercel)
2. Atau upload ulang file yang diedit via GitHub web

Vercel otomatis deploy setiap ada push ke branch `main`.
