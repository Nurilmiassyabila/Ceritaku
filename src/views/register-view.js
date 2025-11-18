class RegisterView {
  render() {
    const main = document.querySelector('main');
    if (!main) return;

    main.innerHTML = `
      <section class="auth-section fade-in" aria-labelledby="register-heading">
        <h2 id="register-heading">Daftar Akun CeritaKu</h2>
        <form id="register-form" class="auth-form" aria-describedby="register-desc">
          <p id="register-desc" class="visually-hidden">
            Lengkapi nama, email, dan password untuk membuat akun CeritaKu.
          </p>

          <label for="name" class="visually-hidden">Nama Lengkap</label>
          <input type="text" id="name" placeholder="Nama Lengkap" required aria-label="Nama Lengkap" />

          <label for="email" class="visually-hidden">Email</label>
          <input type="email" id="email" placeholder="Email" required aria-label="Email" />

          <label for="password" class="visually-hidden">Password</label>
          <input type="password" id="password" placeholder="Password" required aria-label="Password" />

          <button type="submit" class="btn-primary">Daftar</button>
        </form>
        <p>Sudah punya akun? <a href="#/login">Masuk</a></p>
      </section>
    `;

    const nameInput = main.querySelector('#name');
    if (nameInput) nameInput.focus();
  }
}

export default RegisterView;