"""
database.py
Konfiguracja połączenia z bazą danych PostgreSQL oraz fabryki sesji
SQLAlchemy używanej przez warstwę CRUD.
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

# Adres bazy danych – w kontenerze Dockera wstrzykiwany przez zmienną
# środowiskową DATABASE_URL; poniższa wartość służy wyłącznie jako
# fallback do uruchomienia lokalnego/deweloperskiego.
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://student:haslo123@db:5432/koncerty",
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Fabryka sesji – każde żądanie HTTP otrzymuje własną, niezależną sesję.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Klasa bazowa, po której dziedziczą wszystkie modele ORM.
Base = declarative_base()


def get_db() -> Session:
    """Dependency FastAPI dostarczający sesję bazodanową do endpointów.

    Sesja jest tworzona na czas obsługi pojedynczego żądania i zawsze
    zamykana po jego zakończeniu — również w przypadku wyjątku.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
