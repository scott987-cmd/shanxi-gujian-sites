import type { BuildingConfig } from './types'

// ============ 永乐宫三清殿（元，芮城） ============
export const yonglegong: BuildingConfig = {
  id: 'yonglegong',
  name: '永乐宫三清殿',
  alias: '《朝元图》与整体搬迁的奇迹',
  seal: '元',
  location: '山西运城 · 芮城县',
  geo: [110.69, 34.69, 0, 0],
  archetype: 'hall',
  tagline:
    '元代全真教三大祖庭之一。三清殿四壁的《朝元图》以近三百位天神朝谒元始天尊，是中国壁画的巅峰。1959 年，为避让三门峡水库，整座宫殿群被逐块编号拆运、异地重建——世界文物保护史上罕见的整体搬迁。',
  heroStats: [
    { value: '1247', unit: '年', label: '始建 · 元代' },
    { value: '7', unit: '间', label: '三清殿面阔七间' },
    { value: '庑殿', unit: '顶', label: '单檐庑殿顶' },
    { value: '400+', unit: '㎡', label: '《朝元图》壁画' },
    { value: '1959', unit: '年', label: '整体搬迁 · 编号重建' },
  ],
  hall: {
    bays: 7,
    depthBays: 4,
    bayW: 4.6,
    bayD: 4.8,
    colH: 6.2,
    roof: 'wudian',
    doubleEave: false,
    innerColRows: 1,
    bracketSize: 1.15,
    statues: [{ x: 0, z: -3, s: 1.4 }],
    plaqueTexts: ['无极之门', '三清殿'],
  },
  parts: [
    { id: 'platform', label: '台基', short: '台基', kind: 'platform', desc: '元代高台基。1959–1964 年搬迁时，台基构件同样编号拆运，在芮城新址原样复建。', facts: ['元代台基', '搬迁复建'] },
    { id: 'columns', label: '柱网', short: '柱网', kind: 'columns', desc: '面阔七间、进深四间。为给壁画留出完整墙面，殿内减柱，四壁连续无间断——建筑为壁画服务。', facts: ['减柱留壁', '七间 × 四间'] },
    { id: 'brackets', label: '斗拱层', short: '斗拱', kind: 'brackets', desc: '元代斗拱较宋辽趋于纤细，但仍承担出檐重任，风格从雄大转向精致。', facts: ['元式铺作', '渐趋精致'] },
    { id: 'beams', label: '梁架层', short: '梁架', kind: 'beams', desc: '元代梁架多用大额枋与减柱，结构逻辑直白粗犷，为明清官式的前奏。', facts: ['大额枋', '元代梁式'] },
    { id: 'roof', label: '单檐庑殿顶', short: '屋顶', kind: 'roof', desc: '三清殿单檐庑殿顶，正脊琉璃，等级崇高。迁建时屋面每一片瓦、每一条脊都按编号复位。', facts: ['庑殿顶', '琉璃脊饰'] },
    { id: 'ridge', label: '脊饰', short: '脊饰', kind: 'ridge', desc: '正脊两端元代风格鸱吻，迁建中原件复位。', facts: ['鸱吻原件复位'] },
  ],
  timeline: [
    { year: '1247', era: '元 · 定宗二年', title: '始建', desc: '全真教兴盛，朝廷敕建大纯阳万寿宫（永乐宫），前后营建数十年。' },
    { year: '约 1325', era: '元 · 泰定年间', title: '《朝元图》', desc: '三清殿壁画完成：近三百位神祇列队朝元，线条如铁线游丝，四米长一笔而就。' },
    { year: '1959', era: '新中国', title: '整体搬迁', desc: '因三门峡水库蓄水，永乐宫自永济永乐镇迁往芮城县城北——万余构件编号拆运、壁画揭取复原，历时六年。' },
    { year: '1961', era: '新中国', title: '首批国保', desc: '永乐宫列入第一批全国重点文物保护单位。' },
    { year: '今天', era: '保护', title: '壁画数字化', desc: '《朝元图》完成高精度数字化采集，壁画色彩与裂隙进入长期监测。' },
  ],
  features: [
    { id: 'yuanjian', title: '为壁画减柱', subtitle: '四壁连续', desc: '减柱造让殿内墙面完整连贯，近四百平米的《朝元图》才得以一气呵成。' },
    { id: 'banqian', title: '整体搬迁', subtitle: '世界罕见', desc: '万余构件编号、壁画分块揭取、异地按号复位——1959 年的中国工匠完成了一次不可能的任务。' },
    { id: 'bihua', title: '壁画即结构', subtitle: '墙承重也承画', desc: '殿墙既是围护结构，更是壁画载体：墙面的平整度与透气性，决定壁画能否活过七百年。' },
    { id: 'wudian', title: '庑殿顶', subtitle: '最高等级', desc: '三清殿以庑殿顶彰显其全真祖庭主殿的等级。' },
  ],
  featureTitle: '建筑、壁画与搬迁',
  featureSub: '一座宫殿的三次生命',
  plaques: [
    { text: '无极之门', by: '宫门匾额 · 元代', big: true },
    { text: '三清殿', by: '殿额' },
  ],
  plaquesTitle: '朝元图：墙壁上的星河',
  plaquesIntro: '近三百位天神衣袂飘摇、列队朝谒——三清殿的墙壁，是中国壁画史上最大的舞台之一。',
  planTitle: '大殿平面 · 减柱留壁',
  planZones: [],
  signature: {
    title: '《朝元图》', sub: '元代壁画巅峰 · 400 余平米', visual: 'mural',
    desc: '三清殿四壁绘近三百位天神地祇朝谒元始天尊，队列如星河奔流。点击队列中的主神查看。',
    stats: [['290+', '神祇形象'], ['400㎡', '三清殿壁画'], ['一笔', '四米长线']],
    items: [
      { name: '玉皇大帝', desc: '朝元队列核心主神之一，冠冕垂旒，群神拱卫。' },
      { name: '紫微大帝', desc: '星宿之主，仪仗华贵。' },
      { name: '勾陈大帝', desc: '主掌兵革，甲胄威严。' },
      { name: '后土皇地祇', desc: '大地之母，凤冠霞帔，端庄慈祥。' },
      { name: '太乙救苦天尊', desc: '青袍玉冠，周围力士环绕。' },
      { name: '雷部诸神', desc: '队列末段的雷部将吏，须发怒张、动感最强。' },
    ],
  },
  legacy: {
    status: '迁建后的永乐宫保存良好，壁画实施恒温恒湿与光照控制，游客限流参观。',
    lesson: {
      title: '1959 · 搬迁的启示',
      desc: '水库可以蓄水，文明不能沉没。永乐宫搬迁证明：只要决心够大、方法够细，整座宫殿也能搬家。',
    },
    digital: '《朝元图》高清数字档案已完成，AR 复原让观众看到壁画七百年前的绚丽色彩。',
  },
}

