# Ejemplo de Implementación Frontend - Búsqueda de Jugadores

## React con Debouncing (Recomendado)

```jsx
import { useState, useEffect } from 'react';

function PlayerSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Debouncing: espera 300ms después de que el usuario deja de escribir
    const delaySearch = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        setLoading(true);
        try {
          const response = await fetch(
            `http://localhost:3000/api/search/players?q=${encodeURIComponent(searchTerm)}&limit=5`
          );
          const data = await response.json();
          setSuggestions(data);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300); // 300ms de delay

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  return (
    <div className="player-search">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar jugador... (ej: Kyl)"
      />
      
      {loading && <div>Buscando...</div>}
      
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((player, index) => (
            <li key={index} onClick={() => {
              setSearchTerm(player.strPlayer);
              setSuggestions([]);
              // Aquí puedes hacer algo con el jugador seleccionado
            }}>
              <img src={player.strCutout} alt={player.strPlayer} width="30" />
              <span>{player.strPlayer}</span>
              <span className="position">{player.strPosition}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PlayerSearch;
```

## Vanilla JavaScript

```javascript
let searchTimeout;

const searchInput = document.getElementById('player-search');
const suggestionsContainer = document.getElementById('suggestions');

searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value;
  
  // Limpiar el timeout anterior
  clearTimeout(searchTimeout);
  
  // Esperar 300ms antes de hacer la búsqueda
  searchTimeout = setTimeout(async () => {
    if (searchTerm.trim().length > 0) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/search/players?q=${encodeURIComponent(searchTerm)}&limit=5`
        );
        const players = await response.json();
        
        // Mostrar sugerencias
        suggestionsContainer.innerHTML = players.map(player => `
          <div class="suggestion-item" data-player="${player.strPlayer}">
            <img src="${player.strCutout}" alt="${player.strPlayer}" width="30">
            <span>${player.strPlayer}</span>
            <span class="position">${player.strPosition}</span>
          </div>
        `).join('');
        
        // Agregar event listeners a cada sugerencia
        document.querySelectorAll('.suggestion-item').forEach(item => {
          item.addEventListener('click', () => {
            searchInput.value = item.dataset.player;
            suggestionsContainer.innerHTML = '';
          });
        });
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      suggestionsContainer.innerHTML = '';
    }
  }, 300);
});
```

## Ventajas de este Enfoque

### ✅ **Debouncing (300ms)**
- Evita hacer una petición por cada tecla presionada
- Si escribes "Kylian" rápido, solo hace 1 petición en lugar de 6
- Reduce carga en el servidor y mejora performance

### ✅ **Búsqueda Case-Insensitive**
- "kyl", "Kyl", "KYL" → todos encuentran "Kylian Mbappé"

### ✅ **Límite Configurable**
- Por defecto 5 resultados, pero puedes cambiar: `?q=K&limit=10`

### ✅ **Datos Mínimos**
- Solo devuelve: `strPlayer`, `strCutout`, `strPosition`
- Respuesta rápida y liviana

### ✅ **Escalable**
- Si tienes 10,000 jugadores, no afecta el tiempo de carga inicial
- MongoDB indexado en `strPlayer` será muy rápido

## Optimización Adicional (Opcional)

### Crear un índice en MongoDB para búsquedas más rápidas:

```javascript
// Ejecutar una sola vez en MongoDB
db.playersStats_v2.createIndex({ strPlayer: 1 });
```

Esto hará que las búsquedas sean casi instantáneas incluso con miles de jugadores.

## Comparación con Alternativa de "Todos los Nombres en Frontend"

| Aspecto | Endpoint (Recomendado) | Lista Completa Frontend |
|---------|----------------------|------------------------|
| **Carga inicial** | ⚡ Rápida | 🐌 Lenta (descarga todos los nombres) |
| **Datos actualizados** | ✅ Siempre | ❌ Requiere refrescar |
| **Escalabilidad** | ✅ Excelente | ❌ Empeora con más jugadores |
| **Complejidad** | 🟢 Simple | 🟡 Media |
| **Uso de memoria** | 🟢 Bajo | 🔴 Alto |
| **Performance búsqueda** | 🟢 Muy buena con debouncing | 🟢 Excelente |

## Cuándo usar Lista Completa en Frontend

Solo si:
- Tienes menos de 100-200 jugadores
- Los datos nunca cambian
- Necesitas búsqueda offline
- Quieres evitar llamadas al servidor completamente

Para tu caso con una BD de jugadores que puede crecer, **el endpoint es la mejor opción**.
