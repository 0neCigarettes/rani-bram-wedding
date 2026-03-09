# 💍 Undangan Pernikahan Digital — Rani & Bram

Website undangan pernikahan online berbahasa Indonesia dengan desain elegan bernuansa biru muda. Dibangun sebagai static site — tanpa framework, tanpa build step.

## 🔗 Demo

```
https://username.github.io/mywedding/
```

---

## 📁 Struktur File

```
mywedding/
├── index.html          # Markup HTML
└── assets/
    ├── favicon.ico     # Ikon browser / tab
    ├── style.css       # Semua styling (CSS variables, layout, animasi)
    ├── script.js       # Logika: musik, countdown, RSVP, Google Sheets
    ├── images/         # Foto mempelai & galeri
    └── musics/         # File audio latar
```

---

## ✨ Fitur

- Halaman cover fullscreen dengan tombol **"Buka Undangan"**
- Musik latar otomatis (fade-in) setelah undangan dibuka, tombol toggle floating
- Profil mempelai dengan foto placeholder
- Detail acara Akad & Resepsi
- **Countdown timer** realtime menuju hari-H (WIB)
- Peta lokasi embed Google Maps
- Timeline kisah cinta
- Galeri foto grid
- **Form RSVP** — data tersimpan ke Google Sheets
- **Ucapan & Doa** — tampil dari Google Sheets via JSONP
- Amplop digital (Bank Mandiri & DANA)
- Kutipan penutup & footer
- Fully responsive — mobile-first

---

## 🔗 URL Query Parameters

Setiap tamu dapat dikirim link personal dengan parameter:

| Parameter | Nilai | Efek |
|-----------|-------|------|
| `?to=` | Nama tamu | Tampilkan "Kepada Yth. [nama]" di cover |
| `?rsvp=1` | — | Tampilkan seksi RSVP + Ucapan & Doa |
| `?gift=1` | — | Tampilkan seksi Amplop Digital |

**Default:** RSVP dan Amplop tersembunyi kecuali param aktif.

**Contoh:**
```
# Undangan lengkap
https://username.github.io/mywedding/?to=Bapak+Ahmad&rsvp=1&gift=1

# Hanya lihat undangan (tanpa RSVP & amplop)
https://username.github.io/mywedding/?to=Dewi+Rahayu
```

---

## ⚙️ Konfigurasi Google Sheets (RSVP)

Data RSVP disimpan ke Google Sheets. Setup diperlukan sebelum form aktif.

### 1. Buat Google Sheet

Buat spreadsheet baru, rename sheet pertama menjadi `RSVP`.

Header kolom (baris 1):
```
No | Waktu | Nama | Kehadiran | Jumlah Tamu | Ucapan
```

### 2. Buat Apps Script (untuk POST)

Di spreadsheet: **Extensions → Apps Script**, paste kode berikut:

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSVP');
  const data = JSON.parse(e.postData.contents);
  const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  sheet.appendRow([
    sheet.getLastRow(),
    now,
    data.nama,
    data.hadir,
    data.jumlah,
    data.ucapan
  ]);
  return ContentService.createTextOutput('ok');
}
```

Deploy: **Deploy → New deployment → Web App**
- Execute as: **Me**
- Who has access: **Anyone**

Salin URL deployment.

### 3. Share Sheet (untuk GET/tampil ucapan)

Spreadsheet → **Share → Anyone with the link → Viewer**

### 4. Update `assets/script.js`

Ganti nilai config dengan `btoa()` di browser console:

```js
// Jalankan di console browser untuk encode:
btoa('YOUR_SHEET_ID')     // ambil dari URL spreadsheet
btoa('YOUR_APPS_SCRIPT_URL')
```

Kemudian update di `assets/script.js`:

```js
const SHEET_ID  = _c('BASE64_SHEET_ID_DISINI');
const SHEET_NAME = 'RSVP';
const SHEETS_URL = _c('BASE64_APPS_SCRIPT_URL_DISINI');
```

---

## 🚀 Deploy ke GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/mywedding.git
git push -u origin main
```

Di GitHub: **Settings → Pages → Source: Deploy from branch → main → / (root) → Save**

---

## 🎵 Musik Latar

Tambahkan file audio di `assets/musics/`:

```html
<!-- index.html, cari elemen <audio> dan update src: -->
<source src="assets/musics/nama-lagu.mp3" type="audio/mpeg">
```

Format yang didukung: `.mp3`, `.ogg`, `.wav`

---

## 🛠️ Kustomisasi

| Yang ingin diubah | Lokasi |
|---|---|
| Nama mempelai, tanggal, venue | `index.html` — cari teks langsung |
| Warna tema | `assets/style.css` — blok `:root` (CSS variables) |
| Foto mempelai & galeri | `assets/images/` — ganti file gambar lalu update `src` di `index.html` |
| Rekening bank | `index.html` — seksi `id="hadiah"` |
| Koordinat peta | `index.html` — `<iframe>` Google Maps embed |
| Countdown target | `assets/script.js` — fungsi `tick()` |

---

## 📄 Lisensi

Dibuat untuk keperluan pribadi. Bebas dimodifikasi.
