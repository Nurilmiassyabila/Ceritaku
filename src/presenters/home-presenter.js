import HomeView from "../views/home-view.js";
import router from '../utils/router.js';
import ApiService from '../services/api-service.js';
import IndexedDBService from '../services/indexed-db-service.js';
import { showToast } from '../utils/utils.js';
import { PushNotificationService } from '../utils/push-notification-service.js';

class HomePresenter {
  constructor() {
    this.view = new HomeView();
  }

  async init() {
    const main = document.querySelector('#main-content');
    if (main) main.style.opacity = '0';

    this.view.render();

    const result = await ApiService.getStories();

    if (!result || !result.success) {
      showToast(result?.message || 'Gagal memuat cerita', 'error');

      this.view.renderStories([]);
      this.view.initMap([]);
      this._bindUI();
      this._afterRenderAccessibility();

      return { view: this.view };
    }

    // Normalisasi data
    const stories = (result.list || []).map(s => {
      const lat = s.lat ?? s.location?.lat ?? s.location?.latitude ?? null;
      const lon = s.lon ?? s.location?.lon ?? s.location?.longitude ?? s.location?.lng ?? null;

      return {
        id: s.id || s._id || s.storyId || '',
        name: s.name || s.title || '',
        description: s.description || s.story || '',
        photoUrl: s.photoUrl || s.photo || s.image || '',
        lat: lat ? Number(lat) : null,
        lon: lon ? Number(lon) : null,
        createdAt: s.createdAt || s.created_at || s.created || ''
      };
    });

    this.view.renderStories(stories);
    this.view.initMap(stories);

    this._bindUI(stories);

    // Push notification setup (AMANKAN ERROR)
    try {
      await this._setupPushNotifications();
    } catch (e) {
      console.warn("Push notification setup error:", e);
    }

    this._afterRenderAccessibility();

    if (main) {
      setTimeout(() => {
        main.style.transition = 'opacity 0.3s ease-in-out';
        main.style.opacity = '1';
      }, 100);
    }

    return { view: this.view };
  }

  _bindUI(stories = []) {
    const addBtn = document.getElementById('add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => router.navigate('/add'));
    }

    this.view.bindCardClick((id) => {
      console.log('Kartu dengan ID:', id);
    });

    this.view.bindFavoriteClick(
      async (storyId) => {
        const story = stories.find(s => s.id === storyId);
        if (!story) return;

        try {
          await IndexedDBService.saveFavoriteStory(story);
          showToast('Cerita berhasil disimpan ke favorite!', 'success');
        } catch (error) {
          console.error('❌ Gagal menyimpan cerita ke favorite:', error);
          showToast('Gagal menyimpan cerita ke favorite.', 'error');
        }
      },
      null
    );
  }

  async _setupPushNotifications() {
    const subscribeBtn = document.getElementById('push-subscribe-btn');
    const unsubscribeBtn = document.getElementById('push-unsubscribe-btn');

    if (!subscribeBtn || !unsubscribeBtn) return;

    // Sembunyikan awal agar tidak flash
    subscribeBtn.style.display = 'none';
    unsubscribeBtn.style.display = 'none';

    if (!PushNotificationService.isSupported()) return;

    const isSubscribed = await PushNotificationService.isSubscribed();
    this._updatePushButtonState(isSubscribed);

    subscribeBtn.addEventListener('click', async () => {
      try {
        subscribeBtn.disabled = true;
        subscribeBtn.textContent = 'Memproses...';

        await PushNotificationService.subscribe();
        this._updatePushButtonState(true);
        showToast('Berhasil berlangganan notifikasi!', 'success');
      } catch (error) {
        showToast(error.message || 'Gagal berlangganan notifikasi', 'error');
      } finally {
        subscribeBtn.disabled = false;
        subscribeBtn.textContent = '🔔 Berlangganan Notifikasi';
      }
    });

    unsubscribeBtn.addEventListener('click', async () => {
      try {
        unsubscribeBtn.disabled = true;
        unsubscribeBtn.textContent = 'Memproses...';

        await PushNotificationService.unsubscribe();
        this._updatePushButtonState(false);
        showToast('Berhasil berhenti berlangganan notifikasi', 'success');
      } catch (error) {
        showToast(error.message || 'Gagal berhenti berlangganan', 'error');
      } finally {
        unsubscribeBtn.disabled = false;
        unsubscribeBtn.textContent = '🔕 Berhenti Berlangganan';
      }
    });
  }

  _updatePushButtonState(isSubscribed) {
    const subscribeBtn = document.getElementById('push-subscribe-btn');
    const unsubscribeBtn = document.getElementById('push-unsubscribe-btn');

    if (!subscribeBtn || !unsubscribeBtn) return;

    subscribeBtn.style.display = isSubscribed ? 'none' : 'inline-block';
    unsubscribeBtn.style.display = isSubscribed ? 'inline-block' : 'none';
  }

  _afterRenderAccessibility() {
    const mainContent = document.querySelector('#main-content');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus({ preventScroll: false });
      mainContent.setAttribute('aria-live', 'polite');
      mainContent.setAttribute('role', 'main');
    }
  }
}

export default HomePresenter;