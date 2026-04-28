Este repositorio contiene el backend del sistema YaTa, desarrollado bajo una Arquitectura Hexagonal utilizando Python con FastAPI y PostgreSQL como base de datos.

📌 Requisitos Previos
Python 3.13+
PostgreSQL (instalado y corriendo)
pgAdmin 4 o acceso a la terminal psql

1. Configuración de la Base de Datos
Cada microservicio utiliza su propia base de datos independiente. Ejecuta los siguientes comandos en tu terminal de PostgreSQL (psql) o en el Query Tool de pgAdmin:

SQL
CREATE DATABASE yata_auth_db;
CREATE DATABASE yata_analytics_db;

2. Microservicio: Auth Service
Encargado de la autenticación JWT y gestión de roles por dominio.

Entrar a la carpeta: cd Auth

Crear entorno virtual: python -m venv venv

Activar entorno:

Windows: venv\Scripts\activate

Unix/macOS: source venv/bin/activate

Instalar dependencias: pip install -r requirements.txt

Configurar variables: Crea un archivo .env en Auth/ con:

Fragmento de código
DATABASE_URL=postgresql://tu_usuario:tu_password@localhost:5432/yata_auth_db
Poblar datos de prueba: python seed_auth.py

Ejecutar: uvicorn authApp.main:app --reload --host 0.0.0.0 --port 8000

3. Microservicio: Analytics Service
Procesa las métricas de ventas y productos más vendidos.

Entrar a la carpeta: cd Analytics

Crear entorno virtual: python -m venv venv

Activar entorno:

Windows: venv\Scripts\activate

Unix/macOS: source venv/bin/activate

Instalar dependencias: pip install -r requirements.txt

Configurar variables: Crea un archivo .env en Analytics/ con:

Fragmento de código
DATABASE_URL=postgresql://tu_usuario:tu_password@localhost:5432/yata_analytics_db
Poblar datos de prueba: python seed_analytics.py

Ejecutar: uvicorn analyticsApp.main:app --reload --host 0.0.0.0 --port 8001

4. Documentación Interactiva (Swagger)
Una vez encendidos los servicios, puedes probar los endpoints y ver los modelos en:

Auth API: http://localhost:8000/docs

Analytics API: http://localhost:8001/docs