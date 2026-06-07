(function () {
  const {
    SHELF_DEFS,
    BASE_SCORE,
    MISTAKE_PENALTY,
    REPUTATION_LOSS_PER_MISTAKE,
    REPUTATION_GAIN_PER_CORRECT,
    UNFINISHED_TAPE_REPUTATION_LOSS,
    UNFINISHED_TAPE_SCORE_LOSS
  } = window.GameConstants;

  const { TapeGenerator, ArchiveRules, GameState, GameTimer, GameUI } = window;

  function initDay() {
    const state = GameState.getState();
    GameState.initShelfCounts();

    const tapeCount = 4 + Math.floor(state.day * 0.8);
    state.tapes = TapeGenerator.generateTapeBatch(state.day, tapeCount);
    GameState.clearCurrentTape();

    state.maxTime = Math.max(40, 100 - (state.day - 1) * 6);
    state.timeLeft = state.maxTime;

    state.paused = false;
    GameUI.updatePauseButton(false);

    GameUI.updateStats(state);
    GameUI.renderShelves(state, handleDrop);
    GameState.getNextTape();
    GameUI.renderCurrentTape(GameState.getState());
    startTimer();

    GameUI.addMessage(`═══ 第 ${state.day} 夜开始 · ${tapeCount} 盘磁带待整理 ═══`, 'system');
    GameUI.addMessage(`时间限制: ${Math.ceil(state.maxTime / 10)} 秒`, 'info');
  }

  function startTimer() {
    GameTimer.setCallbacks(onTimerTick);
    GameTimer.start();
  }

  function onTimerTick() {
    const state = GameState.getState();
    if (state.paused || state.gameOver) return false;

    state.timeLeft -= 0.5;
    GameUI.updateTimerBar(state.timeLeft, state.maxTime);

    if (state.timeLeft <= 0) {
      handleTimeExpired();
      return true;
    }
    return false;
  }

  function handleTimeExpired() {
    const state = GameState.getState();
    const remaining = GameState.getRemainingTapesCount();

    if (remaining > 0) {
      GameUI.addMessage('⚠ 时间耗尽! 未整理的磁带被退回处理中心', 'warning');
      state.reputation = Math.max(0, state.reputation - remaining * UNFINISHED_TAPE_REPUTATION_LOSS);
      state.score = Math.max(0, state.score - remaining * UNFINISHED_TAPE_SCORE_LOSS);
      state.mistakes++;
      GameUI.updateStats(state);

      if (state.mistakes >= state.maxMistakes || state.reputation <= 0) {
        endGame('时间耗尽且未完成整理');
        return;
      }
    }
    endNight();
  }

  function handleDrop(shelfId, shelfEl) {
    const state = GameState.getState();
    if (!state.currentTape || state.paused || state.gameOver) return;

    const tape = state.currentTape;
    const correctShelf = ArchiveRules.determineCorrectShelf(tape);

    if (shelfId === correctShelf) {
      GameUI.flashShelfCorrect(shelfEl);

      const timeBonus = Math.floor(state.timeLeft / 10);
      const earned = BASE_SCORE + timeBonus;
      state.score += earned;
      state.reputation = Math.min(100, state.reputation + REPUTATION_GAIN_PER_CORRECT);
      GameState.incrementShelfCount(shelfId);

      const shelfName = SHELF_DEFS.find(s => s.id === shelfId).name;
      GameUI.addMessage(`✓ 磁带 ${tape.id} 正确归档于 ${shelfName} (+${earned}分)`, 'success');
    } else {
      GameUI.flashShelfWrong(shelfEl);

      state.mistakes++;
      state.reputation = Math.max(0, state.reputation - REPUTATION_LOSS_PER_MISTAKE);
      state.score = Math.max(0, state.score - MISTAKE_PENALTY);

      const correctName = SHELF_DEFS.find(s => s.id === correctShelf).name;
      GameUI.addMessage(`✗ 磁带 ${tape.id} 归档错误! 应放入 ${correctName} (-${MISTAKE_PENALTY}分)`, 'error');

      if (state.mistakes >= state.maxMistakes) {
        endGame('失误过多');
        return;
      }
    }

    GameState.clearCurrentTape();
    GameUI.updateStats(state);
    GameUI.renderShelves(state, handleDrop);

    if (state.tapes.length === 0 && !state.currentTape) {
      setTimeout(endNight, 600);
    } else {
      setTimeout(() => {
        GameState.getNextTape();
        GameUI.renderCurrentTape(GameState.getState());
      }, 300);
    }
  }

  function startGame() {
    GameUI.hideOverlay(GameUI.ELEMENT_IDS.START_OVERLAY);
    initDay();
  }

  function endNight() {
    const state = GameState.getState();
    if (state.gameOver) return;
    GameTimer.stop();

    const totalStored = GameState.getTotalStored();
    GameUI.setNightSummary(state.day, state, totalStored);
    GameUI.showOverlay(GameUI.ELEMENT_IDS.NIGHT_OVERLAY);
  }

  function nextNight() {
    GameUI.hideOverlay(GameUI.ELEMENT_IDS.NIGHT_OVERLAY);
    const state = GameState.getState();
    state.day++;
    initDay();
  }

  function endGame(reason) {
    const state = GameState.getState();
    state.gameOver = true;
    GameTimer.stop();

    const totalStored = GameState.getTotalStored();
    GameUI.setGameOverSummary(reason, state, totalStored);
    GameUI.showOverlay(GameUI.ELEMENT_IDS.GAMEOVER_OVERLAY);
    GameUI.addMessage(`═══ 雇佣终止 ═══`, 'error');
  }

  function resetGame() {
    GameState.reset();
    GameUI.hideOverlay(GameUI.ELEMENT_IDS.GAMEOVER_OVERLAY);
    GameUI.clearMessages();
    initDay();
  }

  function togglePause() {
    const state = GameState.getState();
    state.paused = !state.paused;
    GameUI.updatePauseButton(state.paused);
    if (state.paused) {
      GameUI.addMessage('⏸ 工作暂停', 'system');
    } else {
      GameUI.addMessage('▶ 工作恢复', 'system');
    }
  }

  function showHelp() {
    const state = GameState.getState();
    if (!state.paused && state.currentTape) {
      state.paused = true;
      GameUI.updatePauseButton(true);
    }
    GameUI.showOverlay(GameUI.ELEMENT_IDS.HELP_OVERLAY);
  }

  function closeHelp() {
    GameUI.hideOverlay(GameUI.ELEMENT_IDS.HELP_OVERLAY);
  }

  window.GameFlow = {
    startGame,
    nextNight,
    resetGame,
    togglePause,
    showHelp,
    closeHelp,
    initDay
  };

  window.startGame = startGame;
  window.nextNight = nextNight;
  window.resetGame = resetGame;
  window.closeHelp = closeHelp;
})();
