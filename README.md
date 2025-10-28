### Jugar 

1.  **Crear Partida:** Ingrese nombre de jugador, un nombre para la partida y haga clic en "Crear Partida".
2.  **Unirse:** Busque una partida existente y haga clic en "Unirse" para entrar al Lobby.
3.  **Inicio de Partida:** Cuando haya entre 5 y 10 jugadores, el **Líder** (dueño de la partida) puede presionar "Comenzar Partida".

## Componentes Clave

| Componente | Descripción | Tasa/Detalle |
| :--- | :--- | :--- |
| **`llamarAPI()`** | Función universal que maneja las peticiones HTTP (GET, POST, PATCH, etc.), *headers* de jugador/contraseña y captura errores de la API (incluido `X-msg`). | Manejo de errores de red y HTTP. |
| **`POLLING_RATE`** | Define la frecuencia con la que la interfaz verifica el estado actual de la partida en la API. | **5000ms (5 segundos)**. |
| **`updateGameStatus()`** | Se ejecuta continuamente para obtener los datos del juego y actualizar la interfaz (roles, botones, mensajes, etc.) según la fase actual. | Polling. |
| **Persistencia** | Utiliza LocalStorage para recordar el `gameId` y el `playerName`, lo que permite al jugador restaurar su sesión al refrescar la página. | `localStorage.setItem` |

## Flujo de Juego y Fases

El juego avanza por rondas ("Décadas"), cada una con 3 fases principales controladas por la API:

### 1. Fase de Propuesta (`waiting-on-leader`)

| Acción | Rol | Detalle | API Call |
| :--- | :--- | :--- | :--- |
| **Selección de Grupo** | **Líder** | El líder debe seleccionar el número exacto de jugadores requerido para el grupo, basado en la década actual y el número total de jugadores. | `proposeGroup()` **PATCH** `/rounds/{roundId}` |

### 2. Fase de Votación (`voting`)

| Acción | Rol | Detalle | API Call |
| :--- | :--- | :--- | :--- |
| **Emitir Voto** | **Todos** | Todos los jugadores votan **Aprobar (Sí)** o **Rechazar (No)** la propuesta.  | `voteForGroup(vote)` **POST** `/rounds/{roundId}` |

### 3. Fase de Acción (`waiting-on-group`)

| Acción | Rol | Detalle | API Call |
| :--- | :--- | :--- | :--- |
| **Acción de Grupo** | **Miembros del Grupo** | Los miembros del grupo votado positivamente eligen **Colaborar** (`true`) o **Sabotear** (`false`). El Contaminado saboteará para fallar la misión. | `submitAction(action)` **PUT** `/rounds/{roundId}` |

### Condición de Victoria

El juego termina cuando un equipo gana 3 décadas (rondas).

* **Ejemplares (Verde) :** Ganan la ronda si el resultado es `"citizens"`.
* **Psicopatas (Rojo):** Ganan la ronda si el resultado es `"enemies"`.
