import sys, os
sys.path.insert(0, os.path.dirname(__file__))

import psycopg2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from infraestructura.api.product_controller import router as product_router

DB_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:camila12!@localhost:5432/product_db"
)

def init_db():
    """Crea la tabla products si no existe."""
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id                   VARCHAR(36) PRIMARY KEY,
            name                 VARCHAR(255) NOT NULL,
            description          TEXT DEFAULT '',
            base_price           NUMERIC(10,2) NOT NULL,
            category             VARCHAR(100) NOT NULL,
            image_url            TEXT DEFAULT '',
            available            BOOLEAN DEFAULT TRUE,
            requires_customization BOOLEAN DEFAULT FALSE,
            has_extras           BOOLEAN DEFAULT FALSE,
            base_ingredients     JSONB DEFAULT '[]'::jsonb,
            available_sizes      JSONB DEFAULT '[]'::jsonb,
            available_extras     JSONB DEFAULT '[]'::jsonb,
            created_at           TIMESTAMP DEFAULT NOW(),
            updated_at           TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
        CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);
    """)
    conn.commit()
    cur.close()
    conn.close()
    print("✅ Tabla 'products' lista.")

app = FastAPI(
    title="Product & Menu Service",
    description="Microservicio de gestión de productos/menú — Yata 2.0",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(product_router)

@app.on_event("startup")
def startup():
    init_db()

@app.get("/health")
def health():
    return {"service": "product-service", "status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
