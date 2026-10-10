// 程序化建模：应县木塔三维结构（尺寸按公开测绘数据等比缩放，单位：米）
// 支持纵向逐层拆解 + 横向径向散开（柱、斗拱、屋面花瓣式分离）
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { PAGODA_PARTS } from '@/data/pagoda'
import { textSprite } from './joint'

export interface BuiltLayer {
  id: string
  obj: THREE.Object3D
  baseY: number
  index: number
  mats: THREE.MeshStandardMaterial[]
}

export interface RadialPart {
  mesh: THREE.Object3D
  dx: number // 径向方向（单位向量）
  dz: number
  amount: number // 完全散开时的位移
  baseX: number
  baseY: number
  baseZ: number
  lift: number // 散开时的额外抬升
}

export interface PagodaModel {
  group: THREE.Group
  layers: BuiltLayer[]
  wallMats: THREE.MeshStandardMaterial[]
  fadeMats: THREE.MeshStandardMaterial[] // 散开时淡出
  radialParts: RadialPart[]
  labelMats: THREE.SpriteMaterial[] // 柱编号（散开时显现）
  totalHeight: number
}

// ---- 配色 ----
const COL = {
  wood: 0x8a5a35,
  woodDark: 0x66422a,
  bracket: 0x77604a,
  wall: 0xd9cbb0,
  roof: 0x3f4a55,
  roofRidge: 0x2f3841,
  stone: 0x8f8574,
  stoneDark: 0x6e6557,
  finial: 0x9c7a45,
  rail: 0x7a4e2d,
  buddha: 0xc2a05a,
}

const OROT = Math.PI / 8 // 八边形使南面为平面的旋转量

function vtx(R: number, k: number): [number, number] {
  const t = (Math.PI / 4) * k - OROT
  return [R * Math.sin(t), R * Math.cos(t)]
}
function sideMid(R: number, k: number): [number, number] {
  const t = (Math.PI / 4) * k
  return [R * Math.sin(t), R * Math.cos(t)]
}
const chord = (R: number) => 2 * R * Math.sin(Math.PI / 8)

function octGeo(geo: THREE.BufferGeometry) {
  geo.rotateY(OROT)
  return geo
}

function mat(color: number, roughness = 0.8, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.05, ...opts })
}

// ============ 斗拱：单攒几何（原点居中，可复用） ============
const clusterCache = new Map<string, THREE.BufferGeometry>()
function bracketClusterGeo(s: number): THREE.BufferGeometry {
  const key = s.toFixed(2)
  const hit = clusterCache.get(key)
  if (hit) return hit
  const boxes: THREE.BufferGeometry[] = []
  const add = (w: number, h: number, d: number, x: number, y: number, z: number) => {
    const b = new THREE.BoxGeometry(w, h, d)
    b.translate(x, y, z)
    boxes.push(b)
  }
  // 栌斗
  add(0.62 * s, 0.42 * s, 0.62 * s, 0, 0.21 * s, 0)
  // 第一跳：华栱（径向 z）+ 泥道栱（切向 x）
  add(0.26 * s, 0.24 * s, 1.7 * s, 0, 0.55 * s, 0)
  add(1.45 * s, 0.22 * s, 0.26 * s, 0, 0.56 * s, 0)
  // 交互斗/散斗
  add(0.34 * s, 0.3 * s, 0.34 * s, 0, 0.82 * s, 0.72 * s)
  for (const sg of [-1, 1]) {
    add(0.3 * s, 0.26 * s, 0.3 * s, sg * 0.62 * s, 0.8 * s, 0)
    add(0.3 * s, 0.26 * s, 0.3 * s, sg * 1.05 * s, 1.26 * s, 0.72 * s)
  }
  // 第二跳 + 令栱 + 撩檐枋
  add(0.26 * s, 0.24 * s, 2.5 * s, 0, 1.02 * s, 0.36 * s)
  add(2.15 * s, 0.24 * s, 0.28 * s, 0, 1.5 * s, 0.72 * s)
  add(2.5 * s, 0.3 * s, 0.32 * s, 0, 1.78 * s, 0.72 * s)
  const geo = mergeGeometries(boxes)!
  clusterCache.set(key, geo)
  return geo
}

