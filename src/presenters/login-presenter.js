import ApiService from '../services/api-service.js';
import Router from '../utils/router.js';
import { showToast } from '../utils/utils.js';

class LoginPresenter {
  constructor(view) {
    this.view = view;
  }

  async init() {
    this.view.render();

    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      const result = await ApiService.login({ email, password });

      if (result.success) {
        showToast('Login berhasil!', 'success');
        Router.navigate('/home');
      } else {
        showToast(result.message, 'error');
      }
    });
  }
}

export default LoginPresenter;