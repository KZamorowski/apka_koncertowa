"""
seed.py
Skrypt pomocniczy do wypełniania bazy danych przykładowymi uczestnikami
(z wykorzystaniem biblioteki Faker). Losowo przypisuje uczestników do
istniejących koncertów, respektując limit miejsc (max_attendance).

Uruchomienie:
    python -m backend.seed
"""

import random

from faker import Faker

from backend.app.models.concerts_models import Attendee, Event
from backend.database import SessionLocal

fake = Faker("pl_PL")


def generate_attendees(num_attendees: int = 100) -> None:
    """Generuje i zapisuje losowych uczestników dla istniejących koncertów.

    Args:
        num_attendees: maksymalna liczba uczestników do wygenerowania.
            Rzeczywista liczba może być mniejsza, jeśli zabraknie wolnych
            miejsc na koncertach.
    """
    db = SessionLocal()

    try:
        events = db.query(Event).all()
        if not events:
            print("Błąd: brak koncertów w bazie. Dodaj najpierw jakiś koncert.")
            return

        # Mapa event_id -> liczba wolnych miejsc, aktualizowana na bieżąco
        # w trakcie losowania kolejnych uczestników.
        available_spots = {}
        for event in events:
            current_attendees_count = (
                db.query(Attendee).filter(Attendee.event_id == event.id).count()
            )
            remaining_spots = event.max_attendance - current_attendees_count
            if remaining_spots > 0:
                available_spots[event.id] = remaining_spots

        if not available_spots:
            print("Wszystkie koncerty są już wyprzedane — brak miejsc do przypisania.")
            return

        new_attendees = []
        added_count = 0

        print(f"Rozpoczynam generowanie do {num_attendees} uczestników...")

        for _ in range(num_attendees):
            if not available_spots:
                print("Uwaga: wyprzedano wszystkie miejsca przed końcem generowania.")
                break

            chosen_event_id = random.choice(list(available_spots.keys()))

            attendee = Attendee(
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                mail=fake.free_email(),
                phone=fake.phone_number(),
                ticket_number=fake.bothify(text="TKT-####-????").upper(),
                event_id=chosen_event_id,
            )
            new_attendees.append(attendee)
            added_count += 1

            available_spots[chosen_event_id] -= 1
            if available_spots[chosen_event_id] == 0:
                del available_spots[chosen_event_id]

        db.add_all(new_attendees)
        db.commit()

        print(f"Sukces! Dodano {added_count} wirtualnych uczestników.")

    except Exception as e:
        print(f"Wystąpił błąd: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    generate_attendees(50000)
