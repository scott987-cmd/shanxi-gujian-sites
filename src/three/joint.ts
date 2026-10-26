// 节点工坊：斗拱与叉柱造的构件级模型（每块木头可点击、可拆解）
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// 文字碑牌（Canvas 贴图）
function labelPlane(text: string, w: number, h: number): THREE.Mesh {
  const cv = document.createElement('canvas')
  cv.width = 512
  cv.height = Math.round((512 * h) / w)
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = '#1b1510'
  ctx.fillRect(0, 0, cv.width, cv.height)
  ctx.strokeStyle = '#c9a227'
  ctx.lineWidth = 8
  ctx.strokeRect(8, 8, cv.width - 16, cv.height - 16)
  ctx.fillStyle = '#eacd7a'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `900 ${Math.floor(cv.height * 0.42)}px "Noto Serif SC", "Songti SC", serif`
  ctx.fillText(text, cv.width / 2, cv.height / 2 + 4)
  const tex = new THREE.CanvasTexture(cv)
  tex.anisotropy = 4
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, side: THREE.DoubleSide }))
}

// 悬浮标注（始终面向镜头）
export function textSprite(text: string, w = 3.4, h = 0.64, fontPx = 44): THREE.Sprite {
  const cv = document.createElement('canvas')
  cv.width = 512
  cv.height = Math.round((512 * h) / w)
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = 'rgba(27,21,16,0.85)'
  ctx.beginPath()
  ctx.roundRect(0, 0, 512, cv.height, 24)
  ctx.fill()
  ctx.fillStyle = '#eacd7a'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `600 ${fontPx}px "Noto Serif SC", "Songti SC", serif`
  ctx.fillText(text, 256, cv.height / 2 + 4)
  const tex = new THREE.CanvasTexture(cv)
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }))
  sp.scale.set(w, h, 1)
  return sp
}

// 虚线
function dashedLine(p1: THREE.Vector3, p2: THREE.Vector3, color = 0xa63d2a): THREE.Line {
  const g = new THREE.BufferGeometry().setFromPoints([p1, p2])
  const l = new THREE.Line(g, new THREE.LineDashedMaterial({ color, dashSize: 0.18, gapSize: 0.12 }))
  l.computeLineDistances()
  return l
}

// 箭头（线 + 锥头）
function arrow(p1: THREE.Vector3, p2: THREE.Vector3, color = 0xc9a227): THREE.Group {
  const g = new THREE.Group()
  const dir = new THREE.Vector3().subVectors(p2, p1)
  const len = dir.length()
  const line = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 6), new THREE.MeshStandardMaterial({ color }))
  line.position.copy(p1).addScaledVector(dir, 0.5)
  line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.36, 8), new THREE.MeshStandardMaterial({ color }))
  head.position.copy(p2).addScaledVector(dir.clone().normalize(), -0.1)
  head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
  g.add(line, head)
  return g
}

export interface JointBlock {
  id: string
  mesh: THREE.Mesh
  baseY: number
  index: number
}

export interface JointModel {
  group: THREE.Group
  blocks: JointBlock[]
}

const WOOD = 0x8a5a35
const WOOD_D = 0x66422a
const DOU = 0x5c3a21
const ANG = 0xc9a227

export function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  color: number,
  rx = 0,
  ry = 0,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness: 0.8 }))
  m.rotation.set(rx, ry, 0)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

export function cyl(r: number, h: number, x: number, y: number, z: number, color: number): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.06, h, 12), new THREE.MeshStandardMaterial({ color, roughness: 0.8 }))
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

export function addBlock(group: THREE.Group, blocks: JointBlock[], id: string, mesh: THREE.Mesh, index: number) {
  mesh.userData.blockId = id
  group.add(mesh)
  blocks.push({ id, mesh, baseY: mesh.position.y, index })
}

// 组合若干 mesh 为一个 id 的块（返回合并 mesh）
export function merged(id: string, meshes: THREE.Mesh[], color: number): THREE.Mesh {
  const geos = meshes.map((m) => {
    m.updateMatrix()
    const g = m.geometry.clone().applyMatrix4(m.matrix)
    return g
  })
  const out = new THREE.Mesh(mergeGeometries(geos)!, new THREE.MeshStandardMaterial({ color, roughness: 0.8 }))
  out.castShadow = true
  out.receiveShadow = true
  out.userData.blockId = id
  return out
}

