// =================================================================
// LÓGICA DE VISTA DE JUEGO (RENDERIZADO)  MODULO 5  = renderGame.js
// =================================================================

import { 
    elements, 
    currentActivePlayer, 
    currentRoundData, 
    gameData, 
    allRoundsData, 
    selectedGroup, 
    setGameState 
} from './api.js';
import { showPopup } from './ui.js';
import { proposeGroup, voteForGroup, submitAction } from './gamelogic.js';
import { getRequiredGroupSize, calculateScoreFromRounds } from './rounds.js';
import { updateGameStatus } from './navigation.js';
import { typeWriter } from './typewriter.js';




/**
 * Maneja el clic en un jugador para selección/deselección en la fase de propuesta.
 */
export function handlePlayerClick(event) {
    if (!gameData || !currentRoundData) return;

    const isLeader = (currentActivePlayer === currentRoundData.leader);
    const isProposalPhase = (currentRoundData.status === 'waiting-on-leader' && currentRoundData.group.length === 0);

    if (!isLeader || !isProposalPhase) return;

    const playerName = event.currentTarget.dataset.playername;
    const playerCount = gameData.players.length;
    const decade = allRoundsData.length || 1;
    const groupSize = getRequiredGroupSize(playerCount, decade);

    // Creamos una copia de selectedGroup para actualizar de manera segura
    let updatedGroup = [...selectedGroup];

    if (updatedGroup.includes(playerName)) {
        updatedGroup = updatedGroup.filter(name => name !== playerName);
    } else {
        if (updatedGroup.length < groupSize) {
            updatedGroup.push(playerName);
        } else {
            showPopup(`El tamaño del grupo es ${groupSize}. Usted ya ha seleccionado el máximo de jugadores.`);
        }
    }

    // Actualizamos el estado global
    setGameState({ selectedGroup: updatedGroup });

    // Refresca la UI
    updateGameStatus();
}

/**
 * Renderiza la vista de juego en curso.
 */
