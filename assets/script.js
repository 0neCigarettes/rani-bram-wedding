/* ══════════════════════════════
   URL QUERY PARAMS
   ?to=Nama%20Tamu        — tampilkan nama tamu di cover
   ?rsvp=1                — tampilkan seksi RSVP
   ?gift=1                — tampilkan seksi Amplop Digital
   Default: RSVP & Amplop tersembunyi kecuali param aktif.
   Contoh gabungan:
   index.html?to=Budi+Santoso&rsvp=1&gift=1
══════════════════════════════ */
(function () {
  const p = new URLSearchParams(window.location.search);

  // Nama tamu di cover
  const to = p.get('to');
  if (to && to.trim()) {
    document.getElementById('cover-to-name').textContent = to.trim();
    document.getElementById('cover-to').style.display = 'block';
  }

  // Tampilkan RSVP hanya jika ?rsvp=1
  const rsvpEl = document.getElementById('rsvp');
  if (rsvpEl) rsvpEl.style.display = p.get('rsvp') === '1' ? '' : 'none';

  // Jika tidak ada ?rsvp=1, ucapan & doa juga disembunyikan (tidak relevan)
  if (p.get('rsvp') !== '1') {
    const ucapanEl = document.getElementById('ucapan');
    if (ucapanEl) ucapanEl.style.setProperty('display', 'none', 'important');
  }

  // Tampilkan Amplop Digital hanya jika ?gift=1
  const giftEl = document.getElementById('hadiah');
  if (giftEl) giftEl.style.display = p.get('gift') === '1' ? '' : 'none';
})();

/* ══════════════════════════════
   OPEN INVITATION
══════════════════════════════ */
function openInvitation () {
  const cover = document.getElementById('cover');
  // Stop ring animations before sliding cover out — frees GPU resources
  cover.querySelectorAll('.cover-ring').forEach(r => r.style.animation = 'none');
  cover.classList.add('hidden');
  cover.addEventListener('transitionend', function onDone (e) {
    if (e.target !== cover) return;
    cover.style.display = 'none';
    cover.removeEventListener('transitionend', onDone);
  });
  const main = document.getElementById('main');
  setTimeout(() => {
    main.classList.add('show');
    document.getElementById('music-btn').classList.add('show');
    startMusic();
    startCountdown();
    if (new URLSearchParams(window.location.search).get('rsvp') === '1') loadRSVPData();
    initFadeIn();
  }, 350);
}

/* ══════════════════════════════
   MUSIC
══════════════════════════════ */
const audio = document.getElementById('bgAudio');
let musikOn = false;

function startMusic () {
  audio.volume = 0;
  audio.play().then(() => {
    musikOn = true;
    updateMusicBtn();
    fadeInAudio(0.35);
  }).catch(() => { /* autoplay blocked — user can press the button */ });
}

function fadeInAudio (targetVol) {
  let v = 0;
  const id = setInterval(() => {
    v = Math.min(v + 0.025, targetVol);
    audio.volume = v;
    if (v >= targetVol) clearInterval(id);
  }, 120);
}

function toggleMusic () {
  if (musikOn) { audio.pause(); musikOn = false; }
  else { audio.play(); musikOn = true; }
  updateMusicBtn();
}

function updateMusicBtn () {
  const btn = document.getElementById('music-btn');
  const icon = document.getElementById('music-icon');
  icon.textContent = musikOn ? '♫' : '♪';
  musikOn ? btn.classList.add('playing') : btn.classList.remove('playing');
}

/* ══════════════════════════════
   COUNTDOWN
══════════════════════════════ */
function startCountdown () {
  tick();
  const cdTimer = setInterval(() => { if (!tick()) clearInterval(cdTimer); }, 1000);
}

function tick () {
  // 05 April 2026 pukul 09:00 WIB (UTC+7)
  const target = new Date('2026-04-05T09:00:00+07:00').getTime();
  const now = Date.now();
  const sisa = target - now;

  if (sisa <= 0) {
    document.getElementById('cd-grid').innerHTML =
      '<p id="cd-done">🎊 Hari yang Dinantikan Telah Tiba! 🎊</p>';
    return false; // signal to stop interval
  }

  const d = Math.floor(sisa / 86400000);
  const h = Math.floor((sisa % 86400000) / 3600000);
  const m = Math.floor((sisa % 3600000) / 60000);
  const s = Math.floor((sisa % 60000) / 1000);

  document.getElementById('cd-d').textContent = pad(d);
  document.getElementById('cd-h').textContent = pad(h);
  document.getElementById('cd-m').textContent = pad(m);
  document.getElementById('cd-s').textContent = pad(s);
  return true;
}

function pad (n) { return String(n).padStart(2, '0'); }

/* ══════════════════════════════
   FADE-IN ON SCROLL
══════════════════════════════ */
function initFadeIn () {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fi').forEach(el => obs.observe(el));
}

/* ══════════════════════════════
   RSVP & UCAPAN
══════════════════════════════ */
const _c = (s) => atob(s);
const SHEET_ID = _c('MTEtTElFc2duV01JTHlKNDdpa1pjN1RvREl4aVZoZ24xVVBhcWplaUNyZkk=');
const SHEET_NAME = 'RSVP';
const SHEETS_URL = _c('aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J6dDNuZEQ2TDVsdTFiUjh0QUZLZnFFZmJwcHZOZTBtTlZVUW5lTjBHNVN2ZHRDWjNVX1BJaEpZRGsyOUt3VDJrVFcvZXhlYw==');
// ─────────────────────────────────────────────────────────────────

