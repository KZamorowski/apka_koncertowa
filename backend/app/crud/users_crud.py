"""
users_crud.py
Warstwa dostępu do danych dla użytkowników oraz obsługa haszowania
i weryfikacji haseł (bcrypt przez passlib).
"""

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from ..models import concerts_models
from ..schemas import users_schema

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_user_by_username(db: Session, username: str):
    """Wyszukuje użytkownika po nazwie."""
    return db.query(concerts_models.User).filter(concerts_models.User.username == username).first()


def create_user(db: Session, user: users_schema.UserCreate):
    """Tworzy nowego użytkownika, haszując hasło przed zapisem do bazy."""
    hashed_password = pwd_context.hash(user.password)
    db_user = concerts_models.User(username=user.username, hashed_password=hashed_password)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Weryfikuje hasło jawne względem zahashowanej wartości z bazy."""
    return pwd_context.verify(plain_password, hashed_password)
