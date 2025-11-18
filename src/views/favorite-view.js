import { showLoading, hideLoading } from '../utils/utils.js'; 
import Router from '../utils/router.js';
import { showToast } from '../utils/utils.js';
import { createStoryItemTemplate } from '../templates/template-creator.js'; 

class FavoriteView {
  constructor() {
    this._mainContent = document.getElementById('main-content');
  }

  render() {
    const user = localStorage.getItem('user');
    
    this._mainContent.innerHTML = `
      <section class="content">
        <div class="container">
          <h2 class="content-title" tabindex="0">Cerita Tersimpan (Favorite)</h2>
          <p class="content-subtitle">Lihat cerita yang Anda simpan secara lokal.</p>
          <div id="favorite-list" class="story-list grid">
            </div>
          <div id="favorite-empty-message" class="empty-state" style="display: none;">
            </div>
        </div>
      </section>
    `;
    this._favoriteListContainer = document.getElementById('favorite-list');
    this._emptyMessageContainer = document.getElementById('favorite-empty-message');
    
    this.renderNavigation(user);
  }
  
  renderNavigation(user) {
    const nav = document.getElementById('nav-menu');
    if (!nav) return;

    nav.setAttribute('role', 'navigation'); 
    nav.setAttribute('aria-label', 'Navigasi utama'); 

    nav.innerHTML = `
      <a href="#/home">Beranda</a>
      <a href="#/add">Tambah Cerita</a>
      <a href="#/favorites" aria-current="page">💖 Cerita Tersimpan</a>
      <span style="margin-left:auto;color:#555;">${user ? `Halo, ${user.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')}` : ''}</span>
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

  /**
   * Menampilkan daftar cerita favorite menggunakan template.
   * @param {Array} stories - Daftar cerita dari IndexedDB.
   */
  displayStories(stories) {
    this._emptyMessageContainer.style.display = 'none';
    this._favoriteListContainer.innerHTML = '';
    
    stories.forEach(story => {
      const storyItem = createStoryItemTemplate(story, { isFavoritePage: true }); 
      this._favoriteListContainer.innerHTML += storyItem;
    });
  }

  /**
   * Menampilkan pesan ketika tidak ada cerita favorite.
   * @param {string} message - Pesan yang akan ditampilkan.
   */
  showEmptyMessage(message) {
    this._favoriteListContainer.innerHTML = '';
    this._emptyMessageContainer.style.display = 'block';
    this._emptyMessageContainer.innerHTML = `
      <p aria-live="polite">${message}</p>
      <a href="#/home" class="button primary">Lihat Semua Cerita</a>
    `;
  }

  /**
   * Mengikat event listener ke tombol hapus favorite.
   * Dipanggil oleh FavoritePresenter.
   * @param {Function} handler
   */
  bindDeleteFavorite(handler) {
    this._favoriteListContainer.addEventListener('click', (event) => {
      const deleteButton = event.target.closest('.delete-favorite-button');
      
      if (deleteButton) {
        event.preventDefault();
        const storyId = deleteButton.dataset.id;
        if (confirm(`Apakah Anda yakin ingin menghapus cerita dari favorite?`)) {
          handler(storyId);
        }
      }
    });
  }

  showLoading() {
    showLoading();
  }

  hideLoading() {
    hideLoading();
  }

  showErrorMessage(message) {
    this._favoriteListContainer.innerHTML = `<p class="error-message">${message}</p>`;
  }
}

export default FavoriteView;