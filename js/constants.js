const LABEL_COLORS = {
  red: { name: '红色', hex: '#cc3333', text: '#fff' },
  green: { name: '绿色', hex: '#33aa66', text: '#fff' },
  blue: { name: '蓝色', hex: '#3366cc', text: '#fff' },
  yellow: { name: '黄色', hex: '#ddbb33', text: '#000' },
  purple: { name: '紫色', hex: '#8844cc', text: '#fff' },
  black: { name: '黑色', hex: '#111111', text: '#888' },
  none: { name: '无标签', hex: '#444444', text: '#aaa' }
};

const SMELLS = {
  iron: { name: '铁锈味', hints: ['血腥味', '金属腥气', '铁锈'] },
  gunpowder: { name: '火药味', hints: ['硝烟味', '爆炸残留'] },
  mold: { name: '霉味', hints: ['潮湿霉味', '霉斑'] },
  rot: { name: '腐烂味', hints: ['腐败气味', '恶心的甜味'] },
  damp: { name: '潮湿味', hints: ['地下室味', '水汽'] },
  ozone: { name: '臭氧味', hints: ['雷电味', '电火花味'] },
  metal: { name: '金属味', hints: ['机械润滑油味', '钢铁'] },
  oil: { name: '机油味', hints: ['柴油味', '润滑油'] },
  paper: { name: '旧纸张味', hints: ['图书馆味', '旧书'] },
  dust: { name: '灰尘味', hints: ['尘埃感', '陈旧'] },
  tobacco: { name: '烟草味', hints: ['烟味', '雪茄残留'] },
  burn: { name: '焦糊味', hints: ['烧焦味', '灰烬'] },
  incense: { name: '檀香味', hints: ['焚香', '浓郁香料'] },
  unknown: { name: '无法辨认', hints: ['难以形容', '说不出的味道', '头痛'] }
};

const CONTEXTS = {
  military: [
    '录音来自地下军事设施，背景有警报声',
    '据称是某军事演习的通讯记录',
    '政府人员的秘密会议录音',
    '战地记者在禁区录制的声音',
    '边境巡逻队的夜间报告'
  ],
  bio: [
    '亚马逊科考队在雨林深处录制',
    '某医院废弃楼层的夜间录音',
    '生物实验室的设备运转声',
    '沼泽地夜间的奇怪声响',
    '传染病房的患者访谈'
  ],
  tech: [
    '业余无线电爱好者捕获的短波信号',
    '工厂夜班的机器运行记录',
    '信号塔周边录制的电磁噪音',
    '旧数据中心的磁带备份',
    '通讯卫星的地面接收录音'
  ],
  civil: [
    '一位老人讲述的家庭往事',
    '孩子生日派对的现场录音',
    '老师的课堂教学记录',
    '夫妻间的争吵和和解',
    '街头艺人的表演录音'
  ],
  paranormal: [
    '某教堂驱魔仪式的现场录音',
    '所谓"闹鬼"房屋的夜间记录',
    '邪教集会的秘密录音',
    'UFO目击现场的环境音',
    '灵媒与逝者"对话"的磁带'
  ],
  dangerous: [
    '⚠ 警告: 此磁带播放后听者出现失忆症状',
    '⚠ 封条: 严禁播放 - 内容可致幻',
    '⚠ 标注: 高度感染性 - 仅可销毁',
    '⚠ 说明: 与多名调查员失踪有关',
    '⚠ 红色标记: 包含危险信息'
  ]
};

const TAPE_ID_PREFIXES = ['REC', 'TAP', 'AUD', 'LOG', 'VOC', 'TRK'];

const SHELF_DEFS = [
  {
    id: 'A',
    name: 'A-01 红色机密柜',
    color: '#cc4444',
    rules: ['红标签', '铁锈/火药味', '军事/政府'],
    contextType: 'military',
    labelColors: ['red'],
    smells: ['iron', 'gunpowder']
  },
  {
    id: 'B',
    name: 'B-02 生物样本柜',
    color: '#44aa88',
    rules: ['绿标签', '霉/腐烂味', '野外/医疗'],
    contextType: 'bio',
    labelColors: ['green'],
    smells: ['mold', 'rot', 'damp']
  },
  {
    id: 'C',
    name: 'C-03 声学观测柜',
    color: '#4488cc',
    rules: ['蓝标签', '臭氧/金属味', '电台/机械'],
    contextType: 'tech',
    labelColors: ['blue'],
    smells: ['ozone', 'metal', 'oil']
  },
  {
    id: 'D',
    name: 'D-04 民事归档柜',
    color: '#ccaa44',
    rules: ['黄标签', '旧纸/灰尘味', '日常/个人'],
    contextType: 'civil',
    labelColors: ['yellow'],
    smells: ['paper', 'dust', 'tobacco']
  },
  {
    id: 'E',
    name: 'E-05 超自然柜',
    color: '#aa66cc',
    rules: ['紫标签', '焦糊/香味', '仪式/异象'],
    contextType: 'paranormal',
    labelColors: ['purple'],
    smells: ['burn', 'incense', 'unknown']
  },
  {
    id: 'Z',
    name: 'Z-00 待销毁柜',
    color: '#888888',
    rules: ['无/黑标签', '严重破损', '危险标记'],
    contextType: 'dangerous',
    labelColors: ['black', 'none'],
    smells: []
  }
];

const MAX_MISTAKES = 3;
const BASE_SCORE = 100;
const MISTAKE_PENALTY = 50;
const REPUTATION_LOSS_PER_MISTAKE = 15;
const REPUTATION_GAIN_PER_CORRECT = 2;
const UNFINISHED_TAPE_REPUTATION_LOSS = 8;
const UNFINISHED_TAPE_SCORE_LOSS = 30;

window.GameConstants = {
  LABEL_COLORS,
  SMELLS,
  CONTEXTS,
  TAPE_ID_PREFIXES,
  SHELF_DEFS,
  MAX_MISTAKES,
  BASE_SCORE,
  MISTAKE_PENALTY,
  REPUTATION_LOSS_PER_MISTAKE,
  REPUTATION_GAIN_PER_CORRECT,
  UNFINISHED_TAPE_REPUTATION_LOSS,
  UNFINISHED_TAPE_SCORE_LOSS
};
