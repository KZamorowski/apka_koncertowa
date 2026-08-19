"""
attendees_schema.py
Schematy Pydantic dla uczestników koncertów, w tym wariant z paginacją
używany przy listowaniu uczestników danego wydarzenia.
"""

from typing import List

from pydantic import BaseModel


class AttendeeBase(BaseModel):
    first_name: str
    last_name: str
    mail: str
    phone: str
    ticket_number: str
    event_id: int


class AttendeeCreate(AttendeeBase):
    """Schemat wejściowy używany przy tworzeniu i edycji uczestnika."""
    pass


class Attendee(AttendeeBase):
    """Schemat wyjściowy zwracany przez API — zawiera wygenerowane ID."""
    id: int

    class Config:
        from_attributes = True


class PaginatedAttendees(BaseModel):
    """Wynik paginowanego zapytania o uczestników: całkowita liczba + wycinek wyników."""
    total: int
    items: List[Attendee]
