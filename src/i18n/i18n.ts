import type { ToolId, UpgradeId, Verdict } from '../game/simulation/types';

export const SUPPORTED_LOCALES = ['en', 'zh-CN'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const UI = {
  en: {
    shiftStatus: 'Shift status', night: 'NIGHT', score: 'SCORE', streak: 'STREAK', mistakesRemaining: 'Mistakes remaining',
    toggleSound: 'Toggle sound', enableSound: 'Enable sound', muteSound: 'Mute sound', language: 'Language', languageSwitch: '中文',
    tonightDirective: "TONIGHT'S DIRECTIVE", quota: 'QUOTA', parcelDocket: 'PARCEL DOCKET', inspection: 'INSPECTION',
    finalStamp: 'FINAL STAMP', xray: 'X-RAY', resonance: 'LISTEN', aura: 'AURA', scanned: 'SCANNED',
    accept: 'ACCEPT', return: 'RETURN', quarantine: 'QUARANTINE', service: 'NOCTURNAL POSTAL SERVICE',
    brand: 'MONSTER MAIL', nightShift: 'NIGHT SHIFT', menuLead: 'Inspect suspicious parcels. Stamp the truth. Keep the city sleeping.',
    bestScore: 'BEST SCORE', bestNight: 'BEST NIGHT', clockIn: 'CLOCK IN', controls: 'Mouse / touch · Keyboard shortcuts supported',
    nightOf: 'NIGHT {{night}} OF {{total}}', parcels: 'parcels', seconds: 'seconds', mistakesLeft: 'mistakes left', ringBell: 'RING THE BELL',
    shiftCleared: 'SHIFT CLEARED', correctCount: '{{correct}} / {{total}} CORRECT', chooseBenefit: 'Choose one union benefit before the next bell.',
    coins: 'COINS', bestStreak: 'BEST STREAK', shiftTerminated: 'SHIFT TERMINATED', mailWon: 'THE MAIL WON.',
    nightScore: 'Night {{night}} · Score {{score}}', reviveWithAd: '▶ REVIVE WITH AD', startNewRun: 'START NEW RUN', mainMenu: 'Main menu',
    dawnComplete: 'DAWN DELIVERY COMPLETE', citySecured: 'CITY SECURED.', victoryLead: 'You survived all five bells with a score of {{score}}.',
    masterInspector: 'MASTER\nINSPECTOR', workAnotherNight: 'WORK ANOTHER NIGHT', cleared: 'CLEARED', incorrect: 'INCORRECT',
  },
  'zh-CN': {
    shiftStatus: '夜班状态', night: '夜班', score: '分数', streak: '连击', mistakesRemaining: '剩余容错',
    toggleSound: '切换声音', enableSound: '开启声音', muteSound: '关闭声音', language: '语言', languageSwitch: 'EN',
    tonightDirective: '今夜指令', quota: '配额', parcelDocket: '包裹档案', inspection: '检查工具',
    finalStamp: '最终盖章', xray: '透视', resonance: '听诊', aura: '灵气', scanned: '已检查',
    accept: '接收', return: '退回', quarantine: '隔离', service: '夜间邮政服务处',
    brand: '怪物邮件', nightShift: '夜班', menuLead: '检查可疑包裹，盖下正确印章，让城市安睡。',
    bestScore: '最高分', bestNight: '最远夜班', clockIn: '开始值班', controls: '支持鼠标、触屏和键盘快捷键',
    nightOf: '第 {{night}} / {{total}} 夜', parcels: '件包裹', seconds: '秒', mistakesLeft: '次容错', ringBell: '敲响夜班铃',
    shiftCleared: '夜班完成', correctCount: '正确 {{correct}} / {{total}}', chooseBenefit: '在下一声铃响前，选择一项工会福利。',
    coins: '金币', bestStreak: '最高连击', shiftTerminated: '夜班终止', mailWon: '邮件占了上风。',
    nightScore: '第 {{night}} 夜 · 得分 {{score}}', reviveWithAd: '▶ 看广告继续', startNewRun: '重新值班', mainMenu: '返回主菜单',
    dawnComplete: '黎明投递完成', citySecured: '城市安全了。', victoryLead: '你熬过了全部五个夜班，最终得分 {{score}}。',
    masterInspector: '王牌\n检查员', workAnotherNight: '再值一个夜班', cleared: '放行正确', incorrect: '判定错误',
  },
} as const;

export type UiMessageKey = keyof (typeof UI)['en'];

type Variables = Record<string, string | number>;

export function message(locale: SupportedLocale, key: UiMessageKey, variables: Variables = {}): string {
  let value: string = UI[locale][key];
  for (const [name, replacement] of Object.entries(variables)) {
    value = value.replaceAll(`{{${name}}}`, String(replacement));
  }
  return value;
}

export function detectLocale(languages?: readonly string[]): SupportedLocale {
  const candidates = languages ?? (typeof navigator === 'undefined' ? ['en'] : navigator.languages);
  return candidates.some((language) => language.toLowerCase().startsWith('zh')) ? 'zh-CN' : 'en';
}

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

export function oppositeLocale(locale: SupportedLocale): SupportedLocale {
  return locale === 'en' ? 'zh-CN' : 'en';
}

export function toolName(locale: SupportedLocale, tool: ToolId): string {
  return message(locale, tool);
}

export function verdictName(locale: SupportedLocale, verdict: Verdict): string {
  return message(locale, verdict);
}

interface CaseTranslation {
  parcelName: string;
  explanation: string;
  visibleHints: string[];
  clues: Record<ToolId, string>;
  incident: string;
}

const CASE_ZH: Record<string, CaseTranslation> = {
  'tea-safe': {
    parcelName: '月瓣茶', explanation: '封条、标签和内容物均无异常。', visibleHints: ['封条完好', '邮资已付'],
    clues: { xray: '干茶叶和一个陶瓷滤茶器。', resonance: '轻柔的叶片沙沙声。', aura: '平静的银色灵气。' }, incident: '包裹滑入了发件滑道。',
  },
  'boots-safe': {
    parcelName: '七里靴鞋油', explanation: '让靴子跑得飞快的鞋油依然合法。', visibleHints: ['持证制造商', '封条完好'],
    clues: { xray: '两罐鞋油和一把小刷子。', resonance: '未检测到活动。', aura: '稳定的钴蓝色灵气。' }, incident: '一只邮政精灵以惊人的速度把它运走了。',
  },
  'cookies-safe': {
    parcelName: '墓园饼干', explanation: '骷髅造型只是品牌设计，不是违禁品。', visibleHints: ['附有食品许可', '包装无损'],
    clues: { xray: '十二块骨头形饼干。', resonance: '无害的饼干碰撞声。', aura: '淡淡的肉桂灵气。' }, incident: '包裹离开时落下了一块香喷喷的碎屑。',
  },
  'damaged-vial': {
    parcelName: '雨云药水', explanation: '包装明显破损，必须退回。', visibleHints: ['边角压坏', '受潮警告'],
    clues: { xray: '一支开裂的玻璃药瓶。', resonance: '滴答……滴答……', aura: '不稳定的潮湿灵气。' }, incident: '退件滑道关闭前，一朵小雨云打了个喷嚏。',
  },
  'broken-seal': {
    parcelName: '皇家眼霜', explanation: '安全封条已经被拆开。', visibleHints: ['蜡封破裂', '寄件人已核验'],
    clues: { xray: '罐子里有个东西在眨眼。', resonance: '礼貌的眨眼声。', aura: '化妆品级附魔。' }, incident: '包裹被退回时，罐子朝你眨了眨眼。',
  },
  'live-egg': {
    parcelName: '装饰用龙蛋', explanation: '检测到心跳，说明这是未申报的活体货物。', visibleHints: ['标注为“装饰品”', '触感温热'],
    clues: { xray: '完整的蛋壳里蜷着一个小东西。', resonance: '检测到快速的双重心跳！', aura: '幼年余烬灵气。' }, incident: '蛋壳裂开，一只小鼻子吐出了烟圈。',
  },
  mimic: {
    parcelName: '普通储物箱', explanation: '包裹本身是活的。拟态怪必须隔离。', visibleHints: ['没有退件地址', '可疑的齿痕'],
    clues: { xray: '本该放填充物的位置长着一排排牙齿。', resonance: '检测到缓慢呼吸！', aura: '饥饿的琥珀色灵气。' }, incident: '箱子扑向印章，随即被滑道关进笼子。',
  },
  underpaid: {
    parcelName: '无底袜', explanation: '标签缺少维度邮资。', visibleHints: ['邮资：2g', '应付：12g'],
    clues: { xray: '扫描范围一直延伸到机器之外。', resonance: '能听见遥远的海浪声。', aura: '合法的维度织物。' }, incident: '袜子被退回前，一道海浪从里面溅了出来。',
  },
  'cursed-doll': {
    parcelName: '绝对正常的娃娃', explanation: '紫色灵气表明它带有束缚诅咒。', visibleHints: ['礼品包装', '未注明制造商'],
    clues: { xray: '一个正对扫描仪的木制小娃娃。', resonance: '它在低语你的员工编号。', aura: '检测到严重的紫色诅咒！' }, incident: '娃娃在收容罐里向你挥手告别。',
  },
  'lucky-moss': {
    parcelName: '幸运口袋苔藓', explanation: '它的微光只是无害的幸运魔法。', visibleHints: ['植物检疫许可', '邮资已付'],
    clues: { xray: '一罐带缓冲垫的苔藓。', resonance: '安静的光合作用声。', aura: '无害的绿色幸运灵气。' }, incident: '一枚金币从获准投递的包裹里滚了出来。',
  },
  'forged-label': {
    parcelName: '博物馆月石', explanation: '标签写着月石，但透视显示它只是普通砖块。', visibleHints: ['高价值申报', '轻得可疑'],
    clues: { xray: '一块红砖和三颗鹅卵石。', resonance: '非常普通的咚声。', aura: '没有月光共鸣。' }, incident: '“月石”扬起了一阵非常接地气的灰尘。',
  },
  'phoenix-feather': {
    parcelName: '凤凰羽毛枕', explanation: '包裹内含有未申报的点火源。', visibleHints: ['寝具许可', '表面异常灼热'],
    clues: { xray: '枕头里有一颗燃烧的余烬核心！', resonance: '爆裂声越来越响。', aura: '已超过燃烧临界值。' }, incident: '隔离铃响起，无害火花拼出了“哎呀”。',
  },
  'cold-candle': {
    parcelName: '永冻蜡烛', explanation: '冷焰虽不寻常，但许可齐全。', visibleHints: ['元素许可', '隔热筒包装'],
    clues: { xray: '一支固定好的蓝色蜡烛。', resonance: '轻柔的冰裂声。', aura: '稳定的冰霜附魔。' }, incident: '一片雪花落在了接收印章上。',
  },
  timepiece: {
    parcelName: '祖父的怀表', explanation: '怀表显示的是明天的时间。时空货物必须隔离。', visibleHints: ['古董申报', '寄出日期：明天'],
    clues: { xray: '齿轮同时朝两个方向转动。', resonance: '两组重叠的滴答声！', aura: '检测到时间回声。' }, incident: '有那么一秒，结果印章在你按下前就出现了。',
  },
  'future-cake': {
    parcelName: '明日蛋糕', explanation: '投递日期早于烘焙日期，标签无效。', visibleHints: ['烘焙：星期四', '投递：星期三'],
    clues: { xray: '一块完全普通的蛋糕。', resonance: '隐约的庆祝音乐。', aura: '轻微且合法的保鲜魔法。' }, incident: '糖霜自行改写成了“昨天再来一次”。',
  },
  'singing-stone': {
    parcelName: '合唱石', explanation: '没有规定禁止音准极佳的石头。', visibleHints: ['演出许可', '封条完好'],
    clues: { xray: '天鹅绒上放着一块光滑的石头。', resonance: '完美的三声部和声。', aura: '无害的艺术灵气。' }, incident: '发件滑道用一个低音回应了它。',
  },
  'shadow-bottle': {
    parcelName: '瓶装阴影', explanation: '瓶子里装着具有捕食性的暗影诅咒。', visibleHints: ['对光敏感', '影子方向错误'],
    clues: { xray: '空瓶却投下了完整的轮廓。', resonance: '身后传来抓挠声。', aura: '捕食性黑紫诅咒！' }, incident: '影子试图逃走，最终折叠进了隔离印章。',
  },
  'star-seeds': {
    parcelName: '口袋星种', explanation: '微型星体亮度低于限制，可以投递。', visibleHints: ['亮度：I 级', '星界许可'],
    clues: { xray: '六个细小的光点。', resonance: '遥远的天体嗡鸣。', aura: '亮度安全低于限制。' }, incident: '获准投递的包裹留下了一道闪光轨迹。',
  },
  'fizz-root': {
    parcelName: '碳酸曼德拉草', explanation: '这根植物活着、很吵，而且完全没有申报。', visibleHints: ['标注为汽水', '箱子偶尔打嗝'],
    clues: { xray: '一个正在憋气的根茎生物。', resonance: '心跳，还有冒泡的嗝声！', aura: '活体植物灵气。' }, incident: '曼德拉草一路吐着泡泡被送进隔离区。',
  },
  'lava-lamp': {
    parcelName: '真·熔岩灯', explanation: '灯内装着真正的加压熔岩。', visibleHints: ['家居装饰申报', '缺少隔热罩'],
    clues: { xray: '加压的熔融岩石！', resonance: '低沉的火山冒泡声。', aura: '严重热失稳。' }, incident: '收容气泡接住了一团极具戏剧性的熔岩。',
  },
};

export function caseTranslation(locale: SupportedLocale, id: string): CaseTranslation | undefined {
  return locale === 'zh-CN' ? CASE_ZH[id] : undefined;
}

interface CustomerTranslation { species: string; greeting: string }

const CUSTOMER_ZH: Record<string, CustomerTranslation> = {
  'mira-moth': { species: '月蛾', greeting: '请轻拿轻放。它紧张时会嗡嗡响。' },
  gloop: { species: '凝胶市民', greeting: '漏出来的不是我，大概是包裹。' },
  bramble: { species: '沼泽精', greeting: '刚从沼泽出来，小心苔藓。' },
  ember: { species: '灰烬蝾螈', greeting: '如果闻到烟味，那完全正常。' },
  tock: { species: '发条哥布林', greeting: '邮资分毫不差，时间也一秒不差。' },
  yvonne: { species: '冰霜雪怪', greeting: '我发现它时，它就已经这么冷了。' },
  nib: { species: '墨水小恶魔', greeting: '地址的墨迹是艺术性晕染。' },
  pebble: { species: '石裔', greeting: '重？不，是柜台太脆弱。' },
  vesper: { species: '绒毛蝙蝠', greeting: '白天投递不在我的选择范围内。' },
  sprig: { species: '根须精灵', greeting: '它需要水。也可能绝对不能碰水。' },
  bix: { species: '湿地小妖', greeting: '我没摇它。至少没怎么摇。' },
  opal: { species: '水晶幽光', greeting: '包裹会映出未来。别理那些无礼的未来。' },
};

export function customerTranslation(locale: SupportedLocale, id: string): CustomerTranslation | undefined {
  return locale === 'zh-CN' ? CUSTOMER_ZH[id] : undefined;
}

interface ShiftTranslation { title: string; subtitle: string; rules: string[] }

const SHIFT_ZH: Record<number, ShiftTranslation> = {
  1: { title: '第一声铃', subtitle: '午夜高峰到来前，先熟悉三种印章。', rules: ['破损或信息无效的包裹必须退回。', '活体货物必须隔离。', '合法且稳定的包裹予以接收。'] },
  2: { title: '蜡封低语', subtitle: '有些诅咒躲在普通灯光看不见的地方。', rules: ['带有诅咒灵气的包裹必须隔离。', '邮资不足的包裹必须退回。', '古怪不等于违法。'] },
  3: { title: '高温货物', subtitle: '熔炉区向你致以热烈问候。', rules: ['含不稳定核心的包裹必须隔离。', '标签错误的包裹必须退回。', '判断重型包裹前先使用透视。'] },
  4: { title: '回声时刻', subtitle: '有些包裹在寄出前就已经抵达。', rules: ['带有时间回声的包裹必须隔离。', '封条破损的包裹必须退回。', '安静的包裹也可能受到诅咒。'] },
  5: { title: '第十三声钟响', subtitle: '所有规定同时生效，让城市继续安睡。', rules: ['活体、诅咒、易爆或时空货物：隔离。', '破损、伪造或邮资不足：退回。', '合法且无异常的邮件：接收。'] },
};

export function shiftTranslation(locale: SupportedLocale, id: number): ShiftTranslation | undefined {
  return locale === 'zh-CN' ? SHIFT_ZH[id] : undefined;
}

interface UpgradeTranslation { title: string; description: string }

const UPGRADE_ZH: Record<UpgradeId, UpgradeTranslation> = {
  clock: { title: '工会休息', description: '今后每个夜班开始时增加 8 秒。' },
  heart: { title: '强化玻璃', description: '最大容错 +1，并修复一次失误。' },
  streak: { title: '黄金印章', description: '正确连击获得额外 20% 分数。' },
  tools: { title: '校准工具', description: '检查工具消耗更少的夜班时间。' },
  tips: { title: '小费罐', description: '正确检查获得额外 25% 金币。' },
};

export function upgradeTranslation(locale: SupportedLocale, id: UpgradeId): UpgradeTranslation | undefined {
  return locale === 'zh-CN' ? UPGRADE_ZH[id] : undefined;
}
