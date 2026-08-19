/**
 * auth.js
 * Logowanie, rejestracja, wylogowanie oraz sprawdzanie stanu sesji.
 */

App.auth.checkAuth = function checkAuth() {
  const token = localStorage.getItem('token');
  const loginContainer = document.getElementById('login-container');
  const appContainer = document.getElementById('app-container');

  if (token) {
    loginContainer.classList.add('d-none');
    appContainer.classList.remove('d-none');
    appContainer.classList.add('d-flex');
    App.events.loadEvents();
  } else {
    loginContainer.classList.remove('d-none');
    appContainer.classList.add('d-none');
    appContainer.classList.remove('d-flex');
  }
};

App.auth.toggleAuthMode = function toggleAuthMode() {
  document.getElementById('login-form-card').classList.toggle('d-none');
  document.getElementById('register-form-card').classList.toggle('d-none');
};

App.auth.handleLogin = async function handleLogin(event) {
  event.preventDefault();
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const formData = new FormData();
  formData.append('username', document.getElementById('login_user').value);
  formData.append('password', document.getElementById('login_pass').value);

  App.ui.setButtonLoading(submitBtn, true, 'Logowanie…');
  try {
    const res = await fetch(`${App.config.MAIN_API_URL}/login`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      document.getElementById('login_pass').value = '';
      App.auth.checkAuth();
    } else {
      App.ui.notify('Błędny login lub hasło.', 'danger');
    }
  } catch (err) {
    App.ui.notify('Błąd połączenia z serwerem.', 'danger');
  } finally {
    App.ui.setButtonLoading(submitBtn, false);
  }
};

App.auth.handleRegister = async function handleRegister(event) {
  event.preventDefault();
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const payload = {
    username: document.getElementById('reg_user').value,
    password: document.getElementById('reg_pass').value,
  };

  App.ui.setButtonLoading(submitBtn, true, 'Tworzenie konta…');
  try {
    const res = await fetch(`${App.config.MAIN_API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      App.ui.notify('Konto utworzone pomyślnie. Możesz się teraz zalogować.', 'success');
      App.auth.toggleAuthMode();
      document.getElementById('reg_pass').value = '';
    } else {
      const errorData = await res.json().catch(() => ({}));
      App.ui.notify(errorData.detail || 'Błąd rejestracji.', 'danger');
    }
  } catch (err) {
    App.ui.notify('Błąd połączenia z serwerem.', 'danger');
  } finally {
    App.ui.setButtonLoading(submitBtn, false);
  }
};

App.auth.logout = function logout() {
  localStorage.removeItem('token');
  App.auth.checkAuth();
};