// ============ 广胜寺飞虹塔（明，洪洞） ============
const FEIHONG_PARTS = (() => {
  const parts: BuildingConfig['parts'] = [
    { id: 'platform', label: '台基', short: '台基', kind: 'platform', desc: '八角形砖石台基，承托 47 米琉璃高塔。', facts: ['八角台基', '砖石砌筑'] },
  ]
  for (let i = 13; i >= 1; i--) {
    parts.push(
      { id: `t${i}-cols`, label: `第${i}层塔身`, short: `${i}层塔身`, kind: 'columns', desc: '砖砌塔身，外壁满贴琉璃构件——佛龛、菩萨、花卉、祥兽，阳光下五彩斑斓。', facts: ['琉璃贴面', '逐层收分'] },
      { id: `t${i}-brackets`, label: `第${i}层琉璃斗拱`, short: `${i}层斗拱`, kind: 'brackets', desc: '琉璃烧制的仿木斗拱，把木构语言翻译成了永不腐朽的陶瓷。', facts: ['琉璃仿木', '陶质不朽'] },
      { id: `t${i}-eave`, label: `第${i}层檐`, short: `${i}层檐`, kind: 'eave', desc: '琉璃檐口，绿黄相间的釉色是明代琉璃工艺的巅峰。', facts: ['琉璃檐口', '绿黄釉彩'] },
    )
  }
  parts.push({ id: 'finial', label: '塔刹', short: '塔刹', kind: 'finial', desc: '琉璃宝顶与铁刹，收束十三层塔身。', facts: ['琉璃宝顶'] })
  return parts
})()

