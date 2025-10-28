import { URL_BASE, setGameState } from './api.js';
import { llamarAPI } from './ui.js';

export async function fetchAllRoundsData(gameId, playerName, password, fetchedGameData) {
    const URL_ROUNDS = `${URL_BASE}/${gameId}/rounds`;
    const customHeaders = { 'player': playerName };
    if (password) customHeaders['password'] = password;

    const result = await llamarAPI(URL_ROUNDS, 'GET', null, customHeaders);

    if (result.success && result.data.data) {
        const rounds = result.data.data;

        let activeRound = null;
        const currentRoundIdFromGame = fetchedGameData.currentRound;

        if (currentRoundIdFromGame) {
            activeRound = rounds.find(r => r.id === currentRoundIdFromGame);
        }

        if (!activeRound && rounds.length > 0) {
            activeRound = rounds[rounds.length - 1];
        }

        // Actualiza el estado global
        setGameState({
            allRoundsData: rounds,
            currentRoundId: activeRound ? activeRound.id : null,
            currentRoundData: activeRound
        });

        return activeRound;
    }

    // por si fallara la llamada o no hay datos
    setGameState({
        allRoundsData: [],
        currentRoundId: null,
        currentRoundData: null
    });

    return null;
}

export function calculateScoreFromRounds(allRoundsData) {
    let scoreExemplar = 0;
    let scoreEnemy = 0;

    if (allRoundsData && allRoundsData.length > 0) {
        allRoundsData.forEach(round => {
            if (round.status === 'ended') {
                if (round.result === 'citizens') scoreExemplar++;
                else if (round.result === 'enemies') scoreEnemy++;
            }
        });
    }

    return { scoreExemplar, scoreEnemy };
}

export function getRequiredGroupSize(playerCount, decade) {
    const table = {
        1: { 5: 2, 6: 2, 7: 2, 8: 3, 9: 3, 10: 3 },
        2: { 5: 3, 6: 3, 7: 3, 8: 4, 9: 4, 10: 4 },
        3: { 5: 2, 6: 4, 7: 3, 8: 4, 9: 4, 10: 4 },
        4: { 5: 3, 6: 3, 7: 4, 8: 5, 9: 5, 10: 5 },
        5: { 5: 3, 6: 4, 7: 4, 8: 5, 9: 5, 10: 5 }
    };
    const d = Math.min(decade, 5);
    return table[d] ? table[d][playerCount] || 2 : 2;
}
