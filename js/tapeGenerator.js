(function () {
  const { LABEL_COLORS, SMELLS, CONTEXTS, TAPE_ID_PREFIXES } = window.GameConstants;
  const { randomChoice, randomInt } = window.GameUtils;

  function generateTape(day) {
    const difficultyBias = Math.min(day * 0.05, 0.35);
    const types = ['military', 'bio', 'tech', 'civil', 'paranormal', 'dangerous'];
    const type = randomChoice(types);

    let labelColor, smell;

    if (type === 'dangerous') {
      labelColor = Math.random() < 0.6 ? 'black' : (Math.random() < 0.5 ? 'none' : randomChoice(Object.keys(LABEL_COLORS)));
      smell = randomChoice(Object.keys(SMELLS));
    } else {
      const correctLabels = {
        military: 'red', bio: 'green', tech: 'blue', civil: 'yellow', paranormal: 'purple'
      };
      const correctSmells = {
        military: ['iron', 'gunpowder'],
        bio: ['mold', 'rot', 'damp'],
        tech: ['ozone', 'metal', 'oil'],
        civil: ['paper', 'dust', 'tobacco'],
        paranormal: ['burn', 'incense', 'unknown']
      };

      if (Math.random() < difficultyBias) {
        labelColor = randomChoice(Object.keys(LABEL_COLORS));
      } else {
        labelColor = correctLabels[type];
      }

      if (Math.random() < difficultyBias) {
        smell = randomChoice(Object.keys(SMELLS));
      } else {
        smell = randomChoice(correctSmells[type]);
      }
    }

    const condition = randomInt(1, 5);
    const id = randomChoice(TAPE_ID_PREFIXES) + '-' + String(randomInt(100, 9999)).padStart(4, '0');

    return {
      id,
      labelColor,
      smell,
      condition,
      contextType: type,
      context: randomChoice(CONTEXTS[type])
    };
  }

  function generateTapeBatch(day, count) {
    const tapes = [];
    for (let i = 0; i < count; i++) {
      tapes.push(generateTape(day));
    }
    return tapes;
  }

  window.TapeGenerator = {
    generateTape,
    generateTapeBatch
  };
})();
