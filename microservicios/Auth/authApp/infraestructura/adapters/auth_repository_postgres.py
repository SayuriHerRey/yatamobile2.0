import uuid
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from authApp.application.ports.auth_repository import AuthRepository
from authApp.domain.auth import User

class AuthRepositoryPostgres(AuthRepository):
    def __init__(self, db_session: Session):
        self.db = db_session

    def get_user_by_email(self, email: str) -> Optional[User]:
        # Implementación con SQLAlchemy raw o models
        query = text("SELECT id, email, name, hashed_password FROM users WHERE email = :email")
        result = self.db.execute(query, {"email": email}).fetchone()
        if result:
            return User(id=str(result[0]), email=result[1], name=result[2], hashed_password=result[3])
        return None

    def save_refresh_token(self, user_id: str, token: str) -> None:
        # Agregamos el campo 'id' a la consulta y generamos el UUID
        query = text("INSERT INTO user_sessions (id, user_id, refresh_token) VALUES (:id, :uid, :tok)")
        self.db.execute(query, {"id": str(uuid.uuid4()), "uid": user_id, "tok": token})
        self.db.commit()

    def revoke_token(self, token: str) -> None:
        query = text("DELETE FROM user_sessions WHERE refresh_token = :tok")
        self.db.execute(query, {"tok": token})
        self.db.commit()