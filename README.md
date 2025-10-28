# MarketPlayer Backend

Backend API para consultar estadísticas de jugadores desde MongoDB.

## Configuración

### Variables de Entorno

El archivo `.env` contiene las credenciales de MongoDB (ya configurado):
- `MONGODB_URI`: URI de conexión a MongoDB Atlas
- `MONGODB_DB_NAME`: Nombre de la base de datos (Marketplayer)
- `MONGODB_COLLECTION`: Nombre de la colección (playersStats_v2)

### Instalación

```bash
npm install
```

### Iniciar el servidor

```bash
node index.js
```

El servidor se ejecutará en `http://localhost:3000`

## Endpoints

### GET /api/player/:name

Obtiene todos los campos de un jugador por su nombre.

**Parámetros:**
- `name`: Nombre del jugador (debe coincidir con el campo `strPlayer` en la base de datos)

**Ejemplo de uso:**

```bash
# Reemplaza "Lionel Messi" con el nombre exacto del jugador en la base de datos
curl http://localhost:3000/api/player/Lionel%20Messi
```

**Respuestas:**

- **200 OK**: Devuelve todos los campos del jugador
- **404 Not Found**: Jugador no encontrado
- **503 Service Unavailable**: Base de datos no disponible
- **500 Internal Server Error**: Error del servidor

---

### GET /api/top-goleadores

Obtiene los 20 jugadores con más goles.

**Ejemplo de uso:**
```bash
curl http://localhost:3000/api/top-goleadores
```

**Respuesta:**
```json
[
  {
    "strPlayer": "Nombre del jugador",
    "strCutout": "URL de la imagen",
    "Gls": 25
  },
  ...
]
```

---

### GET /api/top-goleros

Obtiene los 20 arqueros con más vallas invictas (clean sheets).

**Ejemplo de uso:**
```bash
curl http://localhost:3000/api/top-goleros
```

**Respuesta:**
```json
[
  {
    "strPlayer": "Nombre del arquero",
    "strCutout": "URL de la imagen",
    "CS": 15
  },
  ...
]
```

---

### GET /api/top-defensas

Obtiene los 20 defensores con mayor eficacia en barridas (tackle efficiency).

**Criterios:**
- Posición: Center-Back, Left-Back o Right-Back
- Tackles realizados (Tkl) > 20
- Ordenados por porcentaje de tackles ganados (TklW/Tkl * 100)

**Ejemplo de uso:**
```bash
curl http://localhost:3000/api/top-defensas
```

**Respuesta:**
```json
[
  {
    "strPlayer": "Nombre del defensor",
    "strCutout": "URL de la imagen",
    "tackleEfficiency": "85.50",
    "Tkl": 40,
    "TklW": 34,
    "strPosition": "Center-Back"
  },
  ...
]
```

---

### GET /api/top-touches

Obtiene los 20 jugadores con mayor cantidad de toques del balón.

**Ejemplo de uso:**
```bash
curl http://localhost:3000/api/top-touches
```

**Respuesta:**
```json
[
  {
    "strPlayer": "Nombre del jugador",
    "strCutout": "URL de la imagen",
    "Touches": 2500
  },
  ...
]
```

---

### GET /api/top-asistidores

Obtiene los 20 jugadores con más asistencias.

**Ejemplo de uso:**
```bash
curl http://localhost:3000/api/top-asistidores
```

**Respuesta:**
```json
[
  {
    "strPlayer": "Nombre del jugador",
    "strCutout": "URL de la imagen",
    "Ast": 18
  },
  ...
]
```

---

### GET /api

Endpoint de prueba simple.

**Respuesta:**
```json
{
  "message": "Hello from Express backend!"
}
```

## Seguridad

- Las credenciales de MongoDB están almacenadas en el archivo `.env`
- El archivo `.env` está incluido en `.gitignore` para evitar que se suba al repositorio
- Nunca compartas las credenciales públicamente
