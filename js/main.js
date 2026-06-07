(function () {
  const { GameUI, GameFlow, ArchiveRules } = window;

  function initEventListeners() {
    document.getElementById(GameUI.ELEMENT_IDS.BTN_PAUSE).addEventListener('click', GameFlow.togglePause);
    document.getElementById('btn-help').addEventListener('click', GameFlow.showHelp);
  }

  function init() {
    const state = window.GameState.getState();
    window.GameState.initShelfCounts();
    GameUI.renderShelves(state, () => {});
    initEventListeners();
    window.runArchiveTests = ArchiveRules.runArchiveTests;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
