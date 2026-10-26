// 节点工坊变体：按古建的真实构造定制
import * as THREE from 'three'
import { box, cyl, addBlock, merged, buildJoint, textSprite, type JointModel, type JointBlock } from './joint'
import type { JointPartInfo } from '@/data/pagoda'

export type JointType = 'default' | 'chashou' | 'cliff-beam' | 'glaze' | 'panlong' | 'statue'

const WOOD = 0x8a5a35
const WOOD_D = 0x66422a
const DOU = 0x5c3a21
const GLAZE_G = 0x3a6a52
const GLAZE_Y = 0xc9973b

// ---- A. 叉手托脊（唐五代：佛光寺/南禅寺/镇国寺/天台庵/大云院/龙门寺） ----
function buildChashou(): JointModel {
  const group = new THREE.Group()
  const blocks: JointBlock[] = []
  const A = new THREE.Group()
  A.position.set(-4.6, 0, 0)
  let i = 0

  // 左：平梁与叉手（无侏儒柱）
  addBlock(A, blocks, 'cs-platform', box(7.2, 0.55, 4.6, 0, -0.29, 0, 0x6e6557), i++)
  addBlock(A, blocks, 'cs-pingliang', box(6.4, 0.6, 0.6, 0, 0.6, 0, WOOD_D), i++)
  // 叉手：左右斜梁（在脊点相交）
  const mkArm = (side: 1 | -1, id: string, idx: number) => {
    const g = new THREE.BoxGeometry(0.45, 0.5, 3.6)
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.8 }))
    m.rotation.z = side * 0.86
    m.position.set(side * 1.15, 2.15, 0)
    m.castShadow = true
    addBlock(A, blocks, id, m, idx)
  }
  mkArm(-1, 'cs-chashou-l', i++)
  mkArm(1, 'cs-chashou-r', i++)
  // 脊槫
  addBlock(A, blocks, 'cs-jituan', cyl(0.22, 6.6, 0, 3.75, 0, WOOD_D), i++)
  // 驼峰（垫块，非侏儒柱）
  addBlock(A, blocks, 'cs-tuofeng', box(0.7, 0.5, 0.5, -1.2, 1.0, 0, DOU), i++)
  addBlock(A, blocks, 'cs-tuofeng2', box(0.7, 0.5, 0.5, 1.2, 1.0, 0, DOU), i++)

  // 右：七铺作斗拱（双杪双下昂，取默认工坊的斗拱组）
  const Bm = buildJoint()
  const right = Bm.group.children[0] as THREE.Group
  right.position.set(5.0, 0, 0)
  group.add(A, right)
  return { group, blocks: [...blocks, ...Bm.blocks.filter((b) => b.id.startsWith('j-'))] }
}

// ---- B. 悬崖横梁与立木（悬空寺） ----
function buildCliffBeam(): JointModel {
  const group = new THREE.Group()
  const blocks: JointBlock[] = []
  const A = new THREE.Group()
  A.position.set(-5.0, 0, 0)
  const B = new THREE.Group()
  B.position.set(5.0, 0, 0)
  let i = 0

  // 左：崖壁块 + 斜插横梁 + 楔块
  addBlock(A, blocks, 'cb-rock', box(3.4, 6.4, 4.2, 0, 3.0, 0, 0x55483c), i++)
  addBlock(A, blocks, 'cb-hole', box(0.9, 0.5, 0.7, 1.35, 3.4, 1.2, 0x241c14), i++)
  const beam = box(0.45, 0.42, 6.4, 3.2, 3.2, 0.6, WOOD)
  beam.rotation.x = -0.12
  addBlock(A, blocks, 'cb-beam', beam, i++)
  addBlock(A, blocks, 'cb-wedge', box(0.8, 0.9, 0.9, 1.35, 3.9, 1.2, WOOD_D), i++)
  addBlock(A, blocks, 'cb-deck', box(4.2, 0.35, 3.2, 4.3, 3.0, 0.9, 0x6e523a), i++)
  const sp1 = textSprite('斜插楔紧 · 越压越紧')
  sp1.position.set(2.4, 5.6, 0.4)
  A.add(sp1)

  // 右：平台与垂吊立木（不受力）
  addBlock(B, blocks, 'cb-deck2', box(4.6, 0.4, 3.4, 0, 2.4, 0, 0x6e523a), i++)
  addBlock(B, blocks, 'cb-beam2', box(0.45, 0.42, 5.0, -1.0, 2.1, 0, WOOD_D), i++)
  const post = cyl(0.13, 1.8, 0.6, 1.2, 0.9, WOOD)
  addBlock(B, blocks, 'cb-post', post, i++)
  const post2 = cyl(0.13, 1.8, -1.4, 1.2, 0.9, WOOD)
  addBlock(B, blocks, 'cb-post2', post2, i++)
  const sp2 = textSprite('立木悬空 · 并不受力')
  sp2.position.set(0, 4.6, 0.4)
  B.add(sp2)

  group.add(A, B)
  return { group, blocks }
}