export function renderGameView(gameData, roundData, currentDecade) {
    const playerListDiv = document.getElementById('game-player-list');
    const controlsDiv = document.getElementById('game-controls');
    const controlsInfo = document.getElementById('controls-info');
    const controlsButtons = document.getElementById('controls-buttons');
    const victoryMessage = elements.victoryMessage;

    playerListDiv.innerHTML = '';
    controlsButtons.innerHTML = '';

    const currentLeader = roundData?.leader || null;
    const activePlayerIsEnemy = gameData.enemies.includes(currentActivePlayer);
    const activePlayerIsLeader = (currentActivePlayer === currentLeader);
    const activePlayerInGroup = roundData?.group.includes(currentActivePlayer) || false;

    const playerCount = gameData.players.length;
    const requiredGroupSize = getRequiredGroupSize(playerCount, currentDecade);

    // Cálculo de puntaje
    const { scoreExemplar, scoreEnemy } = calculateScoreFromRounds(allRoundsData);

    const hasExemplarWon = scoreExemplar >= 3;
    const hasEnemyWon = scoreEnemy >= 3;

    document.getElementById('score-ejemplar').textContent = scoreExemplar;
    document.getElementById('score-psicopata').textContent = scoreEnemy;

    // Estado de victoria
    victoryMessage.style.display = 'none';
    document.getElementById('game-status-bar').style.display = 'block';
    controlsDiv.style.display = 'block';

if (hasExemplarWon || hasEnemyWon) {
    const winner = hasExemplarWon ? 'EJEMPLARES (Verde)' : 'PSICÓPATAS (Rojo)';
    victoryMessage.textContent = `¡FIN DEL JUEGO! Ganaron los ${winner}`;
    victoryMessage.style.display = 'block';
    controlsDiv.style.display = 'none';
    document.getElementById('game-status-bar').style.display = 'none';

    // Transición esa del fondo
    if (hasEnemyWon) {
        document.body.classList.add('enemy-win');
    } else {
        document.body.classList.remove('enemy-win');
    }

    return;
}


    // Actualiza info del juego
    document.getElementById('current-decade').textContent = currentDecade;
    document.getElementById('game-player-count').textContent = playerCount;
document.getElementById('active-player-role').innerHTML = activePlayerIsEnemy
  ? `
    <div class="role-display">
        <img src="../img/psyco.png" alt="Psicópata" class="role-img">
        <span class="role-text enemy-text">PSICOPATA</span>
    </div>
  `
  : `
    <div class="role-display">
        <img src="../gft/citizen.gif" alt="Ciudadano ejemplar" class="role-img">
        <span class="role-text exemplar-text">EJEMPLAR</span>
    </div>
  `;


    if (roundData) {
        document.getElementById('current-phase').textContent = roundData.phase || 'N/A';
        controlsInfo.textContent = `Estado de Ronda: ${roundData.status}`;
    } else {
        document.getElementById('current-phase').textContent = 'Iniciando...';
        controlsInfo.textContent = 'Esperando la primera ronda...';
    }

    // Render botones según fase
    if (roundData) {
        if (roundData.status === 'waiting-on-leader') {
            if (activePlayerIsLeader) {
                typeWriter(controlsInfo, `Seleccione ${requiredGroupSize} jugadores para su grupo de trabajo.`);

                const btnPropose = document.createElement('button');
                btnPropose.id = 'btn-propose-group';
                btnPropose.textContent = `Proponer Grupo (${selectedGroup.length}/${requiredGroupSize})`;
                btnPropose.style.backgroundColor = '#007bff';
                btnPropose.disabled = (selectedGroup.length !== requiredGroupSize);
                btnPropose.onclick = proposeGroup;
                controlsButtons.appendChild(btnPropose);
            } else {
                typeWriter(controlsInfo, `El dirigente comunal ${currentLeader} se encuentra seleccionando su grupo de trabajo.`);

            }
        }

        else if (roundData.status === 'voting' && roundData.group.length > 0) {
            const votesCount = roundData.votes.filter(v => v != null).length;
            typeWriter(controlsInfo, `¿Acepta usted la propuesta del grupo: ${roundData.group.join(', ')}? (${votesCount}/${playerCount} han votado)`);


            const btnApprove = document.createElement('button');
            btnApprove.textContent = 'Apruebo';
            btnApprove.style.backgroundColor = '#28a745';
            btnApprove.onclick = () => voteForGroup(true);

            const btnReject = document.createElement('button');
            btnReject.textContent = 'Rechazo';
            btnReject.style.backgroundColor = '#dc3545';
            btnReject.onclick = () => voteForGroup(false);

            controlsButtons.appendChild(btnApprove);
            controlsButtons.appendChild(btnReject);
        }

else if (roundData.status === 'waiting-on-group' && roundData.group.length > 0) { 
    if (activePlayerInGroup) {
        typeWriter(controlsInfo, `Usted es parte del grupo de trabajo. Elija su acción.`);

        // Botón de colaborar siempre visible
        const btnCollaborate = document.createElement('button');
        btnCollaborate.textContent = 'COLABORAR';
        btnCollaborate.style.backgroundColor = '#17a2b8';
        btnCollaborate.onclick = () => submitAction(true);
        controlsButtons.appendChild(btnCollaborate);

        // Botón de sabotear solo para psicópatas 
        if (activePlayerIsEnemy) {
            const btnSabotage = document.createElement('button');
            btnSabotage.textContent = 'SABOTEAR';
            btnSabotage.style.backgroundColor = '#ffc107';
            btnSabotage.onclick = () => submitAction(false);
            controlsButtons.appendChild(btnSabotage);
        }

    } else {
        typeWriter(controlsInfo, `Esperando la acción del grupo seleccionado: ${roundData.group.join(', ')}...`);

    }
}

        else if (roundData.status === 'ended') {
            controlsInfo.textContent = `La década finalizó. Resultado: ${roundData.result}. Esperando nueva ronda`;
        } else {
            controlsInfo.textContent = `Estado de ronda: ${roundData.status}`;
        }
    }

    // Render jugadores
    gameData.players.forEach(playerName => {
        const isEnemy = gameData.enemies.includes(playerName);
        const isLeader = roundData && (playerName === currentLeader);
        const isInGroup = roundData && roundData.group.includes(playerName);

        let className = '';
        let label = '';

 if (isLeader) {
    label = '(Dirigente comunal)';
}

// Color del nombre
if (isEnemy) {
    className = 'color-enemy'; // rojo si es psicópata, aunque sea líder
} else {
    className = 'color-exemplar'; // color normal
}


        const isSelectable = roundData && activePlayerIsLeader && roundData.status === 'waiting-on-leader';
        const playerElement = document.createElement('div');
        playerElement.className = `game-player-item ${className} ${isSelectable ? 'selectable' : ''} ${selectedGroup.includes(playerName) ? 'selected-for-group' : ''}`;

        if (isSelectable) {
            playerElement.onclick = handlePlayerClick;
            playerElement.dataset.playername = playerName;
        }

        let statusIcon = '';
        if (isInGroup) statusIcon += `<span style="color: #17a2b8; font-weight: bold; margin-left: 10px;">[Incluído en el grupo]</span>`;
        playerElement.innerHTML = `<div>${playerName} ${label}</div><div>${statusIcon}</div>`;
        playerListDiv.appendChild(playerElement);
    });
}