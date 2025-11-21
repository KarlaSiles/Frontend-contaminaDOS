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

    
    let params = { page: 0 };

    // Filtro por nombre del input principal
    if (gameName.length >= 3) params.name = gameName;

    // Filtro del menú
    if (filterName.value.length >= 3)
        params.name = filterName.value.trim();

    if (filterLobby.checked)
        params.status = "lobby";

    if (filterStarted.checked)
        params.status = "rounds";

    if (filterEnded.checked)
      params.status = "ended";


    // Construcción de la URL
    const URL_BUSCAR = `${URL_BASE}?${new URLSearchParams(params).toString()}`;

    const result = await llamarAPI(URL_BUSCAR, 'GET', null, { player: playerName });

    elements.resultsDiv.innerHTML = '';
    if (!result.success) {
        displayLog(`Error buscando partidas: ${result.error}`, 'error');
        return;
    }

    const games = result.data.data || [];
    if (games.length === 0) {
        elements.resultsDiv.innerHTML = '<div>No se encontraron partidas.</div>';
        return;
    }

    displayLog(`${games.length} partidas encontradas.`, 'success');

    games.forEach(game => {
        const item = document.createElement("div");
        item.className = "game-item";
        item.innerHTML = `
            <div class="game-info">
                <div class="game-name">${game.name}</div>
                <div class="game-status">
                    Estado: ${game.status} — Jugadores: ${game.players.length}
                </div>
            </div>
            <button class="btn-join-list" data-game-id="${game.id}">
                Unirse
            </button>
        `;
        elements.resultsDiv.appendChild(item);
    });

    document.querySelectorAll('.btn-join-list').forEach(btn =>
        btn.addEventListener('click', handleJoinGame)
    );
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


// =====================
// MANEJO DEL FILTRO
// =====================
const btnFilter = document.getElementById("btn-filter");
const filterMenu = document.getElementById("filter-menu");
const filterEnded = document.getElementById("filter-ended");
const filterName = document.getElementById("filter-name");
const filterLobby = document.getElementById("filter-lobby");
const filterStarted = document.getElementById("filter-started");
const btnApplyFilter = document.getElementById("btn-apply-filter");

btnFilter.addEventListener("click", () => {
    filterMenu.style.display = filterMenu.style.display === "none" ? "block" : "none";
});



const filterChecks = [filterLobby, filterStarted, filterEnded];

filterChecks.forEach(check => {
    check.addEventListener("change", () => {
        if (check.checked) {
            filterChecks.forEach(other => {
                if (other !== check) other.checked = false;
            });
        }
    });
});
