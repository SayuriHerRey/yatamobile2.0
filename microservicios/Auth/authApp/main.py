from fastapi import FastAPI
from authApp.infraestructura.api.auth_controller import router as auth_router
from authApp.infraestructura.db import engine, Base

# Crear tablas en la DB
Base.metadata.create_all(bind=engine)

app = FastAPI(title="YaTa Auth Service")

app.include_router(auth_router)

@app.get("/")
def health_check():
    return {"status": "Auth Service is running"}