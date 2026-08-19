/**
 * events.js
 * Ładowanie i renderowanie koncertów (dashboard + widok "Koncerty"),
 * wyszukiwanie, statystyki oraz operacje CRUD, w tym dodawanie tras
 * koncertowych (wiele koncertów naraz).
 */

// --- ŁADOWANIE GŁÓWNYCH DANYCH ---------------------------------------------

App.events.loadEvents = async function loadEvents() {
  const dashBody = document.getElementById('dashboardEventsTableBody');
  const konBody = document.getElementById('koncertyEventsTableBody');
  dashBody.innerHTML = App.ui.loadingRow(4);
  konBody.innerHTML = App.ui.loadingRow(5);

  let eventsList = [];
  try {
    const response = await App.api.fetch(App.config.API_URL);
    eventsList = await response.json();
    if (!Array.isArray(eventsList)) eventsList = [];
  } catch (error) {
    dashBody.innerHTML = App.ui.errorRow(4);
    konBody.innerHTML = App.ui.errorRow(5);
    App.ui.notify('Nie udało się pobrać listy koncertów.', 'danger');
    return;
  }

  eventsList.sort((a, b) => new Date(a.date) - new Date(b.date));

  let allAttendees = [];
  try {
    const attRes = await App.api.fetch(`${App.config.ATTENDEES_API_URL}attendees/`);
    if (attRes.ok) allAttendees = await attRes.json();
  } catch (e) { /* Statystyki uczestników są opcjonalne, aplikacja działa bez nich */ }

  const attendeeCounts = {};
  allAttendees.forEach((a) => { attendeeCounts[a.event_id] = (attendeeCounts[a.event_id] || 0) + 1; });
  eventsList.forEach((e) => { e.current_attendance = attendeeCounts[e.id] || 0; });

  App.state.eventsList = eventsList;

  App.events.renderStats(eventsList, allAttendees);
  App.events.renderDashboardTable(eventsList.slice(0, 5));
  App.events.renderKoncertyTable(eventsList);
  App.calendar.updateEvents(eventsList);
};

// --- KARTY STATYSTYK ---------------------------------------------------------

App.events.renderStats = function renderStats(eventsList, allAttendees) {
  const now = new Date();
  const upcoming = eventsList.filter((e) => new Date(e.date) >= now).length;

  const withCapacity = eventsList.filter((e) => e.max_attendance > 0);
  const avgAttendance = withCapacity.length
    ? Math.round(
        withCapacity.reduce((sum, e) => sum + (e.current_attendance / e.max_attendance) * 100, 0)
        / withCapacity.length
      )
    : 0;

  document.getElementById('totalConcertsCount').innerText = eventsList.length;
  document.getElementById('totalAttendeesCount').innerText = allAttendees.length;
  document.getElementById('upcomingConcertsCount').innerText = upcoming;
  document.getElementById('avgAttendanceRate').innerText = `${avgAttendance}%`;
};

// --- RENDEROWANIE TABEL -------------------------------------------------------

App.events.renderDashboardTable = function renderDashboardTable(eventsToRender) {
  const dashTbody = document.getElementById('dashboardEventsTableBody');

  if (eventsToRender.length === 0) {
    dashTbody.innerHTML = App.ui.emptyRow(4, {
      icon: 'bi-calendar-x',
      title: 'Brak zaplanowanych koncertów',
      hint: 'Dodaj pierwszy koncert w zakładce „Koncerty”.',
    });
    return;
  }

  dashTbody.innerHTML = eventsToRender.map((event) => {
    const dateObj = new Date(event.date);
    const dateStr = dateObj.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    const artist = App.ui.escapeHtml(event.artist);
    const name = App.ui.escapeHtml(event.name);
    const city = App.ui.escapeHtml(event.city);
    const place = App.ui.escapeHtml(event.place);

    return `<tr>
      <td><div class="fw-bold">${artist}</div><div class="text-muted small">${name}</div></td>
      <td><div class="fw-medium"><i class="bi bi-calendar2-event text-muted me-1"></i>${dateStr}</div><div class="text-muted small"><i class="bi bi-clock text-muted me-1"></i>${timeStr}</div></td>
      <td><div class="fw-medium text-dark"><i class="bi bi-geo-alt text-muted me-1"></i>${city}</div><div class="text-muted small">${place}</div></td>
      <td class="text-center fw-medium">${event.max_attendance}</td>
    </tr>`;
  }).join('');
};

