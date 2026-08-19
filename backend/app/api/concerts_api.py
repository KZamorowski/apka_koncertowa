"""
concerts_api.py
Endpointy CRUD dla koncertów, w tym masowe tworzenie wielu koncertów
naraz (np. przy dodawaniu całej trasy koncertowej). Wszystkie endpointy
wymagają uwierzytelnienia (JWT).
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...database import get_db
from ..crud import concerts_crud
from ..schemas import concerts_schema
from . import auth_api

router = APIRouter()


@router.get("/events/", response_model=list[concerts_schema.Event])
def read_events(
    db: Session = Depends(get_db),
    current_user: str = Depends(auth_api.get_current_user),
):
    """Zwraca listę wszystkich koncertów."""
    return concerts_crud.get_all_events(db)


@router.post("/events/", response_model=concerts_schema.Event)
def create_event(
    event: concerts_schema.EventCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(auth_api.get_current_user),
):
    """Tworzy pojedynczy koncert."""
    return concerts_crud.create_event(db=db, event=event)


@router.put("/events/{event_id}", response_model=concerts_schema.Event)
def update_event(
    event_id: int,
    event: concerts_schema.EventCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(auth_api.get_current_user),
):
    """Aktualizuje dane koncertu o podanym ID."""
    updated_event = concerts_crud.update_event(db=db, event_id=event_id, event_data=event)
    if updated_event is None:
        raise HTTPException(status_code=404, detail="Koncert nie znaleziony")
    return updated_event


@router.delete("/events/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(auth_api.get_current_user),
):
    """Usuwa koncert o podanym ID."""
    deleted_event = concerts_crud.delete_event(db=db, event_id=event_id)
    if deleted_event is None:
        raise HTTPException(status_code=404, detail="Koncert nie znaleziony")
    return {"message": "Koncert usunięty pomyślnie"}


@router.post("/events/bulk/", response_model=List[concerts_schema.Event])
def create_events_bulk(
    events: List[concerts_schema.EventCreate],
    db: Session = Depends(get_db),
    current_user: str = Depends(auth_api.get_current_user),
):
    """Tworzy wiele koncertów w jednej transakcji (np. całą trasę koncertową)."""
    return concerts_crud.create_events_bulk(db=db, events=events)
