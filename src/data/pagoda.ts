// ============ 应县木塔数据层 ============

export type PartKind =
  | 'foundation' // 台基
  | 'columns' // 柱架（明层）
  | 'veranda' // 副阶
  | 'brackets' // 斗拱层
  | 'eave' // 屋檐
  | 'mezzanine' // 暗层（平坐）
  | 'finial' // 塔刹

export interface PagodaPart {
  id: string
  label: string
  shortLabel: string
  kind: PartKind
  /** 高度（米，示意比例） */
  h: number
  /** 底部宽度（米） */
  w: number
  desc: string
  facts: string[]
}

// 自下而上：外观五层六檐，实为明五暗四九层
export const PAGODA_PARTS: PagodaPart[] = [
  {
    id: 'foundation',
    label: '台基',
    shortLabel: '台基',
    kind: 'foundation',
    h: 4,
    w: 32,
    desc: '高约 4 米的石砌台基，分上下两层：下层为方形，上层为八角形。塔身直接建于八角形大台之上，为全塔提供稳固基座，并将木构抬离地面潮气。',
    facts: ['下层方形 · 上层八角形', '高约 4 米', '石砌，防潮承重'],
  },
  {
    id: 'veranda-cols',
    label: '副阶柱廊',
    shortLabel: '副阶柱廊',
    kind: 'veranda',
    h: 3.4,
    w: 28.5,
    desc: '底层外围扩出一圈外廊，古称“副阶周匝”。廊下空间供人环绕礼佛，也使一层形成重檐效果——这就是木塔“五层六檐”中多出的那一檐。',
    facts: ['环绕一周的廊道', '构成底层重檐', '礼佛绕行空间'],
  },
  {
    id: 'veranda-brackets',
    label: '副阶斗拱',
    shortLabel: '副阶斗拱',
    kind: 'brackets',
    h: 1.3,
    w: 29.6,
    desc: '副阶檐下的斗拱层。全塔斗拱有 54 种之多，副阶采用相对简洁的形制，将廊檐荷载传递给廊柱。',
    facts: ['54 种斗拱之一隅', '悬挑廊檐', '榆木制作'],
  },
  {
    id: 'veranda-eave',
    label: '副阶檐',
    shortLabel: '副阶檐',
    kind: 'eave',
    h: 2.2,
    w: 30.5,
    desc: '六重塔檐中的第一重。深远的出檐遮蔽雨水、保护木构，檐角微微起翘，缓和了巨塔的体量感。',
    facts: ['第一重檐', '深远出檐防雨', '檐角起翘'],
  },
  {
    id: 's1-cols',
    label: '一层柱架 · 明层',
    shortLabel: '一层柱架',
    kind: 'columns',
    h: 5.6,
    w: 24,
    desc: '第一个明层，全塔最雄伟的一层。内外两圈立柱：外槽 24 根、内槽 8 根，构成双层套筒。内槽供奉 11 米高的辽代释迦牟尼坐像，顶部为华丽的斗八藻井。',
    facts: ['外槽 24 柱 + 内槽 8 柱', '11 米辽代大佛', '斗八藻井', '内墙存辽代壁画'],
  },
  {
    id: 's1-brackets',
    label: '一层斗拱',
    shortLabel: '一层斗拱',
    kind: 'brackets',
    h: 1.7,
    w: 25.4,
    desc: '一层檐下斗拱形制最为繁复雄大。斗拱层层出跳，把深远的屋檐荷载逐级传回柱头，同时在地震中以摩擦滑移耗散能量。',
    facts: ['出跳最多', '传力 + 减震', '“百尺莲开”'],
  },
  {
    id: 's1-eave',
    label: '一层檐',
    shortLabel: '一层檐',
    kind: 'eave',
    h: 3.1,
    w: 27.6,
    desc: '第二层塔檐，出檐深远。屋檐坡度平缓、四角飞扬，是辽代楼阁式建筑的典型气质。',
    facts: ['第二重檐', '灰瓦屋面', '辽代风格'],
  },
  {
    id: 'm1',
    label: '暗层一（平坐）',
    shortLabel: '暗层一',
    kind: 'mezzanine',
    h: 2.7,
    w: 21.5,
    desc: '外观看不见的“隐藏结构层”。柱间架设多向斜撑，形成一圈桁架式的刚性加强层，像一道“金箍”束紧塔身。四个暗层是木塔九层结构中的关键。',
    facts: ['斜撑桁架 · 刚性层', '安置楼梯', '四道“金箍”之一'],
  },
  {
    id: 's2-cols',
    label: '二层柱架 · 明层',
    shortLabel: '二层柱架',
    kind: 'columns',
    h: 4.7,
    w: 20.5,
    desc: '第二个明层，设方形佛坛，供一佛二菩萨。此层柱架采用“叉柱造”：上层柱脚十字开口，插入下层斗拱并向内退半个柱径，使塔身逐层内收。如今二层西南侧立柱倾斜最为明显。',
    facts: ['叉柱造 · 内退半柱径', '方形佛坛', '倾斜最严重的一层'],
  },
  {
    id: 's2-brackets',
    label: '二层斗拱',
    shortLabel: '二层斗拱',
    kind: 'brackets',
    h: 1.6,
    w: 21.9,
    desc: '二层斗拱承上启下：上承暗层平坐，下压一层檐。每层斗拱形制随开间、出檐而变，全塔无一雷同。',
    facts: ['形制随层而变', '承托平坐', '柔性节点'],
  },
  {
    id: 's2-eave',
    label: '二层檐',
    shortLabel: '二层檐',
    kind: 'eave',
    h: 2.9,
    w: 24,
    desc: '第三重塔檐。层层屋檐如花瓣般递次展开，古人赞其“百尺莲开”。',
    facts: ['第三重檐', '递次收分'],
  },
  {
    id: 'm2',
    label: '暗层二（平坐）',
    shortLabel: '暗层二',
    kind: 'mezzanine',
    h: 2.6,
    w: 18.6,
    desc: '第二道刚性加强层。明层柔性晃动、暗层刚性约束，刚柔相济交替叠加，是木塔抗震的核心机制。',
    facts: ['刚性“金箍”', '刚柔交替'],
  },
  {
    id: 's3-cols',
    label: '三层柱架 · 明层',
    shortLabel: '三层柱架',
    kind: 'columns',
    h: 4.5,
    w: 17.7,
    desc: '第三个明层，设八角形佛坛，供四方佛。此层以上游人曾可凭栏远眺，如今出于保护已禁止登塔。',
    facts: ['八角佛坛', '四方佛', '平坐栏杆远眺'],
  },
  {
    id: 's3-brackets',
    label: '三层斗拱',
    shortLabel: '三层斗拱',
    kind: 'brackets',
    h: 1.5,
    w: 19.1,
    desc: '三层斗拱。随着层高与面宽递减，斗拱跳数与铺作次序相应调整，是研究辽代斗拱演变的活标本。',
    facts: ['辽代斗拱标本', '铺作随层调整'],
  },
  {
    id: 's3-eave',
    label: '三层檐',
    shortLabel: '三层檐',
    kind: 'eave',
    h: 2.8,
    w: 21,
    desc: '第四重塔檐。',
    facts: ['第四重檐'],
  },
  {
    id: 'm3',
    label: '暗层三（平坐）',
    shortLabel: '暗层三',
    kind: 'mezzanine',
    h: 2.5,
    w: 15.9,
    desc: '第三道刚性加强层，斜撑与梁架纵横交错，把塔身箍成整体。',
    facts: ['第三道“金箍”'],
  },
  {
    id: 's4-cols',
    label: '四层柱架 · 明层',
    shortLabel: '四层柱架',
    kind: 'columns',
    h: 4.3,
    w: 15.1,
    desc: '第四个明层，存辽代原塑文殊、普贤等造像，是辽代彩塑的珍品。',
    facts: ['辽代原塑', '文殊 · 普贤'],
  },
  {
    id: 's4-brackets',
    label: '四层斗拱',
    shortLabel: '四层斗拱',
    kind: 'brackets',
    h: 1.5,
    w: 16.4,
    desc: '四层斗拱，尺度渐小而精度不减。',
    facts: ['尺度渐小'],
  },
  {
    id: 's4-eave',
    label: '四层檐',
    shortLabel: '四层檐',
    kind: 'eave',
    h: 2.7,
    w: 18.3,
    desc: '第五重塔檐。',
    facts: ['第五重檐'],
  },
  {
    id: 'm4',
    label: '暗层四（平坐）',
    shortLabel: '暗层四',
    kind: 'mezzanine',
    h: 2.4,
    w: 13.4,
    desc: '最上面一道刚性加强层，把塔顶部分牢牢约束成整体。',
    facts: ['第四道“金箍”'],
  },
  {
    id: 's5-cols',
    label: '五层柱架 · 明层',
    shortLabel: '五层柱架',
    kind: 'columns',
    h: 4.1,
    w: 12.6,
    desc: '最高明层，供毗卢遮那佛与八大菩萨。辽代在此已接近纯木楼阁的高度极限。',
    facts: ['毗卢遮那佛', '八大菩萨', '木构高度极限'],
  },
  {
    id: 's5-brackets',
    label: '五层斗拱',
    shortLabel: '五层斗拱',
    kind: 'brackets',
    h: 1.5,
    w: 13.8,
    desc: '顶层斗拱，承托攒尖顶。',
    facts: ['承托攒尖顶'],
  },
  {
    id: 's5-eave',
    label: '五层檐 · 攒尖顶',
    shortLabel: '五层檐',
    kind: 'eave',
    h: 3.4,
    w: 15.6,
    desc: '第六重檐，也是唯一的八角攒尖顶——全塔只有顶部这层屋面收向中心，其上再立塔刹。',
    facts: ['第六重檐', '八角攒尖顶'],
  },
  {
    id: 'finial',
    label: '塔刹',
    shortLabel: '塔刹',
    kind: 'finial',
    h: 9.3,
    w: 3.4,
    desc: '高约 10 米的铁制塔刹，由覆钵、相轮、宝珠等组成，兼有避雷作用。刹柱直贯塔顶，是高层木塔的“定海神针”。',
    facts: ['高约 10 米', '相轮宝珠', '兼作避雷'],
  },
]

