import ApiService from '../services/api-service.js';

const DICODING_VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const PushNotificationService = {
  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  },

  async isSubscribed() {
    if (!this.isSupported()) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return Boolean(subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  },

  async subscribe() {
    if (!this.isSupported()) {
      throw new Error('Push notification tidak didukung di browser ini');
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        return subscription;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Izin notifikasi ditolak');
      }

      const convertedKey = urlBase64ToUint8Array(DICODING_VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      // --- FIX: Hapus expirationTime sebelum mengirim ke API ---
      const data = subscription.toJSON();
      delete data.expirationTime;
      // ----------------------------------------------------------

      await ApiService.subscribePushNotification(data);

      return subscription;
    } catch (error) {
      console.error('❌ Gagal subscribe push notification:', error);
      throw error;
    }
  },

  async unsubscribe() {
    if (!this.isSupported()) {
      throw new Error('Push notification tidak didukung di browser ini');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Gagal unsubscribe push notification:', error);
      throw error;
    }
  }
};