App.events.renderKoncertyTable = function renderKoncertyTable(eventsToRender) {
  const konTbody = document.getElementById('koncertyEventsTableBody');

  if (eventsToRender.length === 0) {
    konTbody.innerHTML = App.ui.emptyRow(5, {
      icon: 'bi-search',
      title: 'Nie znaleziono koncertów',
      hint: 'Zmień kryteria wyszukiwania lub dodaj nowy koncert.',
    });
    return;
  }

  konTbody.innerHTML = eventsToRender.map((event) => {
    const dateObj = new Date(event.date);
    const dateStr = dateObj.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    const artist = App.ui.escapeHtml(event.artist);
    const name = App.ui.escapeHtml(event.name);
    const city = App.ui.escapeHtml(event.city);
    const place = App.ui.escapeHtml(event.place);
    const safeEventName = App.ui.escapeAttr(event.name);

    return `<tr>
      <td>
        <div class="d-flex align-items-center gap-3">
          <div class="event-thumb" style="background-image: url('https://placehold.co/42x42/17172b/FFF?text=${encodeURIComponent(event.artist.slice(0, 2).toUpperCase())}')"></div>
          <div><div class="fw-bold text-dark">${artist}</div><div class="text-muted small">${name}</div></div>
        </div>
      </td>
      <td><div class="text-dark small"><i class="bi bi-calendar2-event text-muted me-1"></i>${dateStr}, ${timeStr}</div></td>
      <td><div class="text-dark small"><i class="bi bi-geo-alt text-muted me-1"></i>${place}, ${city}</div></td>
      <td class="text-center">
        <button class="btn btn-sm attendance-pill bg-white px-3" onclick="App.attendees.open(${event.id}, '${safeEventName}')" title="Zobacz listę uczestników">
          ${event.current_attendance} <span class="text-muted fw-normal">/ ${event.max_attendance}</span>
        </button>
      </td>
      <td class="text-end">
        <button class="action-icon edit" onclick="App.events.openEditModal(${event.id})" title="Edytuj koncert" aria-label="Edytuj koncert"><i class="bi bi-pencil"></i></button>
        <button class="action-icon delete" onclick="App.events.deleteEvent(${event.id})" title="Usuń koncert" aria-label="Usuń koncert"><i class="bi bi-trash3"></i></button>
      </td>
    </tr>`;
  }).join('');
};

App.events.filterKoncerty = function filterKoncerty() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  const filtered = App.state.eventsList.filter((ev) =>
    ev.artist.toLowerCase().includes(query)
    || ev.name.toLowerCase().includes(query)
    || ev.city.toLowerCase().includes(query)
    || ev.place.toLowerCase().includes(query)
  );
  App.events.renderKoncertyTable(filtered);
};

// --- DODAWANIE POJEDYNCZEGO KONCERTU -----------------------------------------

App.events.submitSingleEvent = async function submitSingleEvent() {
  const form = document.getElementById('addSingleForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const submitBtn = document.getElementById('submitSingleBtn');
  const newEvent = {
    artist: document.getElementById('single_artist').value,
    name: document.getElementById('single_name').value,
    city: document.getElementById('single_city').value,
    place: document.getElementById('single_place').value,
    max_attendance: parseInt(document.getElementById('single_max_attendance').value, 10),
    date: document.getElementById('single_date').value,
  };

  App.ui.setButtonLoading(submitBtn, true, 'Dodawanie…');
  try {
    await App.api.fetch(App.config.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    });
    form.reset();
    bootstrap.Modal.getInstance(document.getElementById('addSingleModal')).hide();
    App.ui.notify('Koncert został dodany.', 'success');
    App.events.loadEvents();
  } catch (err) {
    App.ui.notify('Nie udało się dodać koncertu.', 'danger');
  } finally {
    App.ui.setButtonLoading(submitBtn, false);
  }
};

// --- TRASA KONCERTOWA (WIELE KONCERTÓW) --------------------------------------

