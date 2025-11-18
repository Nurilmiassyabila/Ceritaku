class LoginView {
  render() {
    const main = document.querySelector('main');
    if (!main) return;

    main.innerHTML = `
      <section class="auth-section fade-in" aria-labelledby="login-heading">
        <h2 id="login-heading">Masuk ke CeritaKu</h2>
        <form id="login-form" class="auth-form" aria-describedby="login-desc">
          <p id="login-desc" class="visually-hidden">Masukkan email dan kata sandi Anda untuk masuk ke aplikasi CeritaKu</p>
          
          <label for="email" class="visually-hidden">Email</label>
          <input 
            type="email" 
            id="email" 
            placeholder="Email" 
            required 
            autocomplete="username"
            aria-label="Masukkan email Anda"
          />

          <label for="password" class="visually-hidden">Kata Sandi</label>
          <input 
            type="password" 
            id="password" 
            placeholder="Password" 
            required 
            autocomplete="current-password"
            aria-label="Masukkan kata sandi Anda"
          />

          <button type="submit" class="btn-primary">Masuk</button>
        </form>
        <p>Belum punya akun? <a href="#/register">Daftar</a></p>
        <div id="login-message" class="visually-hidden" aria-live="polite"></div>
      </section>
    `;

    const emailInput = main.querySelector('#email');
    if (emailInput) emailInput.focus();
  }
}

export default LoginView;