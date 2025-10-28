# 🦠 ContaminaDOS: Interfaz Web con API

Este proyecto es la interfaz de usuario web para el juego de roles ocultos "ContaminaDOS", diseñado para interactuar con la [API externa](https://app.swaggerhub.com/apis/UCR-SA/contaminaDOS/1.0.1).

El desarrollo está implementado en **HTML, CSS y JavaScript (Vanilla JS)**. El código JS está consolidado en una **arquitectura monolítica** de un solo archivo (`script.js`) para simplificar la ejecución local, evitando problemas de seguridad con los módulos de JavaScript (ES Modules).

## Inicio Rápido (Cómo Jugar)

### Ejecución Local

Debido a que el código JavaScript está en un solo archivo y **no utiliza módulos (`import/export`)**, puedes ejecutar el juego directamente desde tu navegador:

1.  Descarga o clona el repositorio.
2.  Abre el archivo **`index.html`** directamente en tu navegador (Chrome, Firefox, Edge, etc.). La ruta se verá como `file:///.../index.html`.

### Recomendación (Práctica Estándar)

Aunque la ejecución directa funciona, la mejor práctica en desarrollo web es usar un servidor local para simular un entorno de producción (por ejemplo, usando la extensión **Live Server** de VS Code), ya que las restricciones de seguridad son más parecidas al mundo real.

### Jugar / Flujo Principal

1.  **Crear Partida:** Ingresa tu nombre de jugador, un nombre para la partida y haz clic en "Crear Partida".
2.  **Unirse:** Busca una partida existente y haz clic en "Unirse" para entrar al Lobby.
3.  **Inicio de Partida:** Cuando haya entre 5 y 10 jugadores, el **Líder** (dueño de la partida) puede presionar "Comenzar Partida".

## Componentes Clave

El archivo **`script.js`** maneja todo el estado del juego mediante las siguientes funciones y constantes:

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