App.events.renderTourPending = function renderTourPending() {
  const list = document.getElementById('tourPendingList');
  const submitBtn = document.getElementById('submitTourBtn');
  const emptyMsg = document.getElementById('emptyTourMsg');
  const pending = App.state.pendingBulkEvents;

  document.getElementById('tour_artist').disabled = pending.length > 0;
  document.getElementById('tour_name').disabled = pending.length > 0;

  Array.from(list.querySelectorAll('.tour-item')).forEach((el) => el.remove());

  if (pending.length === 0) {
    emptyMsg.style.display = 'block';
    submitBtn.disabled = true;
    return;
  }

  emptyMsg.style.display = 'none';
  submitBtn.disabled = false;

  list.insertAdjacentHTML('beforeend', pending.map((ev, index) => {
    const city = App.ui.escapeHtml(ev.city);
    const place = App.ui.escapeHtml(ev.place);
    return `<li class="list-group-item bg-white mb-2 rounded shadow-sm d-flex justify-content-between align-items-center tour-item">
      <div>
        <div class="fw-bold">${city} <span class="text-muted fw-normal">(${place})</span></div>
        <div class="small text-muted">${new Date(ev.date).toLocaleString('pl-PL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
      </div>
      <button class="btn btn-sm btn-outline-danger border-0" onclick="App.events.removeTourItem(${index})" aria-label="Usuń przystanek"><i class="bi bi-x-lg"></i></button>
    </li>`;
  }).join(''));
};

App.events.removeTourItem = function removeTourItem(index) {
  App.state.pendingBulkEvents.splice(index, 1);
  App.events.renderTourPending();
};

App.events.submitTour = async function submitTour() {
  const submitBtn = document.getElementById('submitTourBtn');
  App.ui.setButtonLoading(submitBtn, true, 'Zapisywanie…');
  try {
    await App.api.fetch(`${App.config.API_URL}bulk/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(App.state.pendingBulkEvents),
    });

    App.state.pendingBulkEvents = [];
    App.events.renderTourPending();
    document.getElementById('addTourForm').reset();
    bootstrap.Modal.getInstance(document.getElementById('addTourModal')).hide();
    App.ui.notify('Trasa koncertowa została zapisana.', 'success');
    App.events.loadEvents();
  } catch (err) {
    App.ui.notify('Nie udało się zapisać trasy.', 'danger');
  } finally {
    App.ui.setButtonLoading(submitBtn, false);
  }
};

// --- EDYCJA I USUWANIE --------------------------------------------------------

App.events.deleteEvent = async function deleteEvent(id) {
  if (!window.confirm('Usunąć ten koncert z bazy? Tej operacji nie można cofnąć.')) return;
  try {
    await App.api.fetch(`${App.config.API_URL}${id}`, { method: 'DELETE' });
    App.ui.notify('Koncert został usunięty.', 'success');
    App.events.loadEvents();
  } catch (err) {
    App.ui.notify('Nie udało się usunąć koncertu.', 'danger');
  }
};

App.events.openEditModal = function openEditModal(id) {
  const event = App.state.eventsList.find((e) => e.id === id);
  if (!event) return;

  document.getElementById('edit_id').value = event.id;
  document.getElementById('edit_artist').value = event.artist;
  document.getElementById('edit_name').value = event.name;
  document.getElementById('edit_city').value = event.city;
  document.getElementById('edit_place').value = event.place;
  document.getElementById('edit_max_attendance').value = event.max_attendance;
  document.getElementById('edit_date').value = event.date.slice(0, 16);

  new bootstrap.Modal(document.getElementById('editModal')).show();
};

App.events.submitEdit = async function submitEdit() {
  const id = document.getElementById('edit_id').value;
  const form = document.getElementById('editForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const submitBtn = document.getElementById('submitEditBtn');
  const updatedEvent = {
    artist: document.getElementById('edit_artist').value,
    name: document.getElementById('edit_name').value,
    city: document.getElementById('edit_city').value,
    place: document.getElementById('edit_place').value,
    max_attendance: parseInt(document.getElementById('edit_max_attendance').value, 10),
    date: document.getElementById('edit_date').value,
  };

  App.ui.setButtonLoading(submitBtn, true, 'Zapisywanie…');
  try {
    await App.api.fetch(`${App.config.API_URL}${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent),
    });
    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
    App.ui.notify('Zmiany zostały zapisane.', 'success');
    App.events.loadEvents();
  } catch (err) {
    App.ui.notify('Nie udało się zapisać zmian.', 'danger');
  } finally {
    App.ui.setButtonLoading(submitBtn, false);
  }
};