// ============ 结构体系（透视模式） ============
export interface SystemHighlight {
  id: string
  name: string
  color: string
  title: string
  desc: string
}

export const STRUCT_SYSTEMS: SystemHighlight[] = [
  {
    id: 'outer',
    name: '外槽柱 · 24 根',
    color: '#a63d2a',
    title: '外筒骨架',
    desc: '外圈 24 根立柱构成外层套筒，承担屋檐与平坐的荷载，是塔的第一道抗倾覆防线。',
  },
  {
    id: 'inner',
    name: '内槽柱 · 8 根',
    color: '#46525c',
    title: '内筒核心',
    desc: '内圈 8 根立柱围合出供奉佛像的佛堂，与外筒之间以梁枋、斗拱相连，形成双层套筒结构。',
  },
  {
    id: 'diag',
    name: '暗层斜撑',
    color: '#c9a227',
    title: '四道刚性“金箍”',
    desc: '四个暗层内密布多向斜撑，构成桁架式刚性加强层，约束塔身变形——近现代被拆改的正是这类构件。',
  },
  {
    id: 'dougong',
    name: '斗拱 · 54 种',
    color: '#8a6d1d',
    title: '柔性减震节点',
    desc: '480 余朵斗拱以榫卯叠合，缝隙间可摩擦滑移耗能，如无数微型减震器，刚柔之间的缓冲带。',
  },
]

