class Router {
  constructor() {
    this.routes = {};
    this.currentView = null;

    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('DOMContentLoaded', () => this.handleRoute());
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    window.location.hash = `#${path}`;
  }

  async handleRoute() {
    const path = window.location.hash.replace('#', '') || '/';
    const routeHandler = this.routes[path];

    const mainContent = document.querySelector('#main-content');
    if (!mainContent) {
      console.error('Elemen #main-content tidak ditemukan di index.html');
      return;
    }

    if (this.currentView && typeof this.currentView.destroy === 'function') {
      try {
        this.currentView.destroy();
      } catch (err) {
        console.warn('Gagal membersihkan view sebelumnya:', err);
      }
    }

    mainContent.innerHTML = '<p>Memuat halaman...</p>';

    if (routeHandler) {
      if (typeof document.startViewTransition === 'function') {
        try {
          await document.startViewTransition(async () => {
            const result = await routeHandler();
            if (result && result.view) {
              this.currentView = result.view;
            } else {
              this.currentView = null;
            }
          });
          requestAnimationFrame(() => {
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus({ preventScroll: false });
          });
        } catch (err) {
          console.error('Gagal memuat route (startViewTransition):', err);
          mainContent.innerHTML = `<p class="error">Terjadi kesalahan saat memuat halaman.</p>`;
        }
      } else {
        try {
          mainContent.classList.add('fade-out');
          await new Promise((r) => setTimeout(r, 180));

          const result = await routeHandler();
          if (result && result.view) {
            this.currentView = result.view;
          } else {
            this.currentView = null;
          }

          mainContent.classList.remove('fade-out');
          mainContent.classList.add('fade-in');
          setTimeout(() => mainContent.classList.remove('fade-in'), 320);

          requestAnimationFrame(() => {
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus({ preventScroll: false });
          });
        } catch (err) {
          console.error('Gagal memuat route (fallback):', err);
          mainContent.innerHTML = `<p class="error">Terjadi kesalahan saat memuat halaman.</p>`;
        }
      }
    } else {
      // route tidak ditemukan -> tampilkan 404
      mainContent.innerHTML = `
        <section class="not-found">
          <h2>404 - Halaman Tidak Ditemukan</h2>
          <p>Halaman yang Anda cari tidak tersedia.</p>
          <button id="back-home">Kembali ke Beranda</button>
        </section>
      `;

      const btn = document.querySelector('#back-home');
      if (btn) btn.addEventListener('click', () => this.navigate('/home'));

      mainContent.classList.remove('fade-out');
      mainContent.classList.add('fade-in');
      setTimeout(() => mainContent.classList.remove('fade-in'), 320);
    }
  }
}

export default new Router();