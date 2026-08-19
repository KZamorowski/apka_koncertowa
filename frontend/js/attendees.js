/**
 * attendees.js
 * Widok uczestników danego koncertu: wyszukiwanie i paginacja
 * realizowane po stronie serwera.
 */

App.attendees.open = function open(eventId, eventName) {
  App.nav.switchView('attendeesView', document.getElementById('nav-koncerty'));
  document.getElementById('attendeesViewTitle').innerText = `Uczestnicy: ${eventName}`;
  App.state.currentAttendeesEventId = eventId;
  App.state.currentAttendeesEventName = eventName;
  App.state.currentPage = 1;
  App.state.currentSearchQuery = '';
  document.getElementById('searchAttendeeInput').value = '';
  App.attendees.fetchPage();
};

App.attendees.handleSearchKeydown = function handleSearchKeydown(event) {
  if (event.key === 'Enter') App.attendees.search();
};

App.attendees.search = function search() {
  App.state.currentSearchQuery = document.getElementById('searchAttendeeInput').value;
  App.state.currentPage = 1;
  App.attendees.fetchPage();
};

App.attendees.fetchPage = async function fetchPage() {
  const tbody = document.getElementById('attendeesTableBody');
  tbody.innerHTML = App.ui.loadingRow(4);

  const { currentPage, currentAttendeesEventId, currentSearchQuery } = App.state;
  const skip = (currentPage - 1) * App.config.ITEMS_PER_PAGE;

  try {
    const response = await App.api.fetch(
      `${App.config.ATTENDEES_API_URL}events/${currentAttendeesEventId}/attendees/?skip=${skip}&limit=${App.config.ITEMS_PER_PAGE}&search=${encodeURIComponent(currentSearchQuery)}`
    );
    if (response.ok) {
      const data = await response.json();
      App.state.currentEventAttendees = data.items;
      App.attendees.renderTable(data.items, data.total);
    } else {
      tbody.innerHTML = App.ui.errorRow(4);
    }
  } catch (error) {
    tbody.innerHTML = App.ui.errorRow(4, 'Błąd połączenia z serwerem.');
  }
};

App.attendees.renderTable = function renderTable(attendeesList, totalItems) {
  const tbody = document.getElementById('attendeesTableBody');
  const countLabel = document.getElementById('attendeesCountLabel');
  countLabel.innerText = `Znaleziono: ${totalItems}`;

  if (attendeesList.length === 0) {
    tbody.innerHTML = App.ui.emptyRow(4, {
      icon: 'bi-people',
      title: 'Brak uczestników',
      hint: App.state.currentSearchQuery ? 'Spróbuj zmienić kryteria wyszukiwania.' : 'Nikt jeszcze nie zapisał się na ten koncert.',
    });
    App.attendees.renderPagination(0);
    return;
  }

  tbody.innerHTML = attendeesList.map((att) => {
    const ticketLabel = att.ticket_number ? App.ui.escapeHtml(att.ticket_number) : 'Brak biletu';
    const firstName = App.ui.escapeHtml(att.first_name);
    const lastName = App.ui.escapeHtml(att.last_name);
    const mail = App.ui.escapeHtml(att.mail);
    const phone = App.ui.escapeHtml(att.phone);
    const safeEventName = App.ui.escapeAttr(App.state.currentAttendeesEventName);

    return `<tr>
      <td class="fw-bold"><span class="badge bg-secondary mb-1">${ticketLabel}</span><br>${firstName} ${lastName}</td>
      <td><a href="mailto:${mail}" class="text-decoration-none text-muted">${mail}</a></td>
      <td>${phone}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger" onclick="App.attendees.remove(${att.id}, ${App.state.currentAttendeesEventId}, '${safeEventName}')" aria-label="Usuń uczestnika"><i class="bi bi-person-x"></i></button>
      </td>
    </tr>`;
  }).join('');

  App.attendees.renderPagination(totalItems);
};

App.attendees.renderPagination = function renderPagination(totalItems) {
  const pag = document.getElementById('paginationControls');
  const totalPages = Math.ceil(totalItems / App.config.ITEMS_PER_PAGE);
  const currentPage = App.state.currentPage;

  if (totalPages <= 1) {
    pag.innerHTML = '';
    return;
  }

  let html = `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><a class="page-link" onclick="App.attendees.changePage(${currentPage - 1})">Poprzednia</a></li>`;

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    html += `<li class="page-item"><a class="page-link" onclick="App.attendees.changePage(1)">1</a></li><li class="page-item disabled"><a class="page-link">…</a></li>`;
  }

  for (let i = startPage; i <= endPage; i += 1) {
    html += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" onclick="App.attendees.changePage(${i})">${i}</a></li>`;
  }

  if (endPage < totalPages) {
    html += `<li class="page-item disabled"><a class="page-link">…</a></li><li class="page-item"><a class="page-link" onclick="App.attendees.changePage(${totalPages})">${totalPages}</a></li>`;
  }

  html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><a class="page-link" onclick="App.attendees.changePage(${currentPage + 1})">Następna</a></li>`;

  pag.innerHTML = html;
};

App.attendees.changePage = function changePage(newPage) {
  App.state.currentPage = newPage;
  App.attendees.fetchPage();
};

App.attendees.remove = async function remove(attendeeId) {
  if (!window.confirm('Czy na pewno usunąć tego uczestnika?')) return;
  try {
    await App.api.fetch(`${App.config.ATTENDEES_API_URL}attendees/${attendeeId}`, { method: 'DELETE' });
    App.ui.notify('Uczestnik został usunięty.', 'success');
    App.attendees.fetchPage();
    App.events.loadEvents();
  } catch (err) {
    App.ui.notify('Nie udało się usunąć uczestnika.', 'danger');
  }
};
