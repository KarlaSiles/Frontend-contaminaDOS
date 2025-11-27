// =================================================================
// CONFIGURACIÓN Y ESTADO GLOBAL                  MODULO 1  = api.js
// =================================================================


export let URL_BASE = null;
export const POLLING_RATE = 5000;

// Estado global
export let currentGameId = null;
export let currentActivePlayer = null;
export let pollingInterval = null;
export let gameData = null;
export let currentRoundId = null;
export let currentRoundData = null;
export let allRoundsData = [];
export let selectedGroup = [];

// Elementos del DOM
export const elements = {
  initialView: document.getElementById('initial-view'),
  lobbyView: document.getElementById('lobby-view'),
  gameView: document.getElementById('game-view'),
  resultsDiv: document.getElementById('results'),
  btnStartGame: document.getElementById('btn-start-game'),
  popupMessage: document.getElementById('popup-message'),
  victoryMessage: document.getElementById('victory-message'),
  playerNameInput: document.getElementById('playerName'),
  passwordInput: document.getElementById('password')
};

// Función para establecer la URL
export function setApiUrl(newUrl) {
  // Acepta URLs que comienzan con http:// o https://
  const regex = /^https?:\/\//i;

  if (newUrl && regex.test(newUrl)) {
    // Quita cualquier / final
    const cleanUrl = newUrl.replace(/\/+$/, '');

    // Construye la ruta base
    URL_BASE = `${cleanUrl}/api/games`;

    console.log("URL configurada:", URL_BASE);

    // Guarda solo la raíz en localStorage
    localStorage.setItem('apiUrl', cleanUrl);
  } else {
    console.warn("URL inválida:", newUrl);
  }
}


// Recuperar la URL guardada al cargar el módulo
const storedUrl = localStorage.getItem('apiUrl');
if (storedUrl) {
  URL_BASE = storedUrl;
  console.log("URL API cargada", URL_BASE);
}

export function setGameState(updates) {
  if (updates.currentGameId !== undefined) currentGameId = updates.currentGameId;
  if (updates.currentActivePlayer !== undefined) currentActivePlayer = updates.currentActivePlayer;
  if (updates.pollingInterval !== undefined) pollingInterval = updates.pollingInterval;
  if (updates.gameData !== undefined) gameData = updates.gameData;
  if (updates.currentRoundId !== undefined) currentRoundId = updates.currentRoundId;
  if (updates.currentRoundData !== undefined) currentRoundData = updates.currentRoundData;
  if (updates.allRoundsData !== undefined) allRoundsData = updates.allRoundsData;
  if (updates.selectedGroup !== undefined) selectedGroup = updates.selectedGroup;
}


