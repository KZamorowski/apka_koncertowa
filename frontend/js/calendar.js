/**
 * calendar.js
 * Inicjalizacja widoku kalendarza (FullCalendar) i synchronizacja
 * z listą koncertów.
 */

App.calendar.init = function initCalendar() {
  const calendarEl = document.getElementById('calendar');
  App.state.calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'pl',
    headerToolbar: { left: 'today prev,next', center: 'title', right: 'dayGridMonth,timeGridWeek' },
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', meridiem: false },
    height: 'auto',
    events: [],
  });
  App.state.calendar.render();
};

App.calendar.updateEvents = function updateEvents(eventsToRender) {
  const calendar = App.state.calendar;
  if (!calendar) return;

  calendar.removeAllEvents();
  const calendarEvents = eventsToRender.map((event, index) => {
    const colorTheme = App.eventColors[index % App.eventColors.length];
    return {
      id: event.id,
      title: `${event.artist} \n ${event.place}`,
      start: event.date,
      backgroundColor: colorTheme.bg,
      borderColor: colorTheme.bg,
      textColor: colorTheme.text,
    };
  });
  calendar.addEventSource(calendarEvents);
};
