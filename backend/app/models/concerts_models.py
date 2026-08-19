"""
concerts_models.py
Modele SQLAlchemy odwzorowujące strukturę bazy danych: koncerty,
uczestnicy oraz użytkownicy systemu.
"""

import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ...database import Base


class Event(Base):
    """Koncert — pojedyncze wydarzenie z limitem miejsc (max_attendance)."""
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    artist = Column(String, index=True)
    city = Column(String, index=True)
    place = Column(String, index=True)
    max_attendance = Column(Integer, index=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)

    # Relacja jeden-do-wielu: jeden koncert ma wielu uczestników.
    attendees = relationship("Attendee", back_populates="event")


class Attendee(Base):
    """Uczestnik koncertu, powiązany z konkretnym wydarzeniem przez event_id."""
    __tablename__ = "attendees"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String, index=True)
    first_name = Column(String)
    last_name = Column(String)
    mail = Column(String)
    phone = Column(String)

    event_id = Column(Integer, ForeignKey("events.id"))
    event = relationship("Event", back_populates="attendees")


class User(Base):
    """Użytkownik systemu (konto administracyjne / operatorskie)."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
