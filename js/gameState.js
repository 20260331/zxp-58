(function () {
  const { SHELF_DEFS, MAX_MISTAKES } = window.GameConstants;

  function createInitialState() {
    return {
      day: 1,
      reputation: 100,
      mistakes: 0,
      maxMistakes: MAX_MISTAKES,
      score: 0,
      tapes: [],
      currentTape: null,
      shelfCounts: {},
      timeLeft: 100,
      maxTime: 100,
      paused: false,
      gameOver: false
    };
  }

  let state = createInitialState();

  function getState() {
    return state;
  }

  function setState(newState) {
    state = Object.assign(state, newState);
    return state;
  }

  function reset() {
    state = createInitialState();
    return state;
  }

  function initShelfCounts() {
    SHELF_DEFS.forEach(s => {
      if (state.shelfCounts[s.id] === undefined) {
        state.shelfCounts[s.id] = 0;
      }
    });
  }

  function getRemainingTapesCount() {
    return state.tapes.length + (state.currentTape ? 1 : 0);
  }

  function getNextTape() {
    if (!state.currentTape && state.tapes.length > 0) {
      state.currentTape = state.tapes.shift();
    }
    return state.currentTape;
  }

  function clearCurrentTape() {
    state.currentTape = null;
  }

  function incrementShelfCount(shelfId) {
    state.shelfCounts[shelfId] = (state.shelfCounts[shelfId] || 0) + 1;
  }

  function getTotalStored() {
    return Object.values(state.shelfCounts).reduce((a, b) => a + b, 0);
  }

  window.GameState = {
    getState,
    setState,
    reset,
    initShelfCounts,
    getRemainingTapesCount,
    getNextTape,
    clearCurrentTape,
    incrementShelfCount,
    getTotalStored
  };
})();