// 一圈斗拱的簇位
function clusterPositions(R: number): { x: number; z: number; ry: number }[] {
  const out: { x: number; z: number; ry: number }[] = []
  for (let k = 0; k < 8; k++) {
    const [x1, z1] = vtx(R, k)
    const [x2, z2] = vtx(R, k + 1)
    for (const t of [0, 1 / 3, 2 / 3]) {
      const px = x1 + (x2 - x1) * t
      const pz = z1 + (z2 - z1) * t
      out.push({ x: px, z: pz, ry: Math.atan2(px, pz) })
    }
    const [mx, mz] = sideMid(R, k)
    out.push({ x: mx, z: mz, ry: (Math.PI / 4) * k })
  }
  return out
}

// ============ 屋面：按面拆分（散开时八瓣开花） ============
function roofFaceGeo(Rridge: number, Reave: number, h: number, upturn: number, k: number): THREE.BufferGeometry {
  const a0 = (Math.PI / 4) * k - OROT // 左角
  const a1 = (Math.PI / 4) * (k + 1) - OROT // 右角
  const NR = 4 // 径向分段
  const NA = 3 // 角向分段
  const pos: number[] = []
  const idx: number[] = []
  for (let r = 0; r <= NR; r++) {
    const t = r / NR // 0=脊 1=檐口
    const rad = Rridge + (Reave - Rridge) * t
    for (let j = 0; j <= NA; j++) {
      const a = a0 + ((a1 - a0) * j) / NA
      const corner = Math.abs(j / NA - 0.5) * 2 // 0=面中 1=角
      const y = h / 2 - t * h + upturn * Math.pow(t, 1.6) * Math.pow(corner, 2.2)
      pos.push(rad * Math.sin(a), y, rad * Math.cos(a))
    }
  }
  for (let r = 0; r < NR; r++) {
    for (let j = 0; j < NA; j++) {
      const i0 = r * (NA + 1) + j
      const i1 = i0 + NA + 1
      idx.push(i0, i1, i0 + 1, i0 + 1, i1, i1 + 1)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  // 左角屋脊并入该面
  const [x1, z1] = vtx(Rridge, k)
  const [x2, z2] = vtx(Reave, k)
  const p1 = new THREE.Vector3(x1, h / 2 - 0.05, z1)
  const p2 = new THREE.Vector3(x2, -h / 2 + upturn + 0.05, z2)
  const dir = new THREE.Vector3().subVectors(p2, p1)
  const ridge = new THREE.CylinderGeometry(0.13, 0.19, dir.length(), 5)
  const rm = new THREE.Mesh(ridge)
  rm.position.copy(p1).addScaledVector(dir, 0.5)
  rm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
  rm.updateMatrix()
  ridge.applyMatrix4(rm.matrix)
  // 风铎挂在檐角
  const strG = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 4)
  strG.translate(x2, -h / 2 + upturn - 0.2, z2)
  const bellG = new THREE.ConeGeometry(0.16, 0.34, 8)
  bellG.translate(x2, -h / 2 + upturn - 0.6, z2)
  return mergeGeometries([g, ridge, strG, bellG])!
}

// ============ 柱位 ============
function columnPositions(R: number): [number, number][] {
  const pts: [number, number][] = []
  for (let k = 0; k < 8; k++) {
    const [x1, z1] = vtx(R, k)
    const [x2, z2] = vtx(R, k + 1)
    pts.push([x1, z1])
    for (const t of [1 / 3, 2 / 3]) pts.push([x1 + (x2 - x1) * t, z1 + (z2 - z1) * t])
  }
  return pts
}

// 八边形环梁（阑额/普拍枋）
function ringBeams(R: number, y: number, h: number, thick: number): THREE.BufferGeometry {
  const geos: THREE.BufferGeometry[] = []
  const len = chord(R) + thick
  for (let k = 0; k < 8; k++) {
    const [x, z] = sideMid(R, k)
    const g = new THREE.BoxGeometry(len, h, thick)
    g.rotateY((Math.PI / 4) * k)
    g.translate(x, y, z)
    geos.push(g)
  }
  return mergeGeometries(geos)!
}

// ============ 辽代造像 ============
let buddhaGeoCache: THREE.BufferGeometry | null = null
export function buddhaGeo(): THREE.BufferGeometry {
  if (buddhaGeoCache) return buddhaGeoCache
  const parts: THREE.BufferGeometry[] = []
  const p1 = new THREE.CylinderGeometry(0.8, 0.92, 0.18, 8)
  p1.translate(0, 0.09, 0)
  const p2 = new THREE.CylinderGeometry(0.68, 0.78, 0.16, 8)
  p2.translate(0, 0.26, 0)
  const prof = [
    new THREE.Vector2(0.01, 0.34),
    new THREE.Vector2(0.6, 0.36),
    new THREE.Vector2(0.68, 0.55),
    new THREE.Vector2(0.5, 0.95),
    new THREE.Vector2(0.42, 1.3),
    new THREE.Vector2(0.36, 1.55),
    new THREE.Vector2(0.14, 1.68),
    new THREE.Vector2(0.01, 1.7),
  ]
  const body = new THREE.LatheGeometry(prof, 12)
  const head = new THREE.SphereGeometry(0.26, 12, 10)
  head.translate(0, 1.92, 0)
  const ush = new THREE.SphereGeometry(0.1, 8, 6)
  ush.translate(0, 2.16, 0)
  const halo = new THREE.TorusGeometry(0.55, 0.05, 6, 24)
  halo.translate(0, 1.7, -0.3)
  parts.push(p1, p2, body, head, ush, halo)
  buddhaGeoCache = mergeGeometries(parts)!
  return buddhaGeoCache
}

function placeBuddha(parent: THREE.Group, m: THREE.Material, x: number, z: number, s: number, ry = 0) {
  const b = new THREE.Mesh(buddhaGeo(), m)
  b.position.set(x, 0, z)
  b.scale.setScalar(s)
  b.rotation.y = ry
  b.castShadow = true
  parent.add(b)
}

function addStatues(id: string, g: THREE.Group, m: THREE.Material, h: number) {
  if (id === 's1-cols') {
    placeBuddha(g, m, 0, 0, 1.9, 0)
    const coffer = new THREE.Mesh(octGeo(new THREE.CylinderGeometry(3.6, 3.6, 0.18, 8)), m)
    coffer.position.y = h - 0.35
    const cofferIn = new THREE.Mesh(octGeo(new THREE.CylinderGeometry(2.2, 2.2, 0.2, 8)), m)
    cofferIn.position.y = h - 0.22
    g.add(coffer, cofferIn)
  }
  if (id === 's2-cols') {
    placeBuddha(g, m, 0, 0, 1.15, 0)
    placeBuddha(g, m, -1.7, 0.4, 0.78, 0)
    placeBuddha(g, m, 1.7, 0.4, 0.78, 0)
  }
  if (id === 's3-cols') {
    for (let k = 0; k < 4; k++) {
      const a = (Math.PI / 2) * k
      placeBuddha(g, m, Math.sin(a) * 1.7, Math.cos(a) * 1.7, 0.95, a)
    }
  }
  if (id === 's4-cols') {
    placeBuddha(g, m, -1.3, 0, 1.0, 0)
    placeBuddha(g, m, 1.3, 0, 1.0, 0)
  }
  if (id === 's5-cols') {
    placeBuddha(g, m, 0, 0, 1.1, 0)
    for (let k = 0; k < 4; k++) {
      const a = (Math.PI / 2) * k + Math.PI / 4
      placeBuddha(g, m, Math.sin(a) * 2.2, Math.cos(a) * 2.2, 0.55, a + Math.PI)
    }
  }
}

// ============ 牌匾 ============
export function plaqueMesh(text: string, w: number, h: number, vertical = false): THREE.Mesh {
  const cv = document.createElement('canvas')
  cv.width = vertical ? 128 : 512
  cv.height = vertical ? 512 : 128
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = '#1b1510'
  ctx.fillRect(0, 0, cv.width, cv.height)
  ctx.strokeStyle = '#c9a227'
  ctx.lineWidth = 10
  ctx.strokeRect(10, 10, cv.width - 20, cv.height - 20)
  ctx.fillStyle = '#eacd7a'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  if (vertical) {
    const fs = 92
    ctx.font = `900 ${fs}px "Noto Serif SC", "Songti SC", serif`
    text.split('').forEach((ch, i) => ctx.fillText(ch, 64, 84 + i * 118))
  } else {
    ctx.font = `900 80px "Noto Serif SC", "Songti SC", serif`
    ctx.fillText(text, 256, 70)
  }
  const tex = new THREE.CanvasTexture(cv)
  tex.anisotropy = 4
  const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 })
  const side = new THREE.MeshStandardMaterial({ color: 0x1b1510, roughness: 0.8 })
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.14), [side, side, side, side, face, side])
}