export const feihongta: BuildingConfig = {
  id: 'feihongta',
  name: '广胜寺飞虹塔',
  alias: '世界最高的多彩琉璃塔',
  seal: '明',
  location: '山西临汾 · 洪洞县广胜寺',
  geo: [111.68, 36.29, 0, 0],
  archetype: 'tower',
  tower: { stories: 13, glaze: true },
  tagline:
    '明代正德至嘉靖年间，十三层琉璃宝塔在霍山之巅重建完成。木塔会朽，砖塔会老，而飞虹塔把整座建筑烧成了陶瓷——五百年过去，琉璃上的菩萨与莲花仍然鲜艳如初。',
  heroStats: [
    { value: '1527', unit: '年', label: '建成 · 明嘉靖六年' },
    { value: '47.31', unit: '米', label: '塔高' },
    { value: '13', unit: '层', label: '八角十三层' },
    { value: '琉璃', unit: '', label: '全身多彩琉璃' },
    { value: '吉尼斯', unit: '', label: '世界最高多彩琉璃塔' },
  ],
  parts: FEIHONG_PARTS,
  timeline: [
    { year: '东汉', era: '相传', title: '阿育王塔', desc: '广胜寺相传始建于东汉，寺塔为十九座阿育王塔之一，是飞虹塔最早的身世。' },
    { year: '1303', era: '元 · 大德七年', title: '大地震毁塔', desc: '平阳（临汾）发生 8 级大地震，寺塔俱毁。震后数十年间寺院艰难重建。' },
    { year: '1515–1527', era: '明 · 正德至嘉靖', title: '重建飞虹塔', desc: '僧达连大师募资重建，历时十二载，十三层琉璃宝塔终成。' },
    { year: '1933', era: '民国', title: '赵城金藏重现', desc: '广胜寺发现金代大藏经《赵城金藏》数千卷，震动学术界，今为国家图书馆镇馆之宝。' },
    { year: '1961', era: '新中国', title: '首批国保', desc: '广胜寺列入第一批全国重点文物保护单位。' },
    { year: '2018', era: '吉尼斯', title: '世界纪录', desc: '飞虹塔获吉尼斯认证为“世界最高的多彩琉璃塔”。' },
    { year: '今天', era: '保护', title: '琉璃体检', desc: '琉璃构件的釉面色度与风化状况定期检测，古塔的色彩被科学守护。' },
  ],
  features: [
    { id: 'liuli', title: '琉璃仿木', subtitle: '以陶代木', desc: '斗拱、檐口、佛龛全部琉璃烧制——木构的形式语言被翻译成永不腐朽的陶瓷，防火防虫防朽。' },
    { id: 'shoufen', title: '逐层收分', subtitle: '锥形稳定', desc: '十三层塔身层层内收，重心低矮，锥形轮廓天生抗倾覆。' },
    { id: 'brick', title: '砖砌筒体', subtitle: '厚壁承重', desc: '砖砌厚壁筒体承压抗震，是明代高层砖塔的典型结构。' },
    { id: 'color', title: '釉彩体系', subtitle: '绿黄为主', desc: '孔雀绿与琥珀黄为主调的釉面体系，五百年日晒雨淋不褪色。' },
  ],
  featureTitle: '烧出来的不朽',
  featureSub: '琉璃 · 砖筒 · 收分',
  plaques: [
    { text: '飞虹塔', by: '塔额 · 明代', big: true },
    { text: '广胜寺', by: '寺额' },
  ],
  plaquesTitle: '从阿育王塔到赵城金藏',
  plaquesIntro: '一座塔的身世连着佛教东传的起点，一座寺的藏经柜里躺着金代大藏经——广胜寺的每一层都是历史。',
  planTitle: '塔平面 · 八角十三层',
  planZones: [],
  signature: {
    title: '琉璃构件', sub: '以陶代木 · 五色千年', visual: 'glaze',
    desc: '全塔的斗拱、佛龛、檐口都是琉璃烧制的仿木构件。点击釉色板，看孔雀绿、琥珀黄、霁蓝、赭石如何组成五百年不褪的色彩体系。',
    stats: [['全塔', '琉璃贴面'], ['四色', '釉彩体系'], ['500 年', '不褪']],
  },
  legacy: {
    status: '飞虹塔结构稳定，琉璃构件存在局部风化剥落，已纳入持续监测。塔不可攀登，外观全日可赏。',
    digital: '琉璃塔已完成三维激光扫描与釉色光谱建档，风化速率被精确追踪。',
  },
}

