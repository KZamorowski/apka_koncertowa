/**
 * main.js
 * Punkt wejścia aplikacji — spina wszystkie moduły po załadowaniu DOM.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.calendar.init();
  App.auth.checkAuth();

  document.getElementById('addTourForm').addEventListener('submit', (e) => {
    e.preventDefault();
    App.state.pendingBulkEvents.push({
      artist: document.getElementById('tour_artist').value,
      name: document.getElementById('tour_name').value,
      city: document.getElementById('tour_city').value,
      place: document.getElementById('tour_place').value,
      max_attendance: parseInt(document.getElementById('tour_max').value, 10),
      date: document.getElementById('tour_date').value,
    });

    App.events.renderTourPending();
    document.getElementById('tour_city').value = '';
    document.getElementById('tour_place').value = '';
    document.getElementById('tour_max').value = '';
    document.getElementById('tour_date').value = '';
    document.getElementById('tour_city').focus();
  });

  // Menu boczne na urządzeniach mobilnych
  const menuBtn = document.getElementById('mobileMenuBtn');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (menuBtn) menuBtn.addEventListener('click', App.nav.toggleMobileSidebar);
  if (backdrop) backdrop.addEventListener('click', App.nav.closeMobileSidebar);
});
