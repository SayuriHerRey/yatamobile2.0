from authApp.infraestructura.db import SessionLocal, engine
from authApp.infraestructura.adapters import models
from passlib.context import CryptContext
import uuid

# ¡Esta es la línea clave! Fuerza la creación de las tablas basadas en los modelos
models.Base.metadata.create_all(bind=engine)

# Configuramos el encriptador de contraseñas idéntico al del servicio
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_users():
    db = SessionLocal()
    
    # Revisar si ya existen datos para no duplicar
    if db.query(models.UserTable).first():
        print("Los usuarios ya existen en la base de datos. No se hizo nada.")
        db.close()
        return

    # Crear datos de prueba
    usuarios_prueba = [
        models.UserTable(
            id=str(uuid.uuid4()),
            email="estudiante@unach.mx",
            name="Juan Estudiante",
            hashed_password=pwd_context.hash("123456") # Contraseña real: 123456
        ),
        models.UserTable(
            id=str(uuid.uuid4()),
            email="admin@cafeteria.com",
            name="Maria Staff",
            hashed_password=pwd_context.hash("admin123") # Contraseña real: admin123
        )
    ]
    
    db.add_all(usuarios_prueba)
    db.commit()
    print("✅ Usuarios de prueba y tablas creadas/insertadas exitosamente.")
    db.close()

if __name__ == "__main__":
    seed_users()