// ============ 双林寺（彩塑宝库，平遥） ============
export const shuanglinsi: BuildingConfig = {
  id: 'shuanglinsi',
  name: '双林寺',
  alias: '东方彩塑艺术宝库',
  seal: '塑',
  location: '山西晋中 · 平遥县',
  geo: [112.19, 37.2, -0.08, 0.04],
  archetype: 'hall',
  tagline:
    '平遥城外的双林寺，十座殿宇里住着两千余尊彩塑。千手观音慈悲低垂，韦驮将军扭身怒目——被行家称为“天下第一韦驮”。这里的木头是骨架，泥巴才是灵魂。',
  heroStats: [
    { value: '2052', unit: '尊', label: '现存彩塑' },
    { value: '明', unit: '代', label: '现存殿宇多为明代重建' },
    { value: '韦驮', unit: '', label: '天下第一韦驮' },
    { value: '千手', unit: '', label: '千手观音 · 千佛殿' },
    { value: '1997', unit: '年', label: '随平遥古城列入世界遗产' },
  ],
  hall: {
    bays: 5,
    depthBays: 3,
    bayW: 3.6,
    bayD: 3.6,
    colH: 4.2,
    roof: 'xieshan',
    doubleEave: false,
    innerColRows: 1,
    bracketSize: 0.95,
    statues: [
      { x: 0, z: -2, s: 1.3 },
      { x: -2.5, z: -1.4, s: 0.85 },
      { x: 2.5, z: -1.4, s: 0.85 },
      { x: -4.5, z: -1, s: 0.75 },
      { x: 4.5, z: -1, s: 0.75 },
      { x: -1.2, z: -0.8, s: 0.7 },
      { x: 1.2, z: -0.8, s: 0.7 },
    ],
    plaqueTexts: ['千佛殿'],
  },
  parts: [
    { id: 'platform', label: '台基', short: '台基', kind: 'platform', desc: '寺院地势略高，殿宇台基平实，平遥民居式的朴素基调。', facts: ['砖砌台基'] },
    { id: 'columns', label: '柱网', short: '柱网', kind: 'columns', desc: '明代殿宇柱网规整，为满堂彩塑让出观赏空间。', facts: ['明式柱网'] },
    { id: 'brackets', label: '斗拱层', short: '斗拱', kind: 'brackets', desc: '明代斗拱渐趋装饰化，斗拱虽小，出檐依然利落。', facts: ['明式铺作'] },
    { id: 'beams', label: '梁架层', short: '梁架', kind: 'beams', desc: '明代官式与山西地方做法交融的梁架。', facts: ['明式梁架'] },
    { id: 'roof', label: '歇山顶', short: '屋顶', kind: 'roof', desc: '单檐歇山顶，灰瓦素脊，让殿内彩塑成为绝对主角。', facts: ['灰瓦素脊'] },
    { id: 'ridge', label: '脊饰', short: '脊饰', kind: 'ridge', desc: '脊饰简朴，山西地方风格。', facts: ['地方风格'] },
  ],
  timeline: [
    { year: '约 4–5 世纪', era: '北魏前后', title: '始建', desc: '寺初名中都寺，历史可上溯至北魏早期，是平遥最古老的寺院。' },
    { year: '明', era: '明代', title: '重建与彩塑黄金时代', desc: '现存殿宇多为明代重建，两千余尊彩塑大多完成于这一时期——明代彩塑工艺在此达到巅峰。' },
    { year: '1988', era: '新中国', title: '全国重点文保', desc: '双林寺列入第三批全国重点文物保护单位。' },
    { year: '1997', era: '世界遗产', title: '列入世界遗产', desc: '与平遥古城、镇国寺共同列入《世界遗产名录》。' },
    { year: '2024', era: '当代', title: '游戏带火', desc: '《黑神话：悟空》取景让双林寺彩塑惊艳全网，年轻游客蜂拥而至。' },
    { year: '今天', era: '保护', title: '彩塑监护', desc: '彩塑微环境监测全覆盖，数字档案逐尊建立。' },
  ],
  features: [
    { id: 'caisu', title: '满堂彩塑', subtitle: '两千余尊', desc: '木构是骨架，彩塑是灵魂：殿宇的进深、采光、佛坛高度都为观塑而设计。' },
    { id: 'weituo', title: '天下第一韦驮', subtitle: '扭身发力', desc: '韦驮像身躯呈 S 形扭转，甲胄力感十足——静态的泥巴拍出了武侠片的张力。' },
    { id: 'qianshou', title: '千手观音', subtitle: '千手千眼', desc: '千佛殿千手观音二十六只主臂层层展开，每只手掌心里都有一只眼睛。' },
    { id: 'sucai', title: '素殿衬塑', subtitle: '以朴衬华', desc: '殿宇刻意朴素，灰瓦素脊——把所有的色彩与华丽都让给了彩塑。' },
  ],
  featureTitle: '泥巴里的灵魂',
  featureSub: '两千尊彩塑的舞台设计',
  plaques: [
    { text: '千佛殿', by: '殿额', big: true },
    { text: '双林寺', by: '寺额' },
  ],
  plaquesTitle: '一座寺，两千个表情',
  plaquesIntro: '从庄严的佛到市井气的供养人，双林寺彩塑是一部用泥土写成的明代社会百科全书。',
  planTitle: '殿宇平面 · 为彩塑而建',
  planZones: [],
  signature: {
    title: '彩塑群像', sub: '两千余尊 · 明代巅峰', visual: 'sculptures',
    desc: '双林寺彩塑上至佛国、下至市井。点击造像，看明代雕塑家如何用泥巴拍出武侠片。',
    stats: [['2052', '现存彩塑'], ['明代', '大多完成'], ['S 形', '韦驮身姿']],
    items: [
      { name: '韦驮', desc: '千佛殿韦驮像，身躯 S 形扭转、甲胄铿锵，被誉为“天下第一韦驮”。' },
      { name: '千手观音', desc: '二十六只主臂层展如莲瓣，掌中各有一眼，慈悲而震撼。' },
      { name: '释迦牟尼', desc: '主尊结跏趺坐，神态沉静。' },
      { name: '供养人', desc: '明代世俗装束的供养人像，宛如穿越而来的真实面孔。' },
      { name: '罗汉', desc: '姿态各异，嬉笑怒骂皆是人间烟火。' },
    ],
  },
  legacy: {
    status: '彩塑保存总体良好，部分存在颜料层粉化与裂隙，殿内限流、禁拍闪光。',
    digital: '逐尊三维扫描建立彩塑数字档案，AI 辅助的裂隙监测正在试点。',
  },
}

