(function () {
  const { SHELF_DEFS } = window.GameConstants;

  function shouldBeDestroyed(tape) {
    return tape.condition <= 1 ||
           tape.labelColor === 'black' ||
           tape.labelColor === 'none' ||
           tape.contextType === 'dangerous';
  }

  function matchShelf(tape, shelf) {
    if (shelf.id === 'Z') return shouldBeDestroyed(tape);
    return shelf.labelColors.includes(tape.labelColor) &&
           shelf.smells.includes(tape.smell) &&
           tape.contextType === shelf.contextType;
  }

  function determineCorrectShelf(tape) {
    if (shouldBeDestroyed(tape)) return 'Z';

    for (const shelf of SHELF_DEFS) {
      if (shelf.id === 'Z') continue;
      if (matchShelf(tape, shelf)) return shelf.id;
    }

    const fallbackMap = {
      military: 'A',
      bio: 'B',
      tech: 'C',
      civil: 'D',
      paranormal: 'E'
    };
    return fallbackMap[tape.contextType] || 'Z';
  }

  function runArchiveTests() {
    const tests = [
      {
        name: '边界案例1: 严重破损(1格)但红标签+铁锈味+军事背景',
        tape: { id: 'TEST-0001', labelColor: 'red', smell: 'iron', condition: 1, contextType: 'military', context: '军事演习通讯记录' },
        expected: 'Z',
        reason: '严重破损应优先销毁'
      },
      {
        name: '边界案例2: 无标签但绿标签+霉味+生物背景(矛盾描述)',
        tape: { id: 'TEST-0002', labelColor: 'none', smell: 'mold', condition: 4, contextType: 'bio', context: '雨林考察录音' },
        expected: 'Z',
        reason: '无标签应优先销毁'
      },
      {
        name: '边界案例3: 黑标签+蓝标签+臭氧味+科技背景',
        tape: { id: 'TEST-0003', labelColor: 'black', smell: 'ozone', condition: 3, contextType: 'tech', context: '短波信号录制' },
        expected: 'Z',
        reason: '黑标签应优先销毁'
      },
      {
        name: '边界案例4: 危险背景但黄标签+旧纸味+民事背景',
        tape: { id: 'TEST-0004', labelColor: 'yellow', smell: 'paper', condition: 4, contextType: 'dangerous', context: '⚠ 警告: 包含危险信息' },
        expected: 'Z',
        reason: '危险背景应优先销毁'
      },
      {
        name: '边界案例5: 破损程度=2(刚好大于1)但其他特征正常',
        tape: { id: 'TEST-0005', labelColor: 'purple', smell: 'burn', condition: 2, contextType: 'paranormal', context: '教堂驱魔仪式录音' },
        expected: 'E',
        reason: '破损=2不触发销毁，正常进入超自然柜'
      },
      {
        name: '普通案例6: 标准红机密磁带',
        tape: { id: 'TEST-0006', labelColor: 'red', smell: 'gunpowder', condition: 4, contextType: 'military', context: '边境巡逻报告' },
        expected: 'A',
        reason: '三个特征均匹配A-01'
      },
      {
        name: '普通案例7: 标准民事磁带',
        tape: { id: 'TEST-0007', labelColor: 'yellow', smell: 'dust', condition: 5, contextType: 'civil', context: '家庭生日派对录音' },
        expected: 'D',
        reason: '三个特征均匹配D-04'
      },
      {
        name: '边界案例8: 严重破损(condition=1)且民事特征',
        tape: { id: 'TEST-0008', labelColor: 'yellow', smell: 'paper', condition: 1, contextType: 'civil', context: '老人讲述家庭往事' },
        expected: 'Z',
        reason: '严重破损应覆盖民事归档需求'
      }
    ];

    let passed = 0;
    const results = [];
    for (const t of tests) {
      const actual = determineCorrectShelf(t.tape);
      const ok = actual === t.expected;
      if (ok) passed++;
      results.push({ name: t.name, expected: t.expected, actual, ok, reason: t.reason });
    }

    console.log('═══════════════════════════════════════');
    console.log(`归档判定测试结果: ${passed}/${tests.length} 通过`);
    console.log('═══════════════════════════════════════');
    for (const r of results) {
      const mark = r.ok ? '✓ PASS' : '✗ FAIL';
      console.log(`${mark}  ${r.name}`);
      console.log(`        期望: ${r.expected}  实际: ${r.actual}`);
      console.log(`        说明: ${r.reason}`);
    }
    console.log('═══════════════════════════════════════');

    return { passed, total: tests.length, results };
  }

  window.ArchiveRules = {
    shouldBeDestroyed,
    matchShelf,
    determineCorrectShelf,
    runArchiveTests
  };
})();
