import Router from '../utils/router.js';
import { showToast } from '../utils/utils.js';
import { createStoryItemTemplate } from '../templates/template-creator.js';

class HomeView {
  render() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token) {
      Router.navigate('/login');
      return;
    }

    document.querySelector('main').innerHTML = `
      <section class="hero" role="region" aria-labelledby="hero-heading">
        <h2 id="hero-heading">Ceritaku</h2>
        <p>Berbagi cerita pengguna dengan lokasi</p>
      </section>

      <div class="main-content" role="main">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:12px">
          <div>
            <label for="filterSelect">Filter:</label>
            <select id="filterSelect" aria-label="Filter cerita berdasarkan lokasi">
              <option value="all">Semua</option>
              <option value="with-location">Dengan Lokasi</option>
              <option value="without-location">Tanpa Lokasi</option>
            </select>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn" id="push-subscribe-btn" aria-label="Berlangganan notifikasi cerita baru" style="display:none;">
              🔔 Berlangganan Notifikasi
            </button>
            <button class="btn" id="push-unsubscribe-btn" aria-label="Berhenti berlangganan notifikasi" style="display:none;">
              🔕 Berhenti Berlangganan
            </button>
            <button class="btn" id="add-btn" aria-label="Tambah cerita baru">Tambah Cerita</button>
          </div>
        </div>

        <div id="map" class="map-wrapper" style="height:300px;" role="region" aria-label="Peta lokasi cerita"></div>

        <section class="story-list" id="story-container" aria-live="polite" aria-label="Daftar cerita pengguna"></section>
      </div>
    `;

    this.renderNavigation(user);

    const sel = document.getElementById('filterSelect');
    sel.addEventListener('change', (e) => {
      const evt = new CustomEvent('filter:change', { detail: { value: e.target.value }});
      document.dispatchEvent(evt);
    });

    const container = document.getElementById('story-container');
    if (container) container.setAttribute('tabindex', '-1');
  }

  renderNavigation(user) {
    const nav = document.getElementById('nav-menu');
    if (!nav) return;

    nav.setAttribute('role', 'navigation'); 
    nav.setAttribute('aria-label', 'Navigasi utama'); 

    nav.innerHTML = `
      <a href="#/home" aria-current="page">Beranda</a>
      <a href="#/add">Tambah Cerita</a>
      <a href="#/favorites">💖 Cerita Tersimpan</a>
      <span style="margin-left:auto;color:#555;">${user ? `Halo, ${escapeHtml(user)}` : ''}</span>
      <a href="#/login" id="logout-link" style="color:red;">Logout</a>
    `;

    const logoutBtn = document.getElementById('logout-link');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showToast('Berhasil logout!', 'success');
        Router.navigate('/login');
      });
    }
  }

  bindCardClick(handler) {
    const container = document.getElementById('story-container');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const card = e.target.closest('.story-card');
      if (card) {
        const id = card.dataset.id;
        handler(id);
      }
    });
  }

  bindFavoriteClick(addHandler, removeHandler) {
    const container = document.getElementById('story-container');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const addBtn = e.target.closest('.add-favorite-button');
      const delBtn = e.target.closest('.delete-favorite-button');

      if (addBtn) {
        const id = addBtn.dataset.id;
        addHandler(id);
      }

      if (delBtn) {
        const id = delBtn.dataset.id;
        removeHandler(id);
      }
    });
  }

  renderStories(stories) {
    const container = document.getElementById('story-container');
    if (!container) return;

    if (!stories || stories.length === 0) {
      container.innerHTML = `<p role="status">Tidak ada cerita</p>`; 
      return;
    }

    // Gunakan template creator agar tombol favorite muncul
    container.innerHTML = stories.map(s => createStoryItemTemplate(s)).join('');
  }

  initMap(stories) {
    if (!window.L) {
      console.warn('Leaflet not loaded.');
      return;
    }

    if (this._map) {
      this._map.remove();
      this._map = null;
    }

    const defaultCenter = [ -2.5489, 118.0149 ];
    this._map = L.map('map').setView(defaultCenter, 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this._map);

    this._markers = [];
    this.updateMap(stories);
  }

  updateMap(stories) {
    if (!this._map) return;

    if (this._markers && this._markers.length) {
      this._markers.forEach(m => this._map.removeLayer(m));
    }
    this._markers = [];

    const latlngs = [];
    stories.forEach(s => {
      const lat = s.lat ?? null;
      const lon = s.lon ?? null;
      if (lat != null && lon != null && !Number.isNaN(lat) && !Number.isNaN(lon)) {
        const m = L.marker([lat, lon]).addTo(this._map);
        m.bindPopup(`<b>${escapeHtml(s.name || '')}</b><p>${escapeHtml(s.description || '')}</p>`);
        this._markers.push(m);
        latlngs.push([lat, lon]);
      }
    });

    if (latlngs.length) {
      const bounds = L.latLngBounds(latlngs);
      this._map.fitBounds(bounds.pad(0.2));
    }
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export default HomeView;