// ============ 镇国寺万佛殿（五代，平遥） ============
export const zhenguosi: BuildingConfig = {
  id: 'zhenguosi',
  name: '镇国寺万佛殿',
  alias: '五代木构 · 乱世幸存者',
  seal: '五代',
  location: '山西晋中 · 平遥县',
  geo: [112.24, 37.24, 0.08, -0.04],
  archetype: 'hall',
  tagline:
    '公元 963 年，五代十国的乱世里，北汉小国在平遥城外建起这座佛殿。它没有唐代前辈的名气，却是中国现存最古老的木构之一——殿内十一尊五代彩塑，是敦煌之外仅存的五代寺观彩塑。',
  heroStats: [
    { value: '963', unit: '年', label: '始建 · 北汉天会七年' },
    { value: '3', unit: '间', label: '面阔三间 · 11.6 米' },
    { value: '七铺作', unit: '', label: '斗拱逾柱高之半' },
    { value: '11', unit: '尊', label: '五代彩塑' },
    { value: '五代', unit: '', label: '乱世遗构 · 仅存珍品' },
  ],
  hall: {
    bays: 3,
    depthBays: 3,
    bayW: 3.86,
    bayD: 3.6,
    colH: 4.0,
    roof: 'xieshan',
    doubleEave: false,
    innerColRows: 0,
    bracketSize: 1.3,
    statues: [
      { x: 0, z: -1.6, s: 1.3 },
      { x: -2, z: -1.2, s: 0.85 },
      { x: 2, z: -1.2, s: 0.85 },
      { x: -1, z: -0.8, s: 0.7 },
      { x: 1, z: -0.8, s: 0.7 },
    ],
    plaqueTexts: ['万佛殿'],
  },
  parts: [
    { id: 'platform', label: '台基', short: '台基', kind: 'platform', desc: '低矮台基，五代小殿的朴素本色。', facts: ['低矮台基'] },
    { id: 'columns', label: '柱网', short: '柱网', kind: 'columns', desc: '面阔进深各三间，殿内无金柱。柱径粗大、柱身低矮，五代唐风的体格。', facts: ['三间见方', '殿内无柱', '柱身粗壮'] },
    { id: 'brackets', label: '斗拱层 · 七铺作', short: '斗拱', kind: 'brackets', desc: '七铺作双杪双下昂，斗拱总高超过柱高一半——三间小殿扛着比肩佛光寺东大殿的斗拱规格，出檐深远如伞盖。', facts: ['双杪双下昂', '斗拱高逾柱半', '出檐深远'] },
    { id: 'beams', label: '梁架层', short: '梁架', kind: 'beams', desc: '四椽栿通跨，叉手托脊，延续唐五代做法。', facts: ['叉手', '四椽栿'] },
    { id: 'roof', label: '单檐歇山顶', short: '屋顶', kind: 'roof', desc: '单檐歇山顶，屋面平缓，翼角舒展，唐五代屋顶气度一脉相承。', facts: ['歇山顶', '翼角舒展'] },
    { id: 'ridge', label: '脊饰', short: '脊饰', kind: 'ridge', desc: '脊饰历经修缮，轮廓仍存古意。', facts: ['历代修缮'] },
  ],
  timeline: [
    { year: '963', era: '五代 · 北汉天会七年', title: '始建', desc: '北汉小朝廷在平遥郝洞村建镇国寺，万佛殿落成。乱世之中，木构依旧一丝不苟。' },
    { year: '历代', era: '金元明清', title: '屡经修缮', desc: '历代修缮不绝，五代梁架与斗拱原构始终保存。' },
    { year: '1988', era: '新中国', title: '全国重点文保', desc: '镇国寺列入第三批全国重点文物保护单位。' },
    { year: '1997', era: '世界遗产', title: '列入世界遗产', desc: '与平遥古城、双林寺共同列入《世界遗产名录》。' },
    { year: '今天', era: '保护', title: '五代孤本守护', desc: '万佛殿与五代彩塑实施精细化监测——全国五代木构屈指可数，每一座都是孤本。' },
  ],
  features: [
    { id: 'qipuzuo', title: '小殿大斗拱', subtitle: '七铺作', desc: '三间小殿用七铺作斗拱，比例豪放到近乎奢侈——五代匠人对唐代规制的最后致敬。' },
    { id: 'wudaisu', title: '五代彩塑', subtitle: '敦煌之外仅存', desc: '十一尊五代彩塑上承唐风、下启宋韵，是寺观五代彩塑的孤例。' },
    { id: 'chashou', title: '叉手托脊', subtitle: '早期做法', desc: '脊部以叉手斜撑，不用侏儒柱，早期木构的活化石。' },
    { id: 'luanshi', title: '乱世精工', subtitle: '乱世中的定力', desc: '政权五十年换了五个，木匠的斧头没有抖——万佛殿证明文明可以在乱世里 quietly 存续。' },
  ],
  featureTitle: '五代小殿的大气象',
  featureSub: '七铺作 · 五代塑 · 乱世孤本',
  plaques: [
    { text: '万佛殿', by: '殿额', big: true },
    { text: '镇国寺', by: '寺额' },
  ],
  plaquesTitle: '五代十国的幸存者',
  plaquesIntro: '木构、彩塑双双五代原物——万佛殿是动荡年代留给后世最完整的一封信。',
  planTitle: '大殿平面 · 三间见方',
  planZones: [],
  signature: {
    title: '七铺作斗拱', sub: '五代豪奢 · 小殿大拱', visual: 'dougong',
    desc: '三间小殿却用七铺作双杪双下昂——斗拱总高超过柱高一半，出檐如伞。五代匠人对唐构规制的最后致敬。',
    stats: [['七铺作', '双杪双下昂'], ['过半', '拱高/柱高'], ['五代', '原构']],
  },
  legacy: {
    status: '万佛殿保存良好，五代彩塑原物俱在，随平遥遗产地统一管理。',
    digital: '五代彩塑完成高精度数字建档，梁架形变纳入在线监测。',
  },
}

