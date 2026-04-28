from fastapi import APIRouter, Depends
from authApp.domain.auth import LoginRequest, TokenResponse
from authApp.application.services.auth_service import AuthService
from authApp.infraestructura.adapters.auth_repository_postgres import AuthRepositoryPostgres
# Asume que tienes una dependencia get_db() configurada
from authApp.infraestructura.db import get_db

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

def get_auth_service(db=Depends(get_db)) -> AuthService:
    repo = AuthRepositoryPostgres(db)
    return AuthService(repo)

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, service: AuthService = Depends(get_auth_service)):
    return service.authenticate_user(request.email, request.password)

@router.post("/logout")
def logout(refresh_token: str, service: AuthService = Depends(get_auth_service)):
    service.logout(refresh_token)
    return {"message": "Sesión cerrada correctamente"}