// ============ 历史年表 ============
export interface TimelineItem {
  year: string
  era: string
  title: string
  desc: string
}

export const TIMELINE: TimelineItem[] = [
  {
    year: '1056',
    era: '辽 · 清宁二年',
    title: '始建',
    desc: '辽兴宗仁懿皇后萧挞里倡导，田和尚奉敕募建，佛宫寺释迦塔于应州破土动工。',
  },
  {
    year: '1195',
    era: '金 · 明昌六年',
    title: '增修完毕',
    desc: '历经辽金更迭，前后数十载营建增修，巨塔终成今日规模。',
  },
  {
    year: '1305',
    era: '元 · 大德九年',
    title: '强震考验',
    desc: '大同路发生 6.5 级地震，周边房屋大量倒塌，木塔屹然无损。近千年间它经历过数十次地震。',
  },
  {
    year: '1406',
    era: '明 · 永乐四年',
    title: '「峻极神工」',
    desc: '相传明成祖朱棣北巡回师驻跸应州，登塔远眺，亲题“峻极神工”，悬于塔顶南面。',
  },
  {
    year: '1517',
    era: '明 · 正德十二年',
    title: '「天下奇观」',
    desc: '明武宗朱厚照应州之战后登塔宴赏，题“天下奇观”。全塔历代牌匾达 52 块、楹联 6 副。',
  },
  {
    year: '1926',
    era: '民国十五年',
    title: '炮火洗礼',
    desc: '军阀混战，木塔中弹两百余发，塔身弹痕累累却巍然不倒。塔内佛像曾遭盗扰。',
  },
  {
    year: '1933',
    era: '民国廿二年',
    title: '梁思成测绘',
    desc: '梁思成率队对木塔进行全面测绘，惊叹其“好到令人叫绝”，留下第一批科学测绘图档。',
  },
  {
    year: '1934',
    era: '民国廿三年',
    title: '夹泥墙之殇',
    desc: '当地乡绅为求“玲珑”观感，拆除各层夹泥墙（内含斜撑）改装格扇门，刚性层被破坏，塔身倾斜由此加剧——文物保护史上最沉痛的教训之一。',
  },
  {
    year: '1961',
    era: '新中国',
    title: '首批国保',
    desc: '3 月 4 日，佛宫寺释迦塔被列为第一批全国重点文物保护单位。',
  },
  {
    year: '1974',
    era: '新中国',
    title: '大修与惊世发现',
    desc: '国家组织抢险加固，维修中发现辽代刻经、写经、佛牙舍利等大批珍贵文物，填补辽史空白。',
  },
  {
    year: '2016',
    era: '吉尼斯世界纪录',
    title: '世界最高木塔',
    desc: '被吉尼斯世界纪录认证为“世界上最高的木塔”，与比萨斜塔、埃菲尔铁塔并称“世界三大奇塔”。',
  },
  {
    year: '今天',
    era: '保护与传承',
    title: '守望与修缮',
    desc: '二层立柱倾斜明显，木塔已禁止登塔十余年。全面测绘与局部加固方案持续推进，数字化沉浸体验让公众得以“云登塔”。',
  },
]

