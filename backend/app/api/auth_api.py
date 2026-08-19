"""
auth_api.py
Endpointy odpowiedzialne za rejestrację, logowanie oraz weryfikację
tokenów JWT wykorzystywanych do zabezpieczenia pozostałych endpointów API.
"""

import os
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from ...database import get_db
from ..crud import users_crud
from ..schemas import users_schema

# Konfiguracja JWT. SECRET_KEY MUSI być ustawiony przez zmienną środowiskową
# JWT_SECRET_KEY na produkcji — wartość domyślna poniżej służy wyłącznie do
# pracy lokalnej/deweloperskiej i nigdy nie powinna trafić na produkcję.
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-only-secret-do-not-use-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

router = APIRouter()


@router.post("/register", response_model=users_schema.User)
def register_user(user: users_schema.UserCreate, db: Session = Depends(get_db)):
    """Rejestruje nowego użytkownika, jeśli nazwa nie jest już zajęta."""
    db_user = users_crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Użytkownik o takiej nazwie już istnieje")

    return users_crud.create_user(db=db, user=user)


@router.post("/login")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Weryfikuje dane logowania i w razie sukcesu zwraca token dostępowy JWT."""
    user = users_crud.get_user_by_username(db, username=form_data.username)

    if not user or not users_crud.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Błędny login lub hasło")

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": user.username, "exp": expire}
    access_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return {"access_token": access_token, "token_type": "bearer"}


def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    """Dependency chroniący endpointy — dekoduje token JWT i zwraca nazwę użytkownika.

    Podpinana jako `Depends(...)` w endpointach, które mają być dostępne
    wyłącznie dla zalogowanych użytkowników.
    """
    unauthorized = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Brak autoryzacji")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise unauthorized
    except JWTError:
        raise unauthorized
    return username
