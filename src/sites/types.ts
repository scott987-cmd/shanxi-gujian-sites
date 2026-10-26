// ============ 古建站点配置模型 ============

export interface StatItem {
  value: string
  unit: string
  label: string
}

export interface TimelineItem {
  year: string
  era: string
  title: string
  desc: string
}

export interface PartInfo {
  id: string
  label: string
  short: string
  kind: 'platform' | 'columns' | 'brackets' | 'beams' | 'roof' | 'ridge' | 'finial' | 'veranda' | 'eave' | 'mezzanine' | 'foundation'
  desc: string
  facts: string[]
}

export interface FeatureItem {
  id: string
  title: string
  subtitle: string
  desc: string
}

export interface PlaqueInfo {
  text: string
  by: string
  big?: boolean
}

export interface PlanZone {
  id: string
  name: string
  title: string
  desc: string
}

// 殿堂类 3D 参数
export interface HallParams {
  bays: number // 面阔间数
  depthBays: number // 进深间数
  bayW: number // 明间宽（米）
  bayD: number // 进深每间（米）
  colH: number // 檐柱高
  roof: 'wudian' | 'xieshan' | 'xuanshan' // 庑殿/歇山/悬山
  doubleEave: boolean
  innerColRows: number // 内槽金柱排数（示意）
  bracketSize: number // 斗拱尺度系数
  floors?: number // 楼阁层数（默认 1）
  statues: { x: number; z: number; s: number; ry?: number }[]
  plaqueTexts: string[] // 明间正中大匾
  water?: boolean // 殿前水池与十字飞梁（晋祠）
}

export interface LegacyInfo {
  status: string // 现状
  lesson?: { title: string; desc: string } // 历史教训
  digital: string // 数字化保护
}

export interface SignatureInfo {
  title: string
  sub: string
  desc: string
  visual: 'dougong' | 'beams' | 'glaze' | 'stars' | 'sculptures' | 'mural' | 'bridge' | 'shelf'
  jumps?: number
  stats: [string, string][]
  items?: { name: string; desc: string }[]
}

export interface BuildingConfig {
  id: string
  name: string
  alias: string
  seal: string // 印章字
  location: string
  geo?: [number, number, number, number] // 经度, 纬度, 偏移x, 偏移y（度）
  archetype: 'pagoda' | 'hall' | 'tower' | 'cliff'
  tower?: { stories: number; glaze: boolean }
  tagline: string
  heroStats: StatItem[]
  hall?: HallParams
  parts: PartInfo[]
  timeline: TimelineItem[]
  features: FeatureItem[]
  featureTitle: string
  featureSub: string
  plaques: PlaqueInfo[]
  plaquesTitle: string
  plaquesIntro: string
  planTitle: string
  planZones: PlanZone[]
  legacy: LegacyInfo
  signature: SignatureInfo
  jointType?: 'default' | 'chashou' | 'cliff-beam' | 'glaze' | 'panlong' | 'statue'
  eraMoment?: string // 该站标志性历史事件关键词（用于长廊专属剧照）
}