let wishesData = [];

// ── Submit RSVP ──
function submitRSVP (e) {
  e.preventDefault();
  const nama = document.getElementById('f-nama').value.trim();
  const hadir = document.querySelector('input[name="hadir"]:checked');
  const jumlah = document.getElementById('f-jumlah').value;
  const ucapan = document.getElementById('f-ucapan').value.trim();

  if (!nama || !hadir || !ucapan) return;

  const entry = {
    no: wishesData.length + 1,
    waktu: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    nama,
    hadir: hadir.value === 'hadir' ? 'Hadir' : 'Tidak Hadir',
    jumlah: hadir.value === 'hadir' ? jumlah : '0',
    ucapan
  };

  sendToSheets(entry);
  wishesData.push(entry);
  addWishCard(entry, true);
  updateCount(wishesData.length);
  document.getElementById('ucapan').style.display = 'block';
  document.getElementById('ucapan-empty').style.display = 'none';
  document.getElementById('rsvp-form').style.display = 'none';
  document.getElementById('form-ok').style.display = 'block';

  setTimeout(() => {
    document.getElementById('ucapan').scrollIntoView({ behavior: 'smooth' });
  }, 600);
}

// ── POST ke Apps Script (simpan) — no-cors, tidak perlu baca respons ──
function sendToSheets (entry) {
  if (!isUrlSet()) return;
  fetch(SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  }).catch(() => { });
}

// ── GET data via Google Sheets Visualization API (gviz/tq JSONP) ──
// Tidak butuh Apps Script untuk membaca. Cukup sheet di-share "Anyone with link → Viewer".
function loadRSVPData () {
  if (!isSheetIdSet()) return;

  window.__gvizCb = function (res) {
    delete window.__gvizCb; // cleanup global
    const old = document.getElementById('_gviz_s');
    if (old) old.remove();

    if (!res || res.status === 'error') return;

    const tableRows = (res.table && res.table.rows) ? res.table.rows : [];
    wishesData = tableRows.map((row, i) => ({
      no: row.c[0] ? row.c[0].v : i + 1,
      waktu: row.c[1] ? row.c[1].v : '',
      nama: row.c[2] ? row.c[2].v : '',
      hadir: row.c[3] ? row.c[3].v : '',
      jumlah: row.c[4] ? row.c[4].v : '',
      ucapan: row.c[5] ? row.c[5].v : ''
    })).filter(r => r.nama);

    if (wishesData.length > 0) {
      document.getElementById('ucapan').style.display = 'block';
      wishesData.slice().reverse().forEach(entry => addWishCard(entry, false));
      updateCount(wishesData.length);
    }
  };

  const s = document.createElement('script');
  s.id = '_gviz_s';
  s.onerror = function () { s.remove(); };
  s.src = 'https://docs.google.com/spreadsheets/d/'
    + SHEET_ID
    + '/gviz/tq?tqx=responseHandler:__gvizCb&sheet='
    + encodeURIComponent(SHEET_NAME);
  document.head.appendChild(s);
}

function isSheetIdSet () { return SHEET_ID && !SHEET_ID.startsWith('GANTI'); }
function isUrlSet () { return SHEETS_URL && !SHEETS_URL.startsWith('GANTI'); }

function addWishCard (entry, prepend) {
  const list = document.getElementById('ucapan-list');
  const badge = entry.hadir === 'Hadir' ? '✅' : '❌';
  const card = document.createElement('div');
  card.className = 'wish-card';
  card.innerHTML = `
    <p class="wish-name">👤 ${esc(entry.nama)}
      <small style="color:var(--text-300);font-size:.72rem;">&nbsp;${badge} ${esc(entry.hadir)} &nbsp;·&nbsp; ${esc(entry.waktu)}</small>
    </p>
    <p class="wish-text">"${esc(entry.ucapan)}"</p>`;
  prepend ? list.insertBefore(card, list.firstChild) : list.appendChild(card);
}

function updateCount (n) {
  const el = document.getElementById('ucapan-count');
  if (el) el.textContent = n;
}

// (dummy — badge sudah disembunyikan, fungsi dipertahankan agar tidak error)
function setSheetStatus () { }

// ── Ekspor CSV dari data in-memory ──
function exportCSV () {
}

function esc (s) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(s));
  return d.innerHTML;
}

/* ══════════════════════════════
   COPY ACCOUNT NUMBER
══════════════════════════════ */
function copyAccount (id, btn) {
  const nomor = document.getElementById(id).textContent.replace(/\s/g, '');
  (navigator.clipboard ? navigator.clipboard.writeText(nomor) : fallbackCopy(nomor))
    .then(() => showCopied(btn))
    .catch(() => { fallbackCopy(nomor); showCopied(btn); });
}

function fallbackCopy (text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

function showCopied (btn) {
  const orig = btn.innerHTML;
  btn.innerHTML = '✅ &nbsp;Tersalin!';
  btn.classList.add('ok');
  setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('ok'); }, 2200);
}