// ============ 崇福寺弥陀殿（金，朔州） ============
export const chongfusi: BuildingConfig = {
  id: 'chongfusi',
  name: '崇福寺弥陀殿',
  alias: '金代巨殿 · 五绝同殿',
  seal: '金',
  location: '山西朔州 · 朔城区',
  geo: [112.43, 39.31, 0, 0],
  archetype: 'hall',
  tagline:
    '金皇统三年（1143 年）建成的弥陀殿，面阔七间 41 米，与八百年前相比几乎未变。琉璃脊饰、菱花门窗、金代壁画、塑像与匾额同殿共存，被称为“崇福五绝”——一座殿就是一部金代艺术全集。',
  heroStats: [
    { value: '1143', unit: '年', label: '始建 · 金皇统三年' },
    { value: '7', unit: '间', label: '面阔七间 · 41.3 米' },
    { value: '歇山', unit: '顶', label: '单檐歇山顶' },
    { value: '五绝', unit: '', label: '脊饰 · 门窗 · 壁画 · 塑像 · 匾额' },
    { value: '15', unit: '种', label: '菱花门窗纹样' },
  ],
  hall: {
    bays: 7,
    depthBays: 4,
    bayW: 5.9,
    bayD: 5.7,
    colH: 7.0,
    roof: 'xieshan',
    doubleEave: false,
    innerColRows: 1,
    bracketSize: 1.3,
    statues: [
      { x: -4.5, z: -3.5, s: 1.4 },
      { x: 0, z: -3.5, s: 1.5 },
      { x: 4.5, z: -3.5, s: 1.4 },
      { x: -8, z: -2.5, s: 0.85 },
      { x: 8, z: -2.5, s: 0.85 },
    ],
    plaqueTexts: ['弥陀殿'],
  },
  parts: [
    { id: 'platform', label: '台基', short: '台基', kind: 'platform', desc: '高大台基承托金代巨殿，月台完整。', facts: ['高台基', '月台完整'] },
    { id: 'columns', label: '柱网', short: '柱网', kind: 'columns', desc: '面阔七间、进深四间八椽，减柱造扩大内槽空间。檐柱柱头卷杀、侧脚明显。', facts: ['七间 × 四间', '减柱造', '柱头卷杀'] },
    { id: 'brackets', label: '斗拱层', short: '斗拱', kind: 'brackets', desc: '金代斗拱雄健华丽，铺作层厚实，与深远出檐相得益彰。', facts: ['金式铺作', '华丽雄健'] },
    { id: 'beams', label: '梁架层', short: '梁架', kind: 'beams', desc: '八架椽屋大跨梁架，金代北方匠作的雄厚手笔。', facts: ['八架椽屋'] },
    { id: 'roof', label: '单檐歇山顶', short: '屋顶', kind: 'roof', desc: '单檐歇山顶覆绿色琉璃瓦，正脊琉璃脊饰为金代原物——八百年的琉璃仍泛着幽光。', facts: ['绿色琉璃', '金代琉璃脊饰'] },
    { id: 'ridge', label: '琉璃脊饰', short: '脊饰', kind: 'ridge', desc: '正脊两端的琉璃鸱吻与脊刹为金代原物，是“崇福五绝”之首。', facts: ['金代原物', '五绝之首'] },
  ],
  timeline: [
    { year: '665', era: '唐 · 麟德二年', title: '始建林衙寺', desc: '尉迟敬德奉敕建寺，为崇福寺前身。' },
    { year: '1143', era: '金 · 皇统三年', title: '建弥陀殿', desc: '金代重建，弥陀殿落成——七间巨殿，琉璃生辉。' },
    { year: '明清', era: '历代', title: '屡修', desc: '明清屡有修葺，梁架琉璃原构保存。' },
    { year: '1988', era: '新中国', title: '全国重点文保', desc: '崇福寺列入第三批全国重点文物保护单位。' },
    { year: '2024', era: '当代', title: '黑神话取景', desc: '弥陀殿作为《黑神话：悟空》取景地之一，金代巨殿惊艳新一代。' },
    { year: '今天', era: '保护', title: '五绝监测', desc: '琉璃脊饰、菱花门窗、壁画、塑像分项建档监测。' },
  ],
  features: [
    { id: 'liuli', title: '金代琉璃脊', subtitle: '八百年不褪色', desc: '正脊琉璃鸱吻为金代原物，山西琉璃工艺在金代已达巅峰。' },
    { id: 'linghua', title: '菱花门窗', subtitle: '十五种纹样', desc: '格扇门窗菱花多达十五种纹样，透光的木蕾丝——金代小木作的绝代工艺。' },
    { id: 'bihua', title: '金代壁画', subtitle: '三百余平米', desc: '殿内东西两壁金代壁画，佛像衣带当风，色彩沉稳如昨。' },
    { id: 'jianzhu', title: '减柱宏敞', subtitle: '金构气魄', desc: '减柱造让 41 米巨殿内部空间一气呵成。' },
  ],
  featureTitle: '金代五绝同殿',
  featureSub: '琉璃 · 菱花 · 壁画 · 塑像 · 匾额',
  plaques: [
    { text: '弥陀殿', by: '金代匾额原物', big: true },
    { text: '崇福寺', by: '寺额' },
  ],
  plaquesTitle: '一座殿，一部金代艺术全集',
  plaquesIntro: '看琉璃要看它，看门窗要看它，看壁画塑像还要看它——弥陀殿把金代工匠的所有手艺留在了一间屋子里。',
  planTitle: '大殿平面 · 减柱八架椽',
  planZones: [],
  signature: {
    title: '金代彩塑与壁画', sub: '弥陀殿 · 五绝之二', visual: 'sculptures',
    desc: '弥陀殿内金代彩塑与三百平米壁画同辉。点击造像细看。',
    stats: [['金代', '彩塑'], ['300㎡+', '金代壁画'], ['五绝', '同殿']],
    items: [
      { name: '阿弥陀佛', desc: '西方极乐世界教主，弥陀殿主尊。' },
      { name: '观世音', desc: '胁侍菩萨，慈悲温润。' },
      { name: '大势至', desc: '胁侍菩萨，端庄静穆。' },
      { name: '力士', desc: '山门力士，肌肉贲张、怒目圆睁。' },
    ],
  },
  legacy: {
    status: '弥陀殿保存完好，“五绝”俱在。壁画实施光照控制，菱花门窗按原工艺定期养护。',
    digital: '金代壁画与琉璃脊饰完成高精度数字采集，菱花纹样建成图谱数据库。',
  },
}