const PLAQUES: Record<string, { text: string; w: number; h: number; vertical?: boolean }> = {
  's1-cols': { text: '万古观瞻', w: 3.6, h: 1.1 },
  's2-cols': { text: '正直', w: 2.6, h: 1.0 },
  's3-cols': { text: '释迦塔', w: 1.35, h: 3.8, vertical: true },
  's4-cols': { text: '天下奇观', w: 3.2, h: 1.0 },
  's5-cols': { text: '峻极神工', w: 3.0, h: 0.95 },
}

// ============ 暗层 ============
function mezzanineGroup(R: number, h: number, mWood: THREE.Material, mRail: THREE.Material): THREE.Group {
  const g = new THREE.Group()
  const braces: THREE.BufferGeometry[] = []
  const posts: THREE.BufferGeometry[] = []
  const perSide = 3
  for (let k = 0; k < 8; k++) {
    const [x1, z1] = vtx(R, k)
    const [x2, z2] = vtx(R, k + 1)
    for (let i = 0; i < perSide; i++) {
      const t0 = i / perSide
      const t1 = (i + 1) / perSide
      const ax = x1 + (x2 - x1) * t0
      const az = z1 + (z2 - z1) * t0
      const bx = x1 + (x2 - x1) * t1
      const bz = z1 + (z2 - z1) * t1
      const p1 = new THREE.Vector3(ax, 0.1, az)
      const p2 = new THREE.Vector3(bx, h - 0.1, bz)
      const p3 = new THREE.Vector3(ax, h - 0.1, az)
      const p4 = new THREE.Vector3(bx, 0.1, bz)
      for (const [pa, pb] of [
        [p1, p2],
        [p3, p4],
      ] as const) {
        const dir = new THREE.Vector3().subVectors(pb, pa)
        const bg = new THREE.BoxGeometry(0.16, dir.length(), 0.16)
        const bm = new THREE.Mesh(bg)
        bm.position.copy(pa).addScaledVector(dir, 0.5)
        bm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
        bm.updateMatrix()
        bg.applyMatrix4(bm.matrix)
        braces.push(bg)
      }
      const pg = new THREE.BoxGeometry(0.22, h, 0.22)
      pg.translate(ax, h / 2, az)
      posts.push(pg)
    }
  }
  g.add(new THREE.Mesh(mergeGeometries(braces)!, mWood))
  g.add(new THREE.Mesh(mergeGeometries(posts)!, mWood))
  g.add(new THREE.Mesh(ringBeams(R, h - 0.15, 0.22, 0.3), mWood))
  g.add(new THREE.Mesh(ringBeams(R, 0.15, 0.22, 0.3), mWood))
  const Rr = R + 0.9
  g.add(new THREE.Mesh(ringBeams(Rr, h + 0.75, 0.12, 0.14), mRail))
  g.add(new THREE.Mesh(ringBeams(Rr, h + 0.4, 0.1, 0.12), mRail))
  const railPosts: THREE.BufferGeometry[] = []
  for (const [x, z] of columnPositions(Rr)) {
    const pg = new THREE.BoxGeometry(0.1, 0.9, 0.1)
    pg.translate(x, h + 0.45, z)
    railPosts.push(pg)
  }
  g.add(new THREE.Mesh(mergeGeometries(railPosts)!, mRail))
  const floor = new THREE.Mesh(octGeo(new THREE.CylinderGeometry(Rr, Rr, 0.12, 8)), mWood)
  floor.position.y = h + 0.02
  g.add(floor)
  return g
}

