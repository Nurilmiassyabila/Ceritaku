import './styles/main.css';
import Router from './utils/router.js';
import ApiService from './services/api-service.js';

import LoginView from './views/login-view.js';
import RegisterView from './views/register-view.js';
import HomeView from './views/home-view.js';
import AddStoryView from './views/add-story-view.js';
import NotFoundView from './views/404-view.js';
import FavoriteView from './views/favorite-view.js'; 

import LoginPresenter from './presenters/login-presenter.js';
import RegisterPresenter from './presenters/register-presenter.js';
import HomePresenter from './presenters/home-presenter.js';
import AddStoryPresenter from './presenters/add-story-presenter.js';
import FavoritePresenter from './presenters/favorite-presenter.js';

document.addEventListener('DOMContentLoaded', async () => {
  Router.addRoute('/', () => {
    if (ApiService.isAuthenticated()) {
      Router.navigate('/home');
    } else {
      Router.navigate('/login');
    }
  });

  Router.addRoute('/login', async () => {
    const view = new LoginView();
    const presenter = new LoginPresenter(view);
    await presenter.init();
  });

  Router.addRoute('/register', async () => {
    const view = new RegisterView();
    const presenter = new RegisterPresenter(view);
    await presenter.init();
  });

  Router.addRoute('/home', async () => {
    const view = new HomeView();
    const presenter = new HomePresenter(view);
    await presenter.init();
  });

  Router.addRoute('/add', async () => {
    const view = new AddStoryView();
    const presenter = new AddStoryPresenter(view);
    await presenter.init();
  });

  Router.addRoute('/favorites', async () => {
    if (!ApiService.isAuthenticated()) {
      Router.navigate('/login');
      return;
    }
    const view = new FavoriteView();
    const presenter = new FavoritePresenter(view);
    await presenter.init();
  });

  Router.addRoute('/404', async () => {
    const view = new NotFoundView();
    view.render();
  });

  Router.handleRoute();

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.bundle.js');
      console.log('✅ Service worker berhasil didaftarkan:', registration);

      // Store token in IndexedDB for SW access
      if (ApiService.isAuthenticated()) {
        const token = localStorage.getItem('token');
        if (token) {
          const { openDB } = await import('idb');
          const db = await openDB('CeritaKuDB', 1);
          await db.put('tokens', { key: 'authToken', value: token });
          db.close();
        }
      }

      if (!registration.active) {
        await new Promise(resolve => {
          registration.addEventListener('updatefound', () => {
            const newSW = registration.installing;
            newSW.addEventListener('statechange', () => {
              if (newSW.state === 'activated') resolve();
            });
          });
        });
      }

    } catch (error) {
      console.error('❌ Gagal mendaftarkan service worker:', error);
    }
  } else {
    console.log('Service Worker tidak didukung di browser ini.');
  }
});