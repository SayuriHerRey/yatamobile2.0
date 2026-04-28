from sqlalchemy.orm import Session
from sqlalchemy import text, func
from typing import List, Dict, Any
from analyticsApp.application.ports.analytics_repository import AnalyticsRepository
from analyticsApp.infraestructura.adapters.models import OrderTable, OrderItemTable

class AnalyticsRepositoryPostgres(AnalyticsRepository):
    def __init__(self, db_session: Session):
        self.db = db_session

    def get_metrics(self, time_range: str) -> Dict[str, Any]:
        # Consulta REAL a PostgreSQL
        total_orders = self.db.query(func.count(OrderTable.id)).filter(OrderTable.status == 'completado').scalar()
        avg_ticket = self.db.query(func.avg(OrderTable.total_price)).scalar() or 0
        
        return {
            "totalOrders": total_orders,
            "growth": "+15%", # Esto suele ser una comparación vs ayer
            "avgTicket": round(float(avg_ticket), 2),
            "avgPrepTime": 12
        }

    def get_hourly_data(self, time_range: str) -> List[Dict[str, Any]]:
        # Esto agrupa por hora (simplificado para el ejemplo)
        return [
            {"hour": "08:00", "value": 10},
            {"hour": "10:00", "value": 25},
            {"hour": "12:00", "value": 45},
            {"hour": "14:00", "value": 30}
        ]

    def get_top_products(self, time_range: str, limit: int = 5) -> List[Dict[str, Any]]:
        # Consulta REAL a los items más vendidos
        results = self.db.query(
            OrderItemTable.product_name,
            func.sum(OrderItemTable.quantity).label('total_qty'),
            func.sum(OrderItemTable.price * OrderItemTable.quantity).label('revenue')
        ).group_by(OrderItemTable.product_name).order_by(text('total_qty DESC')).limit(limit).all()

        return [
            {
                "id": str(i),
                "name": r[0],
                "image": "https://via.placeholder.com/150",
                "ordersToday": int(r[1]),
                "revenue": float(r[2])
            } for i, r in enumerate(results)
        ]