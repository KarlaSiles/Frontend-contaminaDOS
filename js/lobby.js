// =================================================================
//  LÓGICA DE POLLING (ACTUALIZAR LOBBY)        MODULO 6  = lobby.js
// =================================================================
import { URL_BASE, currentGameId, elements, setGameState, pollingInterval } from './api.js';
import { displayLog } from './ui.js';
import { llamarAPI } from './ui.js';
import { goToGame } from './navigation.js';

export async function updateLobby() {
    if (!currentGameId) return;

    const URL_GAME_INFO = `${URL_BASE}/${currentGameId}`;
    const playerName = elements.playerNameInput.value.trim();
    const password = elements.passwordInput.value.trim();

    const customHeaders = { 'player': playerName };
    if (password) { customHeaders['password'] = password; }

    const result = await llamarAPI(URL_GAME_INFO, 'GET', null, customHeaders);

    if (result.success) {
        const fetchedGameData = result.data.data;

        // Transición a Vista de Juego
        if (fetchedGameData.status !== 'lobby') {
            displayLog(`El juego ha cambiado a estado: ${fetchedGameData.status}. Polling de Lobby detenido.`, 'info');
            if (pollingInterval) clearInterval(pollingInterval);
            setGameState({ pollingInterval: null });
            goToGame(currentGameId, playerName, fetchedGameData);
            return;
        }

        const playerListDiv = document.getElementById('lobby-player-list');
        const playerCount = fetchedGameData.players.length;

        const isOwner = (playerName === fetchedGameData.owner);
        const canStart = (playerCount >= 5 && playerCount <= 10);

        if (isOwner) {
            elements.btnStartGame.style.display = 'block';
            elements.btnStartGame.disabled = !canStart;
            elements.btnStartGame.textContent = canStart
                ? 'JUGAR'
                : `Esperando jugadores.`;
        } else {
            elements.btnStartGame.style.display = 'none';
        }

        document.getElementById('player-count').textContent = playerCount;
        document.getElementById('player-max').textContent = 10;

        // Lista de jugadores
        playerListDiv.innerHTML = '';
        fetchedGameData.players.forEach(name => {
            const isOwner = (name === fetchedGameData.owner);
            const playerElement = document.createElement('div');
            playerElement.className = `player-item ${isOwner ? 'owner' : ''}`;
            playerElement.textContent = `${name} ${isOwner ? '(OWNER)' : ''}`;
            playerListDiv.appendChild(playerElement);
        });

    } else {
        displayLog(`Error al actualizar el lobby [Status ${result.status}]: ${result.error}. Deteniendo polling.`, 'error');
        if (pollingInterval) clearInterval(pollingInterval);
        setGameState({ pollingInterval: null });
    }
}

