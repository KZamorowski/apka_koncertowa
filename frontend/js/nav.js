/**
 * nav.js
 * Przełączanie widoków w aplikacji jednostronicowej (SPA) oraz
 * obsługa chowanego menu bocznego na urządzeniach mobilnych.
 */

App.nav.switchView = function switchView(viewId, navElement) {
  document.querySelectorAll('.sidebar .nav-link').forEach((link) => link.classList.remove('active'));
  if (navElement) navElement.classList.add('active');

  document.querySelectorAll('.view-section').forEach((section) => section.classList.remove('active'));
  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.add('active');

  if (viewId === 'kalendarzView' && App.state.calendar) {
    setTimeout(() => App.state.calendar.updateSize(), 50);
  }

  App.nav.closeMobileSidebar();
};

App.nav.openMobileSidebar = function openMobileSidebar() {
  document.querySelector('.sidebar').classList.add('is-open');
  document.body.classList.add('sidebar-open');
};

App.nav.closeMobileSidebar = function closeMobileSidebar() {
  document.querySelector('.sidebar').classList.remove('is-open');
  document.body.classList.remove('sidebar-open');
};

App.nav.toggleMobileSidebar = function toggleMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar.classList.contains('is-open')) {
    App.nav.closeMobileSidebar();
  } else {
    App.nav.openMobileSidebar();
  }
};
