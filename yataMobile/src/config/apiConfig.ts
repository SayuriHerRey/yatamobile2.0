// src/config/apiConfig.ts
// ─────────────────────────────────────────────────────────────────────────────
// Cambia las URLs base según tu entorno:
//   • Desarrollo local (Expo en emulador Android): usa 10.0.2.2 en lugar de localhost
//   • Desarrollo local (Expo en dispositivo físico): usa la IP de tu máquina, ej. 192.168.1.X
//   • Producción: sustituye por tu dominio o IP pública
// ─────────────────────────────────────────────────────────────────────────────

const DEV_HOST = '192.168.0.14'; // ← CAMBIA ESTO a la IP de tu máquina

export const API_URLS = {
  PRODUCT_SERVICE: `http://${DEV_HOST}:8001`,
  PAYMENT_SERVICE: `http://${DEV_HOST}:8002`,
};

// Tiempo máximo de espera para cada petición (ms)
export const API_TIMEOUT = 10_000;