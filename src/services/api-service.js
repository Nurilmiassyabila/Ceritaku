const API_ENDPOINT = 'https://story-api.dicoding.dev/v1'; // Endpoint API

class ApiService {

  // 🔐 Cek apakah token ada
  static isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // 🧍 Ambil nama user
  static getCurrentUser() {
    return localStorage.getItem('user');
  }

  // 📝 Registrasi
  static async register({ name, email, password }) {
    try {
      const response = await fetch(`${API_ENDPOINT}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message };
      }

      return { success: true, message: 'Registrasi berhasil' };
    } catch (error) {
      return { success: false, message: 'Koneksi gagal. Coba lagi.' };
    }
  }

  // 🔑 Login (VERSI UPDATE)
  static async login({ email, password }) {
    try {
      const response = await fetch(`${API_ENDPOINT}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message };
      }

      // 📌 Simpan token + nama user
      const token = data.loginResult.token;
      const name = data.loginResult.name;

      localStorage.setItem('token', token);
      localStorage.setItem('user', name);

      return { success: true, user: data.loginResult };
    } catch (error) {
      return { success: false, message: 'Terjadi kesalahan koneksi' };
    }
  }

  // 🚪 Logout
  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // 📖 Ambil semua stories
  static async getStories() {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, message: 'Token tidak ditemukan' };

    try {
      const response = await fetch(`${API_ENDPOINT}/stories`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Gagal memuat cerita' };
      }

      return { success: true, list: data.listStory || [] };
    } catch (error) {
      console.error('Error fetching stories:', error);
      return { success: false, message: 'Terjadi kesalahan koneksi' };
    }
  }

  // ➕ Tambah Story
  static async addStory({ description, photo, lat, lon }) {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, message: 'Token tidak ditemukan' };

    const formData = new FormData();
    formData.append('description', description);
    if (photo) formData.append('photo', photo);
    if (lat) formData.append('lat', lat);
    if (lon) formData.append('lon', lon);

    try {
      const response = await fetch(`${API_ENDPOINT}/stories`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: 'Gagal menambahkan cerita' };
    }
  }

  // 📤 Kirim story hasil offline sync
  static async addStoryFromOffline({ description, photoBase64, lat, lon }) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token tidak ditemukan');

    const formData = new FormData();
    formData.append('description', description);

    if (photoBase64) {
      const res = await fetch(photoBase64);
      const photoBlob = await res.blob();
      formData.append('photo', photoBlob, 'offline-upload.jpg');
    }

    if (lat) formData.append('lat', lat);
    if (lon) formData.append('lon', lon);

    const response = await fetch(`${API_ENDPOINT}/stories`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Gagal menambahkan cerita dari sync');
    }

    return { success: true };
  }

  // 🔔 Push Notification (VERSI UPDATE)
  static async subscribePushNotification(subscription) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan');
    }

    try {
      const response = await fetch(`${API_ENDPOINT}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Gagal mendaftarkan notifikasi');
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Gagal mengirim subscription ke API:', error);
      throw error;
    }
  }

  // 🗑 Delete Story
  static async deleteStory(storyId) {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, message: 'Token tidak ditemukan' };

    try {
      const response = await fetch(`${API_ENDPOINT}/stories/${storyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Gagal menghapus cerita.' };
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Error saat menghapus cerita:', error);
      return { success: false, message: 'Gagal menghubungi server. Coba lagi.' };
    }
  }

  // ⭐ Favorite
  static async addFavorite(storyId) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favorites.includes(storyId)) favorites.push(storyId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  static async removeFavorite(storyId) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    favorites = favorites.filter(id => id !== storyId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  static getAllFavorites() {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  }
}

export default ApiService;