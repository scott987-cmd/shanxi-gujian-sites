import type { BuildingConfig } from './types'
import { PAGODA_PARTS, TIMELINE, QUAKE_FEATURES, HERO_STATS } from '@/data/pagoda'

export const yingxian: BuildingConfig = {
  id: 'yingxian',
  name: '应县木塔',
  alias: '佛宫寺释迦塔',
  seal: '辽',
  location: '山西朔州 · 应县',
  archetype: 'pagoda',
  tagline: '公元 1056 年，辽代工匠不施一钉一铆，以榫卯与斗拱在晋北高原立起一座 67 米的纯木巨塔。近千年风雨、数十次强震、两百余发炮弹，未能让它倒下。',
  heroStats: HERO_STATS,
  parts: PAGODA_PARTS.map((p) => ({
    id: p.id,
    label: p.label,
    short: p.shortLabel,
    kind: p.kind,
    desc: p.desc,
    facts: p.facts,
  })),
  timeline: TIMELINE,
  features: QUAKE_FEATURES.map((f) => ({ ...f })),
  featureTitle: '千年不倒的密码',
  featureSub: '数十次强震 · 两百余发炮弹 · 巍然屹立',
  plaques: [
    { text: '峻极神工', by: '传为明成祖朱棣题 · 悬于顶层', big: true },
    { text: '天下奇观', by: '传为明武宗朱厚照题 · 悬于四层', big: true },
    { text: '释迦塔', by: '金代匾额 · 悬于三层 · 最古' },
  ],
  plaquesTitle: '52 块牌匾，一部塔身史书',
  plaquesIntro: '历代帝王将相、文人墨客登塔留匾，使木塔成为一座悬挂在空中的书法长廊。',
  planTitle: '一层平面 · 双层套筒柱网',
  planZones: [],
  signature: {
    title: '斗拱博物馆', sub: '54 种 · 480 余朵 · 百尺莲开', visual: 'dougong',
    desc: '应县木塔共用 54 种形制、480 余朵斗拱，为古建筑之最。斗拱既分担立柱荷载，又缓冲分散外力，还让屋檐深远如花瓣层开——被称为“百尺莲开”。点击左侧构件逐层拆开看。',
    stats: [['54 种', '形制各异'], ['480+', '全塔朵数'], ['榆木', '斗拱用材']],
  },
  legacy: {
    status:
      '由于战火创伤与近现代不当拆改，木塔二、三层出现明显倾斜，其中二层西南侧几根立柱倾斜最为严重。出于保护，木塔已禁止游客登临十余年，只有一层对外开放。',
    lesson: {
      title: '1934 · 夹泥墙之殇',
      desc: '民国年间，当地乡绅嫌塔身夹泥墙“笨重”，拆除了各层暗藏斜撑的墙体，改装通透的格扇门。木塔失去重要刚性约束，倾斜从此加剧。梁思成先生闻讯痛惜不已——这是中国文物保护史上最著名的教训：不改变文物原状，是修缮的第一原则。',
    },
    digital:
      '全面测绘与局部加固方案已获批复并持续推进；“AI + 多模态”沉浸式体验空间用数字复原替代登塔，让观众在不惊扰文物的前提下“走进”每一层。保护与利用，正在找到新的平衡。',
  },
}
