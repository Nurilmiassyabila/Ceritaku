import ApiService from '../services/api-service.js';
import Router from '../utils/router.js';
import { showToast } from '../utils/utils.js';

class RegisterPresenter {
  constructor(view) {
    this.view = view;
  }

  async init() {
    this.view.render();

    const form = document.getElementById('register-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      const result = ApiService.register({ name, email, password });

      if (result.success) {
        showToast('Registrasi berhasil! Silakan login.', 'success');
        Router.navigate('/login');
      } else {
        showToast(result.message, 'error');
      }
    });
  }
}

export default RegisterPresenter;