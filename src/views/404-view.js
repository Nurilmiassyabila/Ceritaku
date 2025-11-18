class NotFoundView {
    render() {
      const main = document.querySelector('main');
      main.innerHTML = `
        <section class="not-found">
          <h1>404 - Halaman Tidak Ditemukan</h1>
          <p>Maaf, halaman yang kamu cari tidak tersedia.</p>
          <button class="btn-primary" id="back-home">Kembali ke Beranda</button>
        </section>
      `;
  
      document.getElementById('back-home').addEventListener('click', () => {
        window.location.hash = '/home';
      });
    }
  }
  
  export default NotFoundView;