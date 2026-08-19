"""
concerts_schema.py
Schematy Pydantic definiujące kształt danych koncertu w żądaniach
i odpowiedziach API.
"""

from datetime import datetime

from pydantic import BaseModel


class EventBase(BaseModel):
    """Pola wspólne dla schematów tworzenia i odczytu koncertu."""
    name: str
    artist: str
    city: str
    place: str
    max_attendance: int
    date: datetime


class EventCreate(EventBase):
    """Schemat wejściowy używany przy tworzeniu i edycji koncertu."""
    pass


class Event(EventBase):
    """Schemat wyjściowy zwracany przez API — zawiera wygenerowane ID."""
    id: int

    class Config:
        from_attributes = True  # pozwala budować schemat wprost z modelu SQLAlchemy
