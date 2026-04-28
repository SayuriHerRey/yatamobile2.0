from fastapi import FastAPI
from analyticsApp.infraestructura.api.analytics_controller import router as analytics_router
from analyticsApp.infraestructura.db import engine, Base

# IMPORTANTE: Importar los modelos para que SQLAlchemy sepa qué tablas crear
import analyticsApp.infraestructura.adapters.models

# Crear tablas en la base de datos automáticamente al iniciar
Base.metadata.create_all(bind=engine)

app = FastAPI(title="YaTa Analytics Service", description="Microservicio de Estadísticas para la Cafetería")

# Registrar las rutas del controlador
app.include_router(analytics_router)

@app.get("/")
def health_check():
    return {"status": "Analytics Service is running y conectado a la BD"}