"""
attendees_api.py
Endpointy CRUD dla uczestników koncertów. Wszystkie wymagają
uwierzytelnienia (JWT) poprzez zależność auth_api.get_current_user.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...database import get_db
from ..crud import attendees_crud
from ..schemas import attendees_schema
from . import auth_api

router = APIRouter()


@router.get("/attendees/", response_model=list[attendees_schema.Attendee])
def read_attendees(
    db: Session = Depends(get_db),
    current_user: str = Depends(auth_api.get_current_user),
):
    """Zwraca listę wszystkich uczestników (wszystkich koncertów łącznie)."""
    return attendees_crud.get_all_attendees(db)


@router.get("/events/{event_id}/attendees/", response_model=attendees_schema.PaginatedAttendees)
def read_attendees_for_event(
    event_id: int,
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = "",
    db: Session = Depends(get_db),
    current_user: str = Depends(auth_api.get_current_user),
):
    """Zwraca uczestników konkretnego koncertu z obsługą paginacji oraz
    wyszukiwania po imieniu, nazwisku lub numerze biletu."""
    return attendees_crud.get_attendees_by_event(
        db=db, event_id=event_id, skip=skip, limit=limit, search=search
    )


@router.post("/attendees/", response_model=attendees_schema.Attendee)
def create_attendee(
    attendee: attendees_schema.AttendeeCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(auth_api.get_current_user),
):
    """Dodaje nowego uczestnika do wybranego koncertu."""
    return attendees_crud.create_attendee(db=db, attendee=attendee)


@router.delete("/attendees/{attendee_id}")
def delete_attendee(
    attendee_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(auth_api.get_current_user),
):
    """Usuwa uczestnika o podanym ID."""
    deleted_attendee = attendees_crud.delete_attendee(db=db, attendee_id=attendee_id)
    if deleted_attendee is None:
        raise HTTPException(status_code=404, detail="Uczestnik nie znaleziony")
    return {"message": "Uczestnik usunięty pomyślnie"}


@router.put("/attendees/{attendee_id}", response_model=attendees_schema.Attendee)
def update_attendee(
    attendee_id: int,
    attendee: attendees_schema.AttendeeCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(auth_api.get_current_user),
):
    """Aktualizuje dane uczestnika o podanym ID."""
    updated_attendee = attendees_crud.update_attendee(
        db=db, attendee_id=attendee_id, attendee_data=attendee
    )
    if updated_attendee is None:
        raise HTTPException(status_code=404, detail="Uczestnik nie znaleziony")
    return updated_attendee
