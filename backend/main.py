"""
main.py
Punkt wejściowy aplikacji FastAPI. Konfiguruje middleware CORS,
inicjalizuje tabele w bazie danych oraz podpina routery poszczególnych
modułów API (koncerty, uczestnicy, autoryzacja).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .app.api import attendees_api, auth_api, concerts_api
from .app.models import concerts_models
from .database import engine

# Tworzymy tabele w bazie na podstawie zdefiniowanych modeli SQLAlchemy
# (jeśli już istnieją, operacja jest bezpiecznie pomijana).
concerts_models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Koncerty API",
    description="Backend systemu do zarządzania koncertami i uczestnikami.",
    version="1.0.0",
)

# Konfiguracja CORS – pozwala frontendowi (uruchomionemu pod innym adresem)
# na komunikację z API. W środowisku produkcyjnym `allow_origins` powinno
# wskazywać konkretną domenę frontendu zamiast "*".
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(concerts_api.router)
app.include_router(attendees_api.router)
app.include_router(auth_api.router)