// ---- C. 琉璃斗拱与佛龛（飞虹塔） ----
function buildGlaze(): JointModel {
  const group = new THREE.Group()
  const blocks: JointBlock[] = []
  const A = new THREE.Group()
  A.position.set(-5.0, 0, 0)
  const B = new THREE.Group()
  B.position.set(5.0, 0, 0)
  let i = 0

  // 左：琉璃斗拱（釉色分件）
  addBlock(A, blocks, 'gl-ludou', box(1.2, 0.78, 1.2, 0, 0.6, 0, GLAZE_G), i++)
  addBlock(A, blocks, 'gl-huagong', box(0.46, 0.46, 3.0, 0, 1.3, 0.25, GLAZE_G), i++)
  addBlock(A, blocks, 'gl-nidao', box(2.5, 0.42, 0.46, 0, 1.25, 0, GLAZE_G), i++)
  addBlock(A, blocks, 'gl-dou1', merged('gl-dou1', [box(0.52, 0.5, 0.52, 0, 1.8, 1.45, GLAZE_Y), box(0.42, 0.4, 0.42, -1.05, 1.75, 0, GLAZE_Y), box(0.42, 0.4, 0.42, 1.05, 1.75, 0, GLAZE_Y)], GLAZE_Y), i++)
  addBlock(A, blocks, 'gl-guazi', box(3.2, 0.42, 0.46, 0, 2.25, 1.45, GLAZE_G), i++)
  addBlock(A, blocks, 'gl-ang', (() => { const m = box(0.5, 0.52, 4.6, 0, 2.9, 1.5, GLAZE_Y, -0.32, 0); return m })(), i++)
  addBlock(A, blocks, 'gl-fang', box(5.2, 0.5, 0.55, 0, 4.1, 3.35, GLAZE_G), i++)

  // 右：琉璃佛龛
  addBlock(B, blocks, 'gl-niche-base', box(2.6, 0.5, 1.8, 0, 0.3, 0, GLAZE_G), i++)
  addBlock(B, blocks, 'gl-niche-l', box(0.35, 2.2, 1.6, -1.1, 1.55, 0, GLAZE_G), i++)
  addBlock(B, blocks, 'gl-niche-r', box(0.35, 2.2, 1.6, 1.1, 1.55, 0, GLAZE_G), i++)
  addBlock(B, blocks, 'gl-niche-top', box(2.7, 0.45, 1.9, 0, 2.85, 0, GLAZE_Y), i++)
  const sp = textSprite('琉璃仿木 · 以陶代木')
  sp.position.set(0, 4.2, 0)
  B.add(sp)

  group.add(A, B)
  return { group, blocks }
}