// ============ 抗震机制 ============
export interface QuakeFeature {
  id: string
  title: string
  subtitle: string
  desc: string
}

export const QUAKE_FEATURES: QuakeFeature[] = [
  {
    id: 'mortise',
    title: '榫卯咬合',
    subtitle: '不施一钉一铆',
    desc: '全塔数以万计的构件全凭榫卯连接。凸为榫、凹为卯，严丝合缝却保有微小弹性，允许节点轻微转动滑移——木塔因此是“活”的。',
  },
  {
    id: 'sleeve',
    title: '双层套筒',
    subtitle: '外槽 24 柱 · 内槽 8 柱',
    desc: '内外两圈立柱如两个同心圆筒，由梁枋、斗拱纵横拉结成整体，抗倾覆能力远超单层框架。',
  },
  {
    id: 'rigid',
    title: '暗层刚箍',
    subtitle: '四道桁架加强层',
    desc: '四个暗层密布斜撑，如同四道金箍束紧塔身。明层柔、暗层刚，刚柔交替叠加，地震能量被层层消解。',
  },
  {
    id: 'dougong',
    title: '斗拱耗能',
    subtitle: '54 种 · 480 余朵',
    desc: '每朵斗拱由数十个小木块叠成，受震时块与块之间摩擦、挤压、回弹，如同遍布全身的减震弹簧。',
  },
  {
    id: 'chazhu',
    title: '叉柱造收分',
    subtitle: '逐层内退半柱径',
    desc: '上层柱脚十字开口插入下层斗拱，并内退半个柱径，使塔身自下而上缓缓收分，重心低而稳。',
  },
]

// ============ 概览数据 ============
export const HERO_STATS = [
  { value: '67.31', unit: '米', label: '塔高 · 世界最高木塔' },
  { value: '1056', unit: '年', label: '始建 · 辽清宁二年' },
  { value: '9', unit: '层', label: '明五暗四 · 外观五层六檐' },
  { value: '54', unit: '种', label: '斗拱 · 古建筑之最' },
  { value: '0', unit: '钉', label: '纯榫卯 · 不施一钉一铆' },
]

