from analyticsApp.infraestructura.db import SessionLocal, engine
from analyticsApp.infraestructura.adapters import models
from datetime import datetime, timedelta
import uuid

# ¡Línea clave! Crea las tablas (orders, order_items) si no existen
models.Base.metadata.create_all(bind=engine)

def seed_analytics():
    db = SessionLocal()
    
    if db.query(models.OrderTable).first():
        print("Los datos de analíticas ya existen. No se hizo nada.")
        db.close()
        return

    # Fechas simuladas para "Hoy"
    ahora = datetime.utcnow()
    hace_dos_horas = ahora - timedelta(hours=2)
    hace_una_hora = ahora - timedelta(hours=1)

    # 1. Crear Órdenes
    order_id_1 = str(uuid.uuid4())
    order_id_2 = str(uuid.uuid4())

    ordenes = [
        models.OrderTable(id=order_id_1, total_price=120.0, status="completado", created_at=hace_dos_horas, ready_at=hace_dos_horas + timedelta(minutes=15)),
        models.OrderTable(id=order_id_2, total_price=45.50, status="completado", created_at=hace_una_hora, ready_at=hace_una_hora + timedelta(minutes=8))
    ]

    # 2. Crear Productos dentro de esas órdenes
    items = [
        models.OrderItemTable(order_id=order_id_1, product_name="Torta de Lomo", quantity=2, price=45.0),
        models.OrderItemTable(order_id=order_id_1, product_name="Café Americano", quantity=1, price=30.0),
        models.OrderItemTable(order_id=order_id_2, product_name="Frappé Moka", quantity=1, price=45.50)
    ]

    db.add_all(ordenes)
    db.commit() # Guardamos primero las órdenes por la llave foránea
    
    db.add_all(items)
    db.commit()
    
    print("✅ Tablas creadas y datos de ventas insertados exitosamente.")
    db.close()

if __name__ == "__main__":
    seed_analytics()