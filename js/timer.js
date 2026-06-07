(function () {
  let intervalId = null;
  let onTickCallback = null;
  let onExpireCallback = null;

  function setCallbacks(onTick, onExpire) {
    onTickCallback = onTick;
    onExpireCallback = onExpire;
  }

  function start() {
    stop();
    intervalId = setInterval(() => {
      if (typeof onTickCallback === 'function') {
        const shouldStop = onTickCallback();
        if (shouldStop) {
          stop();
          return;
        }
      }
    }, 100);
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function isRunning() {
    return intervalId !== null;
  }

  window.GameTimer = {
    setCallbacks,
    start,
    stop,
    isRunning
  };
})();
