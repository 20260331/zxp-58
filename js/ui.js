(function () {
  const { SHELF_DEFS, LABEL_COLORS, SMELLS } = window.GameConstants;
  const { randomChoice } = window.GameUtils;

  const ELEMENT_IDS = {
    DAY_DISPLAY: 'day-display',
    REPUTATION_DISPLAY: 'reputation-display',
    MISTAKES_DISPLAY: 'mistakes-display',
    SCORE_DISPLAY: 'score-display',
    TIMER_FILL: 'timer-fill',
    TAPE_CONTAINER: 'tape-container',
    INCOMING_COUNT: 'incoming-count',
    SHELVES_CONTAINER: 'shelves-container',
    MESSAGES_LOG: 'messages-log',
    BTN_PAUSE: 'btn-pause',
    START_OVERLAY: 'start-overlay',
    NIGHT_OVERLAY: 'night-overlay',
    NIGHT_TITLE: 'night-title',
    NIGHT_SUMMARY: 'night-summary',
    GAMEOVER_OVERLAY: 'gameover-overlay',
    GAMEOVER_SUMMARY: 'gameover-summary',
    HELP_OVERLAY: 'help-overlay',
    ARCHIVE_OVERLAY: 'archive-overlay',
    ARCHIVE_CONTENT: 'archive-content'
  };

  function $(id) {
    return document.getElementById(id);
  }

  function addMessage(text, type = 'info') {
    const log = $(ELEMENT_IDS.MESSAGES_LOG);
    const msg = document.createElement('div');
    msg.className = 'message ' + type;
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    msg.textContent = '[' + time + '] ' + text;
    log.insertBefore(msg, log.firstChild);
    while (log.children.length > 20) log.removeChild(log.lastChild);
  }

  function updateStats(state) {
    $(ELEMENT_IDS.DAY_DISPLAY).textContent = state.day;

    const rep = $(ELEMENT_IDS.REPUTATION_DISPLAY);
    rep.textContent = state.reputation;
    rep.className = 'stat-value' + (state.reputation <= 30 ? ' danger' : '');

    const mistakes = $(ELEMENT_IDS.MISTAKES_DISPLAY);
    mistakes.textContent = state.mistakes + ' / ' + state.maxMistakes;
    mistakes.className = 'stat-value' + (state.mistakes >= state.maxMistakes - 1 ? ' danger' : '');

    $(ELEMENT_IDS.SCORE_DISPLAY).textContent = state.score;
  }

  function updateTimerBar(timeLeft, maxTime) {
    const pct = (timeLeft / maxTime) * 100;
    $(ELEMENT_IDS.TIMER_FILL).style.width = Math.max(0, pct) + '%';
  }

  function updatePauseButton(paused) {
    $(ELEMENT_IDS.BTN_PAUSE).textContent = paused ? '继续' : '暂停';
  }

  function renderShelves(state, onDrop) {
    const container = $(ELEMENT_IDS.SHELVES_CONTAINER);
    container.innerHTML = '';

    SHELF_DEFS.forEach(shelf => {
      const el = document.createElement('div');
      el.className = 'shelf';
      el.dataset.shelfId = shelf.id;
      el.innerHTML = `
        <div class="shelf-name" style="color:${shelf.color};">${shelf.name}</div>
        <ul class="shelf-rules">
          ${shelf.rules.map(r => '<li>' + r + '</li>').join('')}
        </ul>
        <div class="shelf-count">已存: ${state.shelfCounts[shelf.id] || 0}</div>
      `;

      el.addEventListener('dragover', (e) => {
        e.preventDefault();
        el.classList.add('drag-over');
      });
      el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
      el.addEventListener('drop', (e) => {
        e.preventDefault();
        el.classList.remove('drag-over');
        if (typeof onDrop === 'function') {
          onDrop(shelf.id, el);
        }
      });

      container.appendChild(el);
    });
  }

  function flashShelfCorrect(shelfEl) {
    shelfEl.classList.add('correct');
    setTimeout(() => shelfEl.classList.remove('correct'), 500);
  }

  function flashShelfWrong(shelfEl) {
    shelfEl.classList.add('wrong');
    setTimeout(() => shelfEl.classList.remove('wrong'), 500);
  }

  function renderCurrentTape(state) {
    const container = $(ELEMENT_IDS.TAPE_CONTAINER);
    const countEl = $(ELEMENT_IDS.INCOMING_COUNT);

    if (!state.currentTape && state.tapes.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:60px 10px;font-size:9px;color:#555;">本夜任务完成<br><br>等待结算...</div>';
      countEl.textContent = '剩余: 0';
      return;
    }

    if (!state.currentTape) return;

    const tape = state.currentTape;
    const label = LABEL_COLORS[tape.labelColor];
    const smellObj = SMELLS[tape.smell];
    const smellHint = randomChoice(smellObj.hints);

    container.innerHTML = '';
    const tapeEl = document.createElement('div');
    tapeEl.className = 'tape';
    tapeEl.draggable = true;
    tapeEl.innerHTML = `
      <div class="tape-label" style="background:${label.hex};color:${label.text};">
        ${tape.id} · ${label.name}标签
      </div>
      <div class="tape-reels">
        <div class="reel"></div>
        <div class="reel"></div>
      </div>
      <div class="tape-info">
        气味: <span>${smellObj.name}</span> (${smellHint})<br>
        破损: 
        <div class="condition-bar">
          ${[1,2,3,4,5].map(i => `<div class="cond-cell ${i <= tape.condition ? 'filled' : ''} ${tape.condition <= 2 ? 'bad' : ''}"></div>`).join('')}
        </div>
        <br>背景描述:<br>
        <span style="color:#d0d0e8;">"${tape.context}"</span>
      </div>
    `;

    tapeEl.addEventListener('dragstart', (e) => {
      tapeEl.classList.add('dragging');
      e.dataTransfer.setData('text/plain', tape.id);
    });
    tapeEl.addEventListener('dragend', () => tapeEl.classList.remove('dragging'));

    container.appendChild(tapeEl);
    countEl.textContent = '剩余: ' + (state.tapes.length + 1);
  }

  function showOverlay(overlayId) {
    $(overlayId).classList.remove('hidden');
  }

  function hideOverlay(overlayId) {
    $(overlayId).classList.add('hidden');
  }

  function setNightSummary(day, state, totalStored) {
    $(ELEMENT_IDS.NIGHT_TITLE).textContent = `第 ${day} 夜 完成`;

    let summary = `
      本夜整理完成<br><br>
      当前得分: <span style="color:#66ff99;">${state.score}</span><br>
      声誉值: <span style="color:${state.reputation > 50 ? '#66ff99' : '#ff9966'};">${state.reputation}</span><br>
      失误次数: <span style="color:${state.mistakes > 1 ? '#ff6666' : '#e8e8f0'};">${state.mistakes} / ${state.maxMistakes}</span><br>
      累计归档磁带: <span style="color:#a8a8d8;">${totalStored}</span><br><br>
    `;

    if (day >= 2) {
      summary += `<span style="color:#ffcc66;">下一夜磁带数量增加，时间缩短。请做好准备。</span>`;
    } else {
      summary += `<span style="color:#66ff99;">继续加油，别让档案主管失望。</span>`;
    }

    $(ELEMENT_IDS.NIGHT_SUMMARY).innerHTML = summary;
  }

  function setGameOverSummary(reason, state, totalStored) {
    $(ELEMENT_IDS.GAMEOVER_SUMMARY).innerHTML = `
      原因: ${reason}<br><br>
      工作天数: <span style="color:#a8a8d8;">${state.day} 夜</span><br>
      最终得分: <span style="color:#66ff99;">${state.score}</span><br>
      累计归档: <span style="color:#ccaa44;">${totalStored} 盘磁带</span><br>
      最终声誉: <span style="color:#ff6666;">${state.reputation}</span><br><br>
      <span style="color:#888;">档案主管: "我们需要更可靠的人。"</span>
    `;
  }

  function clearMessages() {
    $(ELEMENT_IDS.MESSAGES_LOG).innerHTML = '';
  }

  function renderArchive() {
    const container = $(ELEMENT_IDS.ARCHIVE_CONTENT);
    const records = window.ArchiveRecord.getRecentRecords();

    if (!records || records.length === 0) {
      container.innerHTML = `
        <div class="archive-empty">
          <div style="font-size:10px;color:#6a6a8a;">档案库为空</div>
          <div style="font-size:8px;color:#5a5a7a;margin-top:8px;">
            完成至少一夜工作后，记录将自动存入此处。
          </div>
        </div>
      `;
      return;
    }

    let html = `<div class="archive-list">`;

    records.forEach((rec, idx) => {
      const dateStr = new Date(rec.timestamp).toLocaleString('zh-CN', {
        month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });

      const typeBadge = rec.gameOver
        ? `<span class="badge badge-danger">雇佣终止</span>`
        : `<span class="badge badge-good">夜间完成</span>`;

      const accuracy = (rec.correctCount + rec.wrongCount) > 0
        ? Math.round((rec.correctCount / (rec.correctCount + rec.wrongCount)) * 100)
        : 0;

      html += `
        <div class="archive-record ${rec.gameOver ? 'record-fired' : 'record-ok'}">
          <div class="record-header">
            <div class="record-day">第 ${rec.day} 夜</div>
            <div class="record-meta">
              ${typeBadge}
              <span class="record-date">${dateStr}</span>
            </div>
          </div>
          <div class="record-stats">
            <div class="record-stat">
              <span class="record-stat-label">得分</span>
              <span class="record-stat-value good">${rec.score}</span>
            </div>
            <div class="record-stat">
              <span class="record-stat-label">声誉</span>
              <span class="record-stat-value ${rec.reputation <= 30 ? 'danger' : ''}">${rec.reputation}</span>
            </div>
            <div class="record-stat">
              <span class="record-stat-label">失误</span>
              <span class="record-stat-value ${rec.mistakes > 1 ? 'danger' : ''}">${rec.mistakes}/${rec.maxMistakes}</span>
            </div>
            <div class="record-stat">
              <span class="record-stat-label">正确率</span>
              <span class="record-stat-value ${accuracy >= 80 ? 'good' : accuracy >= 50 ? '' : 'danger'}">${accuracy}%</span>
            </div>
          </div>
          <div class="record-breakdown">
            <span class="breakdown-label">本夜归档:</span>
            <span class="breakdown-detail">
              正确 ${rec.correctCount} · 错误 ${rec.wrongCount} · 共 ${rec.totalTapes} 盘
            </span>
          </div>
          <div class="record-shelves">
            ${Object.values(rec.shelfBreakdown).filter(s => s.count > 0).map(s => `
              <span class="shelf-tag" style="border-color:${s.color};color:${s.color};">
                ${s.name.replace(/^[A-Z]-\d+\s*/, '')}: ${s.count}
              </span>
            `).join('') || '<span class="breakdown-empty">无归档</span>'}
          </div>
          ${rec.endReason ? `<div class="record-end-reason">终止原因: ${rec.endReason}</div>` : ''}
        </div>
      `;
    });

    html += `</div>`;
    html += `<div class="archive-footer">最多保存 ${window.ArchiveRecord.MAX_RECORDS} 条最近记录</div>`;
    container.innerHTML = html;
  }

  window.GameUI = {
    ELEMENT_IDS,
    addMessage,
    updateStats,
    updateTimerBar,
    updatePauseButton,
    renderShelves,
    flashShelfCorrect,
    flashShelfWrong,
    renderCurrentTape,
    showOverlay,
    hideOverlay,
    setNightSummary,
    setGameOverSummary,
    clearMessages,
    renderArchive
  };
})();
