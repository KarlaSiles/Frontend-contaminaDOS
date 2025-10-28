// =================================================================
// LÓGICA DE VISTAS INICIALES Y UNIÓN A JUEGO     MODULO 7  = main.js
// =================================================================
import { URL_BASE, elements, currentGameId } from './api.js';
import { validateInputs, displayLog, showPopup} from './ui.js';
import { llamarAPI } from './ui.js';
import { goToLobby } from './navigation.js';
import { setApiUrl} from './api.js';

const apiInput = document.getElementById('apiUrl');
const saveApiBtn = document.getElementById('btn-save-api');
const apiStatus = document.getElementById('api-status');

// Mostrar la URL guardada (si existe)
if (URL_BASE) {
  apiInput.value = URL_BASE;
  apiStatus.textContent = "Usando URL guardada: " + URL_BASE;
} else {
  apiStatus.textContent = "Ninguna URL guardada";
}

// Guardar nueva URL al hacer clic
saveApiBtn.addEventListener('click', () => {
  const newUrl = apiInput.value.trim();
  if (newUrl && newUrl.startsWith('http')) {
    setApiUrl(newUrl);
    apiStatus.textContent = "Se configuró la URL " + newUrl;
    alert("URL guardada bien");
  } else {
    alert("Ingrese una URL válida que empiece con http o https");
  }
});


// CREAR PARTIDA 
document.getElementById('btn-create').addEventListener('click', async () => {
  const gameName = document.getElementById('gameName').value.trim();
  const playerName = elements.playerNameInput.value.trim();
  const password = elements.passwordInput.value.trim();

  if (!validateInputs(gameName, 3, 20, 'Partida') ||
      !validateInputs(playerName, 3, 20, 'Jugador')) return;
  if (password && !validateInputs(password, 3, 20, 'Contraseña')) return;

  const createData = { name: gameName, owner: playerName };
  if (password) createData.password = password;

  const result = await llamarAPI(URL_BASE, 'POST', createData);
  if (result.success) {
    const newGameId = result.data.data.id;
    displayLog(`La partida se ha creado (ID: ${newGameId}).`, 'success', false);
    goToLobby(newGameId, playerName);
  } else {
    displayLog(`Fallo al crear la partida [Status ${result.status}]: ${result.error}`, 'error', false);
  }
});

// BUSCAR PARTIDAS 
document.getElementById('btn-search').addEventListener('click', async () => {
  const gameName = document.getElementById('gameName').value.trim();
  const playerName = elements.playerNameInput.value.trim();

  if (!validateInputs(playerName, 3, 20, 'Jugador')) return;

  const params = { status: 'lobby', page: 0 };
  if (gameName.length > 0) {
    if (!validateInputs(gameName, 3, 20, 'Partida')) return;
    params.name = gameName;
  }

  const URL_BUSCAR = `${URL_BASE}?${new URLSearchParams(params).toString()}`;
  const result = await llamarAPI(URL_BUSCAR, 'GET', null, { player: playerName });

  elements.resultsDiv.innerHTML = '';
  if (result.success) {
    const games = result.data.data || [];
    if (games.length > 0) {
      displayLog(`${games.length} partidas encontradas.`, 'success', false);
      games.forEach(game => {
        const itemHtml = document.createElement('div');
        itemHtml.className = 'game-item';

        // Determinar si la partida está llena
        const isFull = game.players.length >= 10;
        const buttonText = isFull ? 'Partida llena' : 'Unirse';
        const buttonDisabled = isFull ? 'disabled' : '';

        itemHtml.innerHTML = `
          <div class="game-info">
            <div class="game-name">${game.name}</div>
            <div class="game-status">
              Creador: ${game.owner} (${game.players.length}/10 jugadores)
            </div>
          </div>
          <button class="btn-join-list" 
                  data-game-id="${game.id}" 
                  data-player-count="${game.players.length}"
                  ${buttonDisabled}>
            ${buttonText}
          </button>
        `;
        elements.resultsDiv.appendChild(itemHtml);
      });

      // Agregar eventos solo a los botones habilitados
      document.querySelectorAll('.btn-join-list:not([disabled])')
        .forEach(btn => btn.addEventListener('click', handleJoinGame));

    } else {
      displayLog('No se han encontrado partidas con ese nombre', 'info', false);
    }
  } else {
    displayLog(`Fallo al buscar partida [Status ${result.status}]: ${result.error}`, 'error', false);
  }
});

// UNIRSE A PARTIDA 
async function handleJoinGame(event) {
  const button = event.target;
  const gameId = button.dataset.gameId;
  const playerName = elements.playerNameInput.value.trim();
  const password = elements.passwordInput.value.trim();

  if (!validateInputs(playerName, 3, 20, 'Jugador')) return;

  const URL_UNIRSE = `${URL_BASE}/${gameId}`;
  const joinHeaders = { player: playerName };
  if (password) joinHeaders['password'] = password;

  const result = await llamarAPI(URL_UNIRSE, 'PUT', { player: playerName, password }, joinHeaders);
  if (result.success) {
    displayLog(`Se ha unido a la partida '${gameId}'.`, 'success');
    goToLobby(gameId, playerName);
  } else {
    displayLog(`Fallo al unirse [Status ${result.status}]: ${result.error}`, 'error');
  }
}

//  INICIAR PARTIDA 
elements.btnStartGame.addEventListener('click', async () => {
  if (!currentGameId) return;

  const playerName = elements.playerNameInput.value.trim();
  const password = elements.passwordInput.value.trim();

  const URL_START = `${URL_BASE}/${currentGameId}/start`;
  const startHeaders = { player: playerName };
  if (password) startHeaders['password'] = password;

  const result = await llamarAPI(URL_START, 'HEAD', null, startHeaders);
  if (result.success) displayLog(`Se inició la partida`, 'success');
  else displayLog(`Fallo al iniciar la partida [${result.status}]: ${result.error}`, 'error');
});

