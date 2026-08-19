"""
users_schema.py
Schematy Pydantic dla użytkowników — dane rejestracyjne oraz dane
zwracane przez API.
"""

from pydantic import BaseModel


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    """Schemat używany przy rejestracji — wymaga hasła w postaci jawnej."""
    password: str


class User(UserBase):
    """Schemat zwracany przez API. Celowo nie zawiera hasła ani jego hasha."""
    id: int

    class Config:
        from_attributes = True
