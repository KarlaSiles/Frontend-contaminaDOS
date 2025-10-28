import { URL_BASE, POLLING_RATE, setGameState, elements, currentGameId, currentActivePlayer, pollingInterval, gameData, allRoundsData } from './api.js';
import { displayLog } from './ui.js';
import { updateLobby } from './lobby.js';
import { llamarAPI } from './ui.js';
import {fetchAllRoundsData} from './rounds.js'
import { renderGameView } from './renderGame.js';



// =================================================================
// LÓGICA DE NAVEGACIÓN Y POLLING          MODULO 3  = navigation.js
// =================================================================
/**
 * Aquí lo que se va hacer es cambiar las vistas y hacer el polling para actualizar el lobby o el juego
 */


// Cambia a la vista de lobby y comienza el polling
export function goToLobby(gameId, activePlayerName) {
    setGameState({
        currentGameId: gameId,
        currentActivePlayer: activePlayerName
    });

    elements.initialView.style.display = 'none';
    elements.gameView.style.display = 'none';
    elements.lobbyView.style.display = 'block';

    document.getElementById('lobby-title').textContent = 
        `LOBBY`;

    if (pollingInterval) clearInterval(pollingInterval);

    updateLobby();
    setGameState({
        pollingInterval: setInterval(updateLobby, POLLING_RATE)
    });

    displayLog(`Lobby iniciado. Polling cada ${POLLING_RATE / 1000}s.`, 'success', false);
}

// Cambia a la vista de juego y comienza el polling de juego/ronda
export function goToGame(gameId, activePlayerName, fetchedGameData) {
    setGameState({
        currentGameId: gameId,
        currentActivePlayer: activePlayerName,
        gameData: fetchedGameData
    });

    if (pollingInterval) clearInterval(pollingInterval);

    elements.initialView.style.display = 'none';
    elements.lobbyView.style.display = 'none';
    elements.gameView.style.display = 'block';

    // Inicia el polling del estado del juego
    updateGameStatus();
    setGameState({
        pollingInterval: setInterval(updateGameStatus, POLLING_RATE)
    });

    displayLog(`Partida Iniciada.`, 'success', false);
}

/**
 * Función de polling principal una vez que el juego comienza
 * Aqui se obtiene el estodo del juego y de la ronda actual, y se renderiza la vista
 */
export async function updateGameStatus() {
    if (!currentGameId) return;

    const URL_GAME_INFO = `${URL_BASE}/${currentGameId}`;//llama a la api /games/{gameId}
    const playerName = elements.playerNameInput.value.trim();// Nombre del jugador actual
    const password = elements.passwordInput.value.trim();// Contraseña si existe

    const customHeaders = { 'player': playerName };
    if (password) { customHeaders['password'] = password; }

    // 1. Obtener estado del juego(GET /games/{gameId})
    const gameResult = await llamarAPI(URL_GAME_INFO, 'GET', null, customHeaders);
    if (!gameResult.success) return;

    setGameState({ gameData: gameResult.data.data }); 


    // 2. Obtener TODAS las rondas y la ronda actual (usando gameData.currentRound)
    const roundData = await fetchAllRoundsData(currentGameId, playerName, password, gameData);

    const currentDecade = allRoundsData.length > 0 ? allRoundsData.length : 1;

    // 3. Renderizar la vista
    renderGameView(gameData, roundData, currentDecade);
}