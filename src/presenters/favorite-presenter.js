import IndexedDBService from '../services/indexed-db-service.js';
import { showToast } from '../utils/utils.js';
import Router from '../utils/router.js';

class FavoritePresenter {
  constructor(view) {
    this.view = view;
  }

  async init() {
    this.view.render();

    await this.loadFavoriteStories();

    this.view.bindDeleteFavorite(this.handleDeleteFavorite);
  }

  async loadFavoriteStories() {
    this.view.showLoading();
    try {
      const favoriteStories = await IndexedDBService.getAllFavoriteStories();

      if (!favoriteStories || favoriteStories.length === 0) {
        this.view.showEmptyMessage('Anda belum menyimpan cerita favorite.');
      } else {
        this.view.displayStories(favoriteStories, { isFavoritePage: true });
      }
    } catch (error) {
      console.error('❌ Gagal memuat cerita tersimpan dari IndexedDB:', error);
      this.view.showErrorMessage('Gagal memuat cerita tersimpan. Cek konsol untuk detail.');
    } finally {
      this.view.hideLoading();
    }
  }

  /**
   * Menghapus cerita dari IndexedDB kemudian memperbarui tampilan.
   * @param {string} storyId - ID cerita yang akan dihapus.
   */
  handleDeleteFavorite = async (storyId) => {
    if (!storyId) return;

    try {
      await IndexedDBService.deleteFavoriteStory(storyId);
      showToast('Cerita berhasil dihapus dari daftar favorite!', 'success');

      await this.loadFavoriteStories();

    } catch (error) {
      console.error('❌ Gagal menghapus cerita dari IndexedDB:', error);
      showToast('Gagal menghapus cerita favorite.', 'error');
    }
  }
}

export default FavoritePresenter;