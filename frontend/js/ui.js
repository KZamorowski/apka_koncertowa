/**
 * ui.js
 * Drobne, wielokrotnego użytku pomoce interfejsu: powiadomienia (toasty),
 * stan ładowania przycisków oraz gotowe znaczniki dla stanów
 * pustych / błędów / ładowania w tabelach.
 */

App.ui.notify = function notify(message, variant = 'primary') {
  const container = document.getElementById('toastContainer');
  if (!container) {
    // Zapasowo, gdyby kontener nie istniał
    window.alert(message);
    return;
  }

  const icons = {
    success: 'bi-check-circle-fill',
    danger: 'bi-exclamation-octagon-fill',
    primary: 'bi-info-circle-fill',
  };

  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${variant} border-0`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body"><i class="bi ${icons[variant] || icons.primary} me-2"></i>${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  container.appendChild(toast);

  const bsToast = new bootstrap.Toast(toast, { delay: 4000 });
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
  bsToast.show();
};

App.ui.setButtonLoading = function setButtonLoading(button, isLoading, loadingText) {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${loadingText || 'Proszę czekać…'}`;
  } else {
    button.disabled = false;
    if (button.dataset.originalText) {
      button.innerHTML = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  }
};

App.ui.loadingRow = function loadingRow(colspan, label = 'Ładowanie…') {
  return `<tr><td colspan="${colspan}">
    <div class="state-message"><span class="spinner-border spinner-border-sm text-primary"></span><div class="mt-2">${label}</div></div>
  </td></tr>`;
};

App.ui.emptyRow = function emptyRow(colspan, { icon = 'bi-inbox', title = 'Brak danych', hint = '' } = {}) {
  return `<tr><td colspan="${colspan}">
    <div class="state-message"><i class="bi ${icon}"></i><div class="fw-medium">${title}</div>${hint ? `<div class="small">${hint}</div>` : ''}</div>
  </td></tr>`;
};

App.ui.errorRow = function errorRow(colspan, message = 'Wystąpił błąd podczas pobierania danych.') {
  return `<tr><td colspan="${colspan}">
    <div class="state-message is-error"><i class="bi bi-exclamation-triangle"></i>${message}</div>
  </td></tr>`;
};

// Zabezpiecza dane pochodzące z API przed wstrzyknięciem znaczników HTML
App.ui.escapeHtml = function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value ?? '';
  return div.innerHTML;
};

// Bezpiecznie wstawia tekst do atrybutu onclick="...('tekst')"
App.ui.escapeAttr = function escapeAttr(value) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
};