export function buildJoint(): JointModel {
  const group = new THREE.Group()
  const blocks: JointBlock[] = []

  // ================= 左侧：斗拱（双杪单昂五铺作示意） =================
  const A = new THREE.Group()
  A.position.set(-5.2, 0, 0)
  let i = 0

  // 立柱
  addBlock(A, blocks, 'j-col', cyl(0.52, 3.2, 0, 1.6, 0, WOOD), i++)
  // 阑额
  addBlock(A, blocks, 'j-lane', box(4.4, 0.55, 0.7, 0, 3.45, 0, WOOD_D), i++)
  // 栌斗
  addBlock(A, blocks, 'j-ludou', box(1.2, 0.78, 1.2, 0, 4.15, 0, DOU), i++)
  // 泥道栱（横）+ 华栱（出跳）十字相交
  addBlock(A, blocks, 'j-nidao', box(2.5, 0.42, 0.46, 0, 4.78, 0, WOOD), i++)
  addBlock(A, blocks, 'j-huagong', box(0.46, 0.46, 3.0, 0, 4.82, 0.25, WOOD), i++)
  // 交互斗 + 散斗（第一批）
  addBlock(
    A,
    blocks,
    'j-dou1',
    merged('j-dou1', [box(0.52, 0.5, 0.52, 0, 5.3, 1.45, DOU), box(0.42, 0.4, 0.42, -1.05, 5.22, 0, DOU), box(0.42, 0.4, 0.42, 1.05, 5.22, 0, DOU)], DOU),
    i++,
  )
  // 瓜子栱
  addBlock(A, blocks, 'j-guazi', box(3.2, 0.42, 0.46, 0, 5.78, 1.45, WOOD), i++)
  // 第二跳华栱
  addBlock(A, blocks, 'j-huagong2', box(0.46, 0.46, 4.2, 0, 6.05, 1.0, WOOD), i++)
  // 散斗（瓜子栱两端 + 二跳头）
  addBlock(
    A,
    blocks,
    'j-dou2',
    merged('j-dou2', [box(0.42, 0.4, 0.42, -1.4, 6.2, 1.45, DOU), box(0.42, 0.4, 0.42, 1.4, 6.2, 1.45, DOU), box(0.52, 0.5, 0.52, 0, 6.55, 2.85, DOU)], DOU),
    i++,
  )
  // 慢栱
  addBlock(A, blocks, 'j-man', box(4.0, 0.42, 0.46, 0, 6.62, 1.45, WOOD), i++)
  // 下昂（斜杠杆，前端低后端高？——昂尖向下斜出）
  addBlock(A, blocks, 'j-ang', box(0.5, 0.52, 4.8, 0, 7.35, 1.6, ANG, -0.32, 0), i++)
  // 令栱
  addBlock(A, blocks, 'j-ling', box(2.8, 0.42, 0.46, 0, 8.05, 3.35, WOOD), i++)
  // 撩檐枋
  addBlock(A, blocks, 'j-fang', box(5.4, 0.5, 0.55, 0, 8.55, 3.35, WOOD_D), i++)
  // 檐椽示意
  addBlock(A, blocks, 'j-rafter', box(3.6, 0.3, 2.2, 0, 9.0, 4.2, 0x9c8672, -0.15, 0), i++)

  // ================= 右侧：叉柱造 =================
  const B = new THREE.Group()
  B.position.set(5.2, 0, 0)
  i = 0

  // 下柱
  addBlock(B, blocks, 'c-lowcol', cyl(0.5, 3.0, 0, 1.5, 0, WOOD), i++)
  // 柱头枋
  addBlock(B, blocks, 'c-beam', box(3.6, 0.5, 0.65, 0, 3.25, 0, WOOD_D), i++)
  // 柱头斗拱（三层）
  addBlock(B, blocks, 'c-ludou', box(1.15, 0.7, 1.15, 0, 3.85, 0, DOU), i++)
  addBlock(B, blocks, 'c-gong1', box(2.1, 0.42, 0.5, 0, 4.42, 0, WOOD), i++)
  addBlock(B, blocks, 'c-gong2', merged('c-gong2', [box(2.9, 0.42, 0.5, 0, 4.95, 0, WOOD), box(0.5, 0.42, 2.4, 0, 4.95, 0.4, WOOD)], WOOD), i++)
  // 上层柱：柱脚十字开口（用两条暗色凹槽表现），向内退半个柱径
  const upCol = cyl(0.44, 3.0, -0.24, 6.9, 0, WOOD)
  addBlock(B, blocks, 'c-upcol', upCol, i++)
  addBlock(
    B,
    blocks,
    'c-slot',
    merged('c-slot', [box(0.5, 0.6, 0.16, -0.24, 5.5, 0, 0x2b2018), box(0.16, 0.6, 0.5, -0.24, 5.5, 0, 0x2b2018)], 0x2b2018),
    i++,
  )
  // 收分示意：虚线圈（略，用说明文字代替）

  // ============ 台座、题碑与构造标注 ============
  const stone = new THREE.MeshStandardMaterial({ color: 0x6e6557, roughness: 0.95 })
  for (const grp of [A, B]) {
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.55, 6.4), stone)
    plinth.position.y = -0.29
    plinth.receiveShadow = true
    grp.add(plinth)
  }
  // 题碑
  const steleA = labelPlane('斗拱', 2.3, 0.92)
  steleA.position.set(0, 0.52, 3.05)
  steleA.rotation.x = -0.12
  A.add(steleA)
  const steleB = labelPlane('叉柱造', 2.6, 0.92)
  steleB.position.set(0, 0.52, 3.05)
  steleB.rotation.x = -0.12
  B.add(steleB)

  // 斗拱：出跳方向标注
  A.add(arrow(new THREE.Vector3(0, 4.4, -0.4), new THREE.Vector3(0, 4.4, 3.2)))
  const sp1 = textSprite('层层出跳 · 挑出飞檐')
  sp1.position.set(0, 10.6, 2.2)
  A.add(sp1)

  // 叉柱造：轴线内退标注
  B.add(dashedLine(new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(0, 5.35, 0), 0x8a7f6a))
  B.add(dashedLine(new THREE.Vector3(-0.24, 5.3, 0), new THREE.Vector3(-0.24, 10.2, 0), 0xa63d2a))
  B.add(arrow(new THREE.Vector3(0.06, 5.62, 0), new THREE.Vector3(-0.42, 5.62, 0), 0xa63d2a))
  const sp2 = textSprite('上柱内退半柱径')
  sp2.position.set(1.9, 6.6, 0.6)
  B.add(sp2)

  group.add(A, B)
  return { group, blocks }
}
