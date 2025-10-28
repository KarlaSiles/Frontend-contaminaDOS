// =================================================================
//  LÓGICA DE JUEGO POR FASE (API CALLS)    MODULO 4  = gameLogic.js
// =================================================================
import { URL_BASE, currentGameId, currentRoundId, currentRoundData, gameData, allRoundsData, selectedGroup, elements, setGameState } from './api.js';
import { showPopup } from './ui.js';
import { llamarAPI } from './ui.js'; // si decides moverlo aquí
import { updateGameStatus } from './navigation.js';
import {getRequiredGroupSize} from './rounds.js'


/**
 * Envía la propuesta de grupo (PATCH /rounds/{roundId}). Solo el líder puede hacerlo.
 */
export async function proposeGroup() {
    if (!currentRoundId || !currentRoundData || !gameData) return;

    const playerCount = gameData.players.length;// Número total de jugadores
    const decade = allRoundsData.length || 1; // Década actual
    const groupSize = getRequiredGroupSize(playerCount, decade);// tamaño de grupo requerido

    if (selectedGroup.length !== groupSize) {//Si el tamaño seleccionado no correcto, muestra error
        showPopup(`Error: El grupo requiere exactamente ${groupSize} jugadores (Década ${decade}, ${playerCount} jugadores). Seleccionaste ${selectedGroup.length}.`);
        return;
    }

    const URL_PROPOSE = `${URL_BASE}/${currentGameId}/rounds/${currentRoundId}`;// URL para proponer grupo (PATCH /rounds/{roundId})
    const playerName = elements.playerNameInput.value.trim();// Nombre del jugador actual
    const password = elements.passwordInput.value.trim();// Contraseña si existe

    const customHeaders = { 'player': playerName };
    if (password) { customHeaders['password'] = password; }

    const bodyData = { group: selectedGroup };// se envía el grupo seleccionado en el cuerpo

    const result = await llamarAPI(URL_PROPOSE, 'PATCH', bodyData, customHeaders);// Llama a la API

    if (result.success) {// Si fue exitoso
        showPopup('Propuesta de grupo enviada.', 4000);
        setGameState({ selectedGroup: [] }); //set
        setTimeout(() => { updateGameStatus(); }, 500);
    }
}

/**
 * Envía el voto de aprobación/rechazo (POST /rounds/{roundId}). Para todos los jugadores.
 */
export async function voteForGroup(vote) {
    if (!currentRoundId || !currentRoundData) return;

    const URL_VOTE = `${URL_BASE}/${currentGameId}/rounds/${currentRoundId}`;// URL para votar (POST /rounds/{roundId})
    const playerName = elements.playerNameInput.value.trim();
    const password = elements.passwordInput.value.trim();

    const customHeaders = { 'player': playerName };
    if (password) { customHeaders['password'] = password; }

    const bodyData = { vote: vote }; // voto: true (aprobar) o false (rechazar)

    const result = await llamarAPI(URL_VOTE, 'POST', bodyData, customHeaders);// Llama a la API

    if (result.success) {
        showPopup(`Voto emitido: ${vote ? 'Aprobado' : 'Rechazado'}.`, 4000);
        // No se detiene el polling, solo se actualiza el estado para reflejar el voto.
        updateGameStatus();
    }
}

/**
 * Envía la acción de colaborar/sabotear (PUT /rounds/{roundId}). Solo para miembros del grupo.
 */
export async function submitAction(action) {
    if (!currentRoundId || !currentRoundData) return;

    const URL_ACTION = `${URL_BASE}/${currentGameId}/rounds/${currentRoundId}`;// URL para enviar acción (PUT /rounds/{roundId})
    const playerName = elements.playerNameInput.value.trim();
    const password = elements.passwordInput.value.trim();

    const customHeaders = { 'player': playerName };
    if (password) { customHeaders['password'] = password; }

    const bodyData = { action: action };// acción: true (colaborar) o false (sabotear)

    const result = await llamarAPI(URL_ACTION, 'PUT', bodyData, customHeaders);// Llama a la API

    if (result.success) {
        showPopup(`Contribución registrada: ${action ? 'Colaboración' : 'Sabotaje'}.`, 4000);
        updateGameStatus();
    }
}
