/**
 * api.js
 * Cienka warstwa nad `fetch`, która automatycznie dokłada token JWT
 * i przekierowuje do ekranu logowania przy wygaśnięciu sesji (401).
 */
App.api.fetch = async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  if (!options.headers) options.headers = {};
  if (token) options.headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, options);
  if (response.status === 401) {
    App.auth.logout();
  }
  return response;
};
