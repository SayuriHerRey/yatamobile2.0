from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from analyticsApp.infraestructura.db import Base

class OrderTable(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True)
    total_price = Column(Float)
    status = Column(String) # 'pendiente', 'preparando', 'completado'
    created_at = Column(DateTime)
    ready_at = Column(DateTime, nullable=True)

class OrderItemTable(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True)
    order_id = Column(String, ForeignKey("orders.id"))
    product_name = Column(String)
    quantity = Column(Integer)
    price = Column(Float)