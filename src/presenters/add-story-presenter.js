import AddStoryView from "../views/add-story-view.js";
import ApiService from '../services/api-service.js';
import IndexedDBService from '../services/indexed-db-service.js';
import { showToast } from '../utils/utils.js';
import Router from '../utils/router.js';

class AddStoryPresenter {
  constructor(view) {
    this.view = view;
  }

  async init() {
    this.view.render();
    this._bindUI();
  }

  _bindUI() {
    const form = document.getElementById('add-story-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const description = form.querySelector('#description').value.trim();
      
      // Get photo from localStorage (captured/uploaded) or file input
      let photo = null;
      const photoBase64 = localStorage.getItem('lastCapturedPhoto');
      const uploadInput = form.querySelector('#upload-file');
      
      if (photoBase64) {
        // Convert base64 to blob for FormData
        const response = await fetch(photoBase64);
        photo = await response.blob();
      } else if (uploadInput && uploadInput.files[0]) {
        photo = uploadInput.files[0];
      }
      
      // Get location from localStorage (selected from map)
      let lat = null;
      let lon = null;
      const selectedLocation = localStorage.getItem('selectedLocation');
      if (selectedLocation) {
        try {
          const location = JSON.parse(selectedLocation);
          lat = location.lat;
          lon = location.lng || location.lon;
        } catch (e) {
          console.error('Error parsing location:', e);
        }
      }

      if (!description) {
        showToast('Deskripsi tidak boleh kosong', 'error');
        return;
      }

      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Menyimpan...';
      }

      try {
        let result;

        if (navigator.onLine) {
          result = await ApiService.addStory({ description, photo, lat, lon });
          if (!result.success) throw new Error(result.message);
          showToast('Cerita berhasil ditambahkan!', 'success');
        } else {
          // Offline: simpan sementara di IndexedDB
          const photoBase64ForOffline = photoBase64 || (photo ? await this._convertFileToBase64(photo) : null);
          await IndexedDBService.createOfflineStory({ 
            id: `offline-${Date.now()}`, 
            description, 
            photoBase64: photoBase64ForOffline, 
            lat, 
            lon, 
            createdAt: Date.now() 
          });
          showToast('Sedang offline. Cerita disimpan sementara untuk disinkronkan nanti.', 'info');
        }

        // Clear localStorage
        localStorage.removeItem('lastCapturedPhoto');
        localStorage.removeItem('selectedLocation');
        
        form.reset();
        Router.navigate('/home');

      } catch (error) {
        console.error('❌ Gagal menambahkan cerita:', error);
        showToast(error.message || 'Gagal menambahkan cerita', 'error');
      } finally {
        // Restore button state
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }

  async _convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
}

export default AddStoryPresenter;