// ============ 节点工坊：构件级拆解数据 ============
export interface JointPartInfo {
  id: string
  name: string
  group: '斗拱（左）' | '叉柱造（右）'
  desc: string
}

export const JOINT_PARTS: JointPartInfo[] = [
  { id: 'j-col', name: '立柱', group: '斗拱（左）', desc: '一切荷载的起点。辽代立柱两头微收，称为“梭柱”，柱径与柱高比例雄浑。' },
  { id: 'j-lane', name: '阑额', group: '斗拱（左）', desc: '柱头之间的横向联系梁，把一圈柱子拉结成整体框架。' },
  { id: 'j-ludou', name: '栌斗', group: '斗拱（左）', desc: '斗拱最底层的大斗，坐于柱头之上，十字开口承接第一层的纵横两栱。' },
  { id: 'j-nidao', name: '泥道栱', group: '斗拱（左）', desc: '平行于墙面的横栱，与华栱十字相扣，稳住斗拱的根部。' },
  { id: 'j-huagong', name: '华栱 · 第一跳', group: '斗拱（左）', desc: '垂直于墙面向外挑出的栱。斗拱“跳数”即以华栱（含昂）出跳次数计算。' },
  { id: 'j-dou1', name: '交互斗 / 散斗', group: '斗拱（左）', desc: '坐在栱端的小斗：十字开口者称交互斗，一字开口者称散斗，承托上一层栱。' },
  { id: 'j-guazi', name: '瓜子栱', group: '斗拱（左）', desc: '第一跳上的横栱，两端上卷如瓜子，层层加长使出檐更深远。' },
  { id: 'j-huagong2', name: '华栱 · 第二跳', group: '斗拱（左）', desc: '再次向外出跳，把挑檐的距离又推进一步。' },
  { id: 'j-dou2', name: '交互斗 / 散斗', group: '斗拱（左）', desc: '第二跳的斗。斗与栱交替叠合，缝隙间可微动耗能，是减震的关键。' },
  { id: 'j-man', name: '慢栱', group: '斗拱（左）', desc: '瓜子栱之上的更长横栱，舒展如画，辽代斗拱的铺作次序在此尽显。' },
  { id: 'j-ang', name: '下昂', group: '斗拱（左）', desc: '斗拱中最巧的构件：一根斜置杠杆，前端昂尖挑檐、后端被梁架压住，以杠杆之力“撬”起深远的屋檐。' },
  { id: 'j-ling', name: '令栱', group: '斗拱（左）', desc: '最外一跳的横栱，托住撩檐枋。' },
  { id: 'j-fang', name: '撩檐枋', group: '斗拱（左）', desc: '通长木枋架在各攒斗拱顶端，承椽接檐，并把一圈斗拱串联成整体。' },
  { id: 'j-rafter', name: '檐椽', group: '斗拱（左）', desc: '架在撩檐枋上的椽子，屋顶重量由此压回斗拱，完成力的闭环。' },
  { id: 'c-lowcol', name: '下柱', group: '叉柱造（右）', desc: '下层的柱子，柱头之上承载斗拱。' },
  { id: 'c-beam', name: '柱头枋', group: '叉柱造（右）', desc: '纵横拉结柱头的枋木，框架整体性的来源。' },
  { id: 'c-ludou', name: '栌斗', group: '叉柱造（右）', desc: '叉柱造中，上层柱脚正是插进这组斗拱的十字口中。' },
  { id: 'c-gong1', name: '柱头铺作 · 下栱', group: '叉柱造（右）', desc: '柱头斗拱的第一层横栱。' },
  { id: 'c-gong2', name: '柱头铺作 · 上栱', group: '叉柱造（右）', desc: '纵横叠合的第二层，形成稳固的“托盘”。' },
  { id: 'c-upcol', name: '上层柱', group: '叉柱造（右）', desc: '上层柱脚十字开口，插在下层斗拱内，并向塔心内退半个柱径——木塔由此逐层收分，重心内收。' },
  { id: 'c-slot', name: '十字卯口', group: '叉柱造（右）', desc: '上层柱脚底部的十字形开口（暗色部分），与斗拱上的栱木咬合。不用一钉，全靠榫卯自锁。' },
]