// ---- D. 蟠龙柱与格扇（晋祠/崇福寺） ----
function buildPanlong(): JointModel {
  const group = new THREE.Group()
  const blocks: JointBlock[] = []
  const A = new THREE.Group()
  A.position.set(-5.0, 0, 0)
  const B = new THREE.Group()
  B.position.set(5.0, 0, 0)
  let i = 0

  // 左：蟠龙柱（柱 + 盘龙）
  addBlock(A, blocks, 'pl-col', cyl(0.5, 5.4, 0, 2.7, 0, WOOD), i++)
  addBlock(A, blocks, 'pl-base', box(1.6, 0.5, 1.6, 0, 0.25, 0, 0x6e6557), i++)
  // 盘龙：螺旋上升的龙身
  const dragonGeos: THREE.BufferGeometry[] = []
  for (let k = 0; k < 14; k++) {
    const a = k * 0.72
    const y = 0.9 + k * 0.3
    const r = 0.62
    const seg = new THREE.CapsuleGeometry(0.16, 0.3, 3, 6)
    seg.rotateZ(Math.PI / 2)
    seg.rotateY(a)
    seg.translate(Math.cos(a) * r, y, Math.sin(a) * r)
    dragonGeos.push(seg)
  }
  // 龙头
  const head = new THREE.ConeGeometry(0.24, 0.6, 6)
  head.rotateZ(-0.9)
  head.translate(0.7, 5.2, 0)
  dragonGeos.push(head)
  const dragon = new THREE.Mesh(merged('pl-dragon', dragonGeos.map((g) => new THREE.Mesh(g)), 0xc9a227).geometry, new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.55, metalness: 0.2 }))
  addBlock(A, blocks, 'pl-dragon', dragon, i++)
  const sp = textSprite('宋元祐蟠龙 · 缠柱欲飞')
  sp.position.set(0, 6.6, 0)
  A.add(sp)

  // 右：菱花格扇
  addBlock(B, blocks, 'pl-frame', box(3.4, 4.6, 0.24, 0, 2.3, 0, WOOD_D), i++)
  const bars: THREE.BufferGeometry[] = []
  for (let x = -1.4; x <= 1.41; x += 0.47) {
    const b = new THREE.BoxGeometry(0.08, 3.4, 0.08)
    b.translate(x, 2.3, 0.2)
    bars.push(b)
  }
  for (let y = 0.8; y <= 3.9; y += 0.52) {
    const b = new THREE.BoxGeometry(3.0, 0.08, 0.08)
    b.translate(0, y, 0.2)
    bars.push(b)
  }
  const lattice = new THREE.Mesh(merged('pl-lattice', bars.map((g) => new THREE.Mesh(g)), WOOD).geometry, new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.8 }))
  addBlock(B, blocks, 'pl-lattice', lattice, i++)
  const sp2 = textSprite('菱花格扇 · 透光木蕾丝')
  sp2.position.set(0, 5.6, 0)
  B.add(sp2)

  group.add(A, B)
  return { group, blocks }
}

// ---- E. 彩塑构成（彩塑类寺院） ----
function buildStatue(): JointModel {
  const group = new THREE.Group()
  const blocks: JointBlock[] = []
  const A = new THREE.Group()
  A.position.set(0, 0, 0)
  let i = 0
  // 莲座
  addBlock(A, blocks, 'st-lotus1', cyl(0.85, 0.24, 0, 0.12, 0, 0xb99a5e), i++)
  addBlock(A, blocks, 'st-lotus2', cyl(0.68, 0.2, 0, 0.36, 0, 0xc9a227), i++)
  // 身形（结跏趺坐）
  const prof = [
    new THREE.Vector2(0.01, 0.0),
    new THREE.Vector2(0.6, 0.02),
    new THREE.Vector2(0.68, 0.2),
    new THREE.Vector2(0.5, 0.6),
    new THREE.Vector2(0.42, 0.95),
    new THREE.Vector2(0.36, 1.2),
    new THREE.Vector2(0.14, 1.33),
    new THREE.Vector2(0.01, 1.35),
  ]
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 12), new THREE.MeshStandardMaterial({ color: 0xc2a05a, roughness: 0.55 }))
  body.position.y = 0.5
  body.castShadow = true
  addBlock(A, blocks, 'st-body', body, i++)
  // 头与肉髻
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), new THREE.MeshStandardMaterial({ color: 0xc2a05a, roughness: 0.5 }))
  head.position.y = 2.0
  addBlock(A, blocks, 'st-head', head, i++)
  const ush = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshStandardMaterial({ color: 0xa8894a, roughness: 0.5 }))
  ush.position.y = 2.24
  addBlock(A, blocks, 'st-ush', ush, i++)
  // 背光
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 6, 24), new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.5, metalness: 0.3 }))
  halo.position.set(0, 1.75, -0.3)
  addBlock(A, blocks, 'st-halo', halo, i++)
  const sp = textSprite('莲座 · 身形 · 头光背光')
  sp.position.set(0, 3.4, 0)
  A.add(sp)
  group.add(A)
  return { group, blocks }
}

