export async function subscribePushNotification(subscription) {
    try {
      const response = await fetch('http://localhost:4000/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
  
      if (response.ok) {
        console.log('✅ Berhasil mengirim langganan ke server');
      } else {
        console.error('❌ Gagal mengirim langganan ke server');
      }
    } catch (error) {
      console.error('❌ Terjadi kesalahan saat mengirim langganan:', error);
    }
  }