// ============ 主构建 ============
export function buildPagoda(): PagodaModel {
  const group = new THREE.Group()
  const layers: BuiltLayer[] = []
  const wallMats: THREE.MeshStandardMaterial[] = []
  const fadeMats: THREE.MeshStandardMaterial[] = []
  const radialParts: RadialPart[] = []
  const labelMats: THREE.SpriteMaterial[] = []

  let cursor = 0
  let index = 0

  const push = (id: string, obj: THREE.Object3D, mats: THREE.MeshStandardMaterial[]) => {
    obj.position.y = cursor
    obj.userData.layerId = id
    obj.traverse((o) => {
      o.userData.layerId = id
      if (o instanceof THREE.Mesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
    group.add(obj)
    layers.push({ id, obj, baseY: cursor, index, mats })
    const part = PAGODA_PARTS.find((p) => p.id === id)!
    cursor += part.h
    index++
  }

  const addRadial = (mesh: THREE.Object3D, lift = 0) => {
    const x = mesh.position.x
    const z = mesh.position.z
    const d = Math.hypot(x, z)
    if (d < 0.01) return
    radialParts.push({ mesh, dx: x / d, dz: z / d, amount: d * 0.55 + 0.6, baseX: x, baseY: mesh.position.y, baseZ: z, lift })
  }

  const storyR: Record<string, number> = {
    'veranda-cols': 14.25,
    's1-cols': 12,
    's2-cols': 10.25,
    's3-cols': 8.85,
    's4-cols': 7.55,
    's5-cols': 6.3,
  }

  for (const part of PAGODA_PARTS) {
    const g = new THREE.Group()
    const mats: THREE.MeshStandardMaterial[] = []

    if (part.kind === 'foundation') {
      const m1 = mat(COL.stoneDark, 0.95)
      const m2 = mat(COL.stone, 0.95)
      mats.push(m1, m2)
      const low = new THREE.Mesh(new THREE.BoxGeometry(34, part.h * 0.48, 34), m1)
      low.position.y = part.h * 0.24
      const up = new THREE.Mesh(octGeo(new THREE.CylinderGeometry(15.8, 16.4, part.h * 0.52, 8)), m2)
      up.position.y = part.h * 0.48 + part.h * 0.26
      g.add(low, up)
    }

    if (part.kind === 'columns' || part.kind === 'veranda') {
      const isVeranda = part.kind === 'veranda'
      const R = storyR[part.id]
      const mWood = mat(COL.wood)
      const mWall = mat(COL.wall, 0.9)
      const mBeam = mat(COL.woodDark)
      mats.push(mWood, mWall, mBeam)
      const h = part.h
      // 外槽柱：独立网格，可径向散开（散开时亮出编号）
      const storyTag: Record<string, string> = {
        'veranda-cols': '廊',
        's1-cols': '一',
        's2-cols': '二',
        's3-cols': '三',
        's4-cols': '四',
        's5-cols': '五',
      }
      const colR = isVeranda ? 0.24 : 0.28
      const colGeo = new THREE.CylinderGeometry(colR, colR * 1.08, h, 8)
      columnPositions(R).forEach(([x, z], ci) => {
        const c = new THREE.Mesh(colGeo, mWood)
        c.position.set(x, h / 2, z)
        g.add(c)
        addRadial(c, 0.3)
        const tag = textSprite(`${storyTag[part.id]}${String(ci + 1).padStart(2, '0')}`, 1.35, 0.42, 56)
        tag.position.set(0, h / 2 + 0.5, 0)
        const tm = tag.material as THREE.SpriteMaterial
        tm.opacity = 0
        labelMats.push(tm)
        c.add(tag)
      })
      if (!isVeranda) {
        // 内槽柱
        const mInner = mat(COL.woodDark)
        mats.push(mInner)
        const innerGeo = new THREE.CylinderGeometry(0.34, 0.36, h, 8)
        for (let k = 0; k < 8; k++) {
          const [x, z] = vtx(R * 0.45, k)
          const c = new THREE.Mesh(innerGeo, mInner)
          c.position.set(x, h / 2, z)
          g.add(c)
          addRadial(c, 0.5)
        }
        // 墙体（散开时淡出，露出佛堂造像）
        mWall.side = THREE.DoubleSide
        const wall = new THREE.Mesh(octGeo(new THREE.CylinderGeometry(R * 0.97, R * 0.97, h * 0.78, 8, 1, true)), mWall)
        wall.position.y = h * 0.47
        g.add(wall)
        wallMats.push(mWall)
        fadeMats.push(mWall)
        if (part.id === 's1-cols') {
          const mDoor = mat(0x241c14, 1)
          mats.push(mDoor)
          fadeMats.push(mDoor)
          const door = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 4.2), mDoor)
          door.position.set(0, 2.2, R * 0.97 + 0.02)
          g.add(door)
        }
        // 各层辽代造像
        const mBuddha = mat(COL.buddha, 0.55)
        mats.push(mBuddha)
        addStatues(part.id, g, mBuddha, h)
        // 塔内佛光（暖色点光，随明层移动）
        const glow = new THREE.PointLight(0xffc078, part.id === 's1-cols' ? 26 : 12, part.id === 's1-cols' ? 17 : 11, 1.8)
        glow.position.set(0, h * 0.52, 0)
        g.add(glow)
      }
      // 阑额环
      g.add(new THREE.Mesh(ringBeams(R, h - 0.2, 0.4, 0.5), mBeam))
      // 南面名匾
      const pq = PLAQUES[part.id]
      if (pq) {
        const plaque = plaqueMesh(pq.text, pq.w, pq.h, pq.vertical)
        plaque.position.set(0, pq.vertical ? h * 0.42 : h * 0.62, R * 0.97 + 0.35)
        g.add(plaque)
        addRadial(plaque, 0.2)
      }
    }

    if (part.kind === 'brackets') {
      const R = part.w / 2
      const mBr = mat(COL.bracket, 0.85)
      const mBeam = mat(COL.woodDark)
      mats.push(mBr, mBeam)
      const scale = part.h / 2.0
      const geo = bracketClusterGeo(scale)
      for (const c of clusterPositions(R - 0.4)) {
        const m = new THREE.Mesh(geo, mBr)
        m.position.set(c.x, 0, c.z)
        m.rotation.y = c.ry
        g.add(m)
        addRadial(m, 0.9)
      }
      g.add(new THREE.Mesh(ringBeams(R - 0.45, 0.12, 0.24, 0.42), mBeam))
    }

    if (part.kind === 'eave') {
      const Reave = part.w / 2
      const isSpire = part.id === 's5-eave'
      const Rridge = isSpire ? 0.4 : Reave * 0.58
      const mRoof = mat(COL.roof, 0.92, { side: THREE.DoubleSide })
      mats.push(mRoof)
      // 八瓣屋面，散开时向外平移
      for (let k = 0; k < 8; k++) {
        const face = new THREE.Mesh(roofFaceGeo(Rridge, Reave, part.h, isSpire ? 0.4 : 0.55, k), mRoof)
        face.position.y = part.h / 2
        g.add(face)
        const [mx, mz] = sideMid(Reave, k)
        const d = Math.hypot(mx, mz)
        radialParts.push({ mesh: face, dx: mx / d, dz: mz / d, amount: Reave * 0.3 + 0.8, baseX: 0, baseY: part.h / 2, baseZ: 0, lift: 0.6 })
      }
      if (!isSpire) {
        const mCap = mat(COL.roofRidge, 0.9, { transparent: true })
        mats.push(mCap)
        fadeMats.push(mCap)
        const cap = new THREE.Mesh(octGeo(new THREE.CylinderGeometry(Rridge + 0.1, Rridge + 0.1, 0.15, 8)), mCap)
        cap.position.y = part.h - 0.05
        g.add(cap)
      }
    }

    if (part.kind === 'mezzanine') {
      const mWood = mat(COL.wood, 0.85)
      const mRail = mat(COL.rail, 0.85)
      mats.push(mWood, mRail)
      g.add(mezzanineGroup(part.w / 2, part.h * 0.72, mWood, mRail))
    }

    if (part.kind === 'finial') {
      const mF = mat(COL.finial, 0.5, { metalness: 0.55 })
      mats.push(mF)
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, part.h, 8), mF)
      pole.position.y = part.h / 2
      g.add(pole)
      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mF)
      dome.rotation.x = Math.PI
      dome.position.y = 1.4
      g.add(dome)
      for (let i = 0; i < 7; i++) {
        const r = 1.15 - i * 0.13
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.09, 6, 16), mF)
        ring.rotation.x = Math.PI / 2
        ring.position.y = 2.6 + i * 0.75
        g.add(ring)
      }
      const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), mat(0xa63d2a, 0.4, { metalness: 0.3 }))
      jewel.position.y = part.h - 0.6
      g.add(jewel)
    }

    push(part.id, g, mats)
  }

  return { group, layers, wallMats, fadeMats, radialParts, labelMats, totalHeight: cursor }
}