export function buildJointOf(type: JointType): JointModel {
  switch (type) {
    case 'chashou':
      return buildChashou()
    case 'cliff-beam':
      return buildCliffBeam()
    case 'glaze':
      return buildGlaze()
    case 'panlong':
      return buildPanlong()
    case 'statue':
      return buildStatue()
    default:
      return buildJoint()
  }
}

// 目录数据
export const JOINT_VARIANT_PARTS: Record<JointType, { name: string; parts: JointPartInfo[] }[]> = {
  default: [],
  chashou: [
    {
      name: '叉手托脊（左）',
      parts: [
        { id: 'cs-platform', name: '台座', group: '叉手托脊（左）', desc: '承托梁架的台座。' },
        { id: 'cs-pingliang', name: '平梁', group: '叉手托脊（左）', desc: '四椽栿之上的承重大梁，两端架于斗拱，中央托脊。' },
        { id: 'cs-chashou-l', name: '叉手 · 左', group: '叉手托脊（左）', desc: '斜向撑住脊槫的左叉手——与右叉手形成稳定三角，不用侏儒柱，是唐构的标志。' },
        { id: 'cs-chashou-r', name: '叉手 · 右', group: '叉手托脊（左）', desc: '右叉手与左叉手在脊点相交，夹持脊槫。' },
        { id: 'cs-jituan', name: '脊槫', group: '叉手托脊（左）', desc: '屋顶最高处的通长圆木，由叉手夹持。' },
        { id: 'cs-tuofeng', name: '驼峰垫块', group: '叉手托脊（左）', desc: '梁与叉手之间的垫木，调节高度、传递荷载——不是侏儒柱。' },
        { id: 'cs-tuofeng2', name: '驼峰垫块', group: '叉手托脊（左）', desc: '另一端的垫木。' },
      ],
    },
    {
      name: '七铺作斗拱（右）',
      parts: [],
    },
  ],
  'cliff-beam': [
    {
      name: '斜插横梁（左）',
      parts: [
        { id: 'cb-rock', name: '崖体', group: '斜插横梁（左）', desc: '翠屏峰的凹进崖壁，岩体自重是全部结构的地基。' },
        { id: 'cb-hole', name: '石孔', group: '斜插横梁（左）', desc: '崖壁上凿出的斜孔，内高外低。' },
        { id: 'cb-beam', name: '悬臂横梁', group: '斜插横梁（左）', desc: '斜向上插入石孔：殿阁越重，横梁在孔内楔得越紧。' },
        { id: 'cb-wedge', name: '楔紧区', group: '斜插横梁（左）', desc: '梁尾被岩体压紧的区域——越压越紧的自锁点。' },
        { id: 'cb-deck', name: '平台板', group: '斜插横梁（左）', desc: '横梁挑出端上铺设的平台。' },
      ],
    },
    {
      name: '立木与平台（右）',
      parts: [
        { id: 'cb-deck2', name: '平台', group: '立木与平台（右）', desc: '殿阁脚下的平台板。' },
        { id: 'cb-beam2', name: '承台横梁', group: '立木与平台（右）', desc: '平台下真正的承重梁。' },
        { id: 'cb-post', name: '垂吊立木', group: '立木与平台（右）', desc: '垂在平台下的短柱，下端悬空——它并不受力，只是让登临者心里踏实。' },
        { id: 'cb-post2', name: '垂吊立木', group: '立木与平台（右）', desc: '同样悬空的另一根立木。' },
      ],
    },
  ],
  glaze: [
    {
      name: '琉璃斗拱（左）',
      parts: [
        { id: 'gl-ludou', name: '琉璃栌斗', group: '琉璃斗拱（左）', desc: '绿釉烧制的斗拱底座，仿木形制而永不腐朽。' },
        { id: 'gl-huagong', name: '琉璃华栱', group: '琉璃斗拱（左）', desc: '出跳的华栱，木纹被翻模进陶土。' },
        { id: 'gl-nidao', name: '琉璃泥道栱', group: '琉璃斗拱（左）', desc: '横向锁扣的泥道栱。' },
        { id: 'gl-dou1', name: '琥珀釉斗件', group: '琉璃斗拱（左）', desc: '黄釉的小斗，与绿釉栱件相间成辉。' },
        { id: 'gl-guazi', name: '琉璃瓜子栱', group: '琉璃斗拱（左）', desc: '两端上卷的横栱。' },
        { id: 'gl-ang', name: '琉璃下昂', group: '琉璃斗拱（左）', desc: '斜置的昂，黄釉在阳光下如金。' },
        { id: 'gl-fang', name: '琉璃撩檐枋', group: '琉璃斗拱（左）', desc: '承檐的通长枋，绿色琉璃。' },
      ],
    },
    {
      name: '琉璃佛龛（右）',
      parts: [
        { id: 'gl-niche-base', name: '佛龛基座', group: '琉璃佛龛（右）', desc: '琉璃烧制的佛龛台座。' },
        { id: 'gl-niche-l', name: '佛龛侧柱', group: '琉璃佛龛（右）', desc: '左侧龛柱。' },
        { id: 'gl-niche-r', name: '佛龛侧柱', group: '琉璃佛龛（右）', desc: '右侧龛柱。' },
        { id: 'gl-niche-top', name: '佛龛顶檐', group: '琉璃佛龛（右）', desc: '黄釉龛檐，五百年色彩依旧。' },
      ],
    },
  ],
  panlong: [
    {
      name: '蟠龙柱（左）',
      parts: [
        { id: 'pl-col', name: '檐柱', group: '蟠龙柱（左）', desc: '圣母殿前檐柱，北宋原物。' },
        { id: 'pl-base', name: '柱础', group: '蟠龙柱（左）', desc: '石质柱础。' },
        { id: 'pl-dragon', name: '木雕蟠龙', group: '蟠龙柱（左）', desc: '宋元祐二年（1087）木雕蟠龙，螺旋缠柱、张牙舞爪——中国现存最早的木雕盘龙柱。' },
      ],
    },
    {
      name: '菱花格扇（右）',
      parts: [
        { id: 'pl-frame', name: '格扇边框', group: '菱花格扇（右）', desc: '门窗的木质边框。' },
        { id: 'pl-lattice', name: '菱花棂格', group: '菱花格扇（右）', desc: '透光的菱花窗格，既采光又挡风，金宋小木作的精细活。' },
      ],
    },
  ],
  statue: [
    {
      name: '彩塑构成',
      parts: [
        { id: 'st-lotus1', name: '莲座下枋', group: '彩塑构成', desc: '须弥座式莲台下层。' },
        { id: 'st-lotus2', name: '莲瓣座', group: '彩塑构成', desc: '层层莲瓣承托佛身。' },
        { id: 'st-body', name: '结跏趺坐身形', group: '彩塑构成', desc: '盘坐的身躯与衣纹，彩塑的体量与神态核心。' },
        { id: 'st-head', name: '佛首', group: '彩塑构成', desc: '面相与神情所在。' },
        { id: 'st-ush', name: '肉髻', group: '彩塑构成', desc: '佛顶肉髻，造像的标志性部位。' },
        { id: 'st-halo', name: '背光', group: '彩塑构成', desc: '头光背光，辽代彩塑常绘火焰纹与飞天。' },
      ],
    },
  ],
}
