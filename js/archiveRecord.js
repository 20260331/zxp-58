(function () {
  const STORAGE_KEY = 'duty_archive_records';
  const MAX_RECORDS = 10;

  function loadRecords() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveRecords(records) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('存档失败', e);
    }
  }

  function addRecord(record) {
    const records = loadRecords();
    record.timestamp = Date.now();
    records.unshift(record);
    while (records.length > MAX_RECORDS) records.pop();
    saveRecords(records);
    return records;
  }

  function getRecentRecords(count) {
    const records = loadRecords();
    return records.slice(0, count || MAX_RECORDS);
  }

  function clearRecords() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function buildNightRecord(state, options) {
    const { SHELF_DEFS } = window.GameConstants;
    const shelfBreakdown = {};
    SHELF_DEFS.forEach(s => {
      shelfBreakdown[s.id] = {
        name: s.name,
        color: s.color,
        count: state.shelfCounts[s.id] || 0
      };
    });

    return {
      type: options && options.gameOver ? 'game_over' : 'night_complete',
      day: state.day,
      score: state.score,
      reputation: state.reputation,
      mistakes: state.mistakes,
      maxMistakes: state.maxMistakes,
      correctCount: state.nightCorrectCount || 0,
      wrongCount: state.nightWrongCount || 0,
      totalTapes: state.nightTotalTapes || 0,
      shelfBreakdown: shelfBreakdown,
      endReason: options && options.reason ? options.reason : null,
      gameOver: !!(options && options.gameOver)
    };
  }

  window.ArchiveRecord = {
    addRecord,
    getRecentRecords,
    clearRecords,
    buildNightRecord,
    MAX_RECORDS
  };
})();
