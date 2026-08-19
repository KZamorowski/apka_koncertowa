/**
 * state.js
 * Globalna przestrzeń nazw aplikacji oraz konfiguracja.
 * Wszystkie moduły dopinają swoje funkcje do obiektu `App`,
 * dzięki czemu HTML może wywoływać np. App.events.deleteEvent(...)
 * bez zaśmiecania globalnego scope pojedynczymi funkcjami.
 */
const App = {
  config: {
    MAIN_API_URL: 'http://localhost:8000',
    get API_URL() { return `${this.MAIN_API_URL}/events/`; },
    get ATTENDEES_API_URL() { return `${this.MAIN_API_URL}/`; },
    ITEMS_PER_PAGE: 20,
  },

  // Wspólny, mutowalny stan aplikacji
  state: {
    eventsList: [],
    pendingBulkEvents: [],
    calendar: null,
    currentEventAttendees: [],
    currentAttendeesEventId: null,
    currentAttendeesEventName: '',
    currentPage: 1,
    currentSearchQuery: '',
  },

  // Paleta kolorów wydarzeń w kalendarzu
  eventColors: [
    { bg: '#e3f7ef', text: '#17a673' },
    { bg: '#f1ecfc', text: '#5a3fb8' },
    { bg: '#fdf1de', text: '#a3690f' },
    { bg: '#e8f3fd', text: '#1c6fb0' },
  ],

  // Miejsce na funkcje poszczególnych modułów (auth, events, attendees...)
  auth: {},
  api: {},
  calendar: {},
  nav: {},
  events: {},
  attendees: {},
  ui: {},
};
