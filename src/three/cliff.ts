// 悬崖寺三维建模器（悬空寺型制：崖壁 + 悬臂横梁 + 平台栈道 + 凌空殿阁）
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { PagodaModel, BuiltLayer, RadialPart } from './pagoda'
import { plaqueMesh } from './pagoda'
import { rockTex, woodTex } from './textures'

function mat(color: number, roughness = 0.9, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.04, ...opts })
}

const ROCK = 0x55483c
const WOOD = 0x8a5a35
const WOOD_D = 0x66422a
const ROOF = 0x3f4a55
const PLANK = 0x6e523a

export function buildCliff(): PagodaModel {
  const group = new THREE.Group()
  const layers: BuiltLayer[] = []
  const radialParts: RadialPart[] = []
  const labelMats: THREE.SpriteMaterial[] = []

  let cursor = 0
  let index = 0
  const push = (id: string, h: number, obj: THREE.Object3D) => {
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
    layers.push({ id, obj, baseY: cursor, index, mats: [] })
    cursor += h
    index++
  }
  // 横梁三层的高度
  const LEVELS = [7, 12.5, 18]

  // ---- 1. 崖壁 ----
  {
    const g = new THREE.Group()
    const mR = mat(ROCK)
    mR.map = rockTex()
    mR.bumpMap = rockTex()
    mR.bumpScale = 0.6
    const geos: THREE.BufferGeometry[] = []
    // 主崖面（后壁）
    const main = new THREE.BoxGeometry(40, 34, 5)
    main.translate(0, 17, -6.5)
    geos.push(main)
    // 顶部前突的压檐岩（为寺院遮雨）
    const brow = new THREE.BoxGeometry(38, 4, 7)
    brow.translate(0, 31, -4.5)
    geos.push(brow)
    // 参差岩块
    const bumps: [number, number, number, number, number, number][] = [
      [-14, 6, 2.5, 8, 7, 2],
      [12, 9, 2.2, 7, 9, 2.2],
      [-8, 22, 2.0, 9, 6, 1.8],
      [14, 25, 2.4, 6, 7, 2],
      [3, 3.5, 2.0, 10, 4, 1.6],
      [-17, 16, 1.8, 5, 8, 1.6],
    ]
    for (const [x, y, t, w, h, d] of bumps) {
      const b = new THREE.BoxGeometry(w, h, d)
      b.translate(x, y, -4.2 + t)
      geos.push(b)
    }
    const rock = new THREE.Mesh(mergeGeometries(geos)!, mR)
    g.add(rock)
    push('cliff', 0, g)
  }

  // ---- 2. 悬臂横梁（插入崖壁） ----
  {
    const g = new THREE.Group()
    const mB = mat(WOOD_D)
    mB.map = woodTex()
    const beamGeos: THREE.BufferGeometry[] = []
    // 三层横梁，每层若干根：2/3 藏进崖壁、1/3 挑出
    const perLevel = [9, 9, 9]
    LEVELS.forEach((y, li) => {
      const n = perLevel[li]
      for (let i = 0; i < n; i++) {
        const x = -14 + (28 / (n - 1)) * i + (li % 2) * 0.8
        const b = new THREE.BoxGeometry(0.42, 0.38, 12)
        b.rotateX(0.08) // 斜插：崖内端高、崖外端低
        b.translate(x, y + 0.4, -3.2)
        beamGeos.push(b)
      }
    })
    const beams = new THREE.Mesh(mergeGeometries(beamGeos)!, mB)
    g.add(beams)
    // 散开时整组横梁向外（+z）平移抽出
    radialParts.push({ mesh: beams, dx: 0, dz: 1, amount: 3.2, baseX: 0, baseY: 0, baseZ: 0, lift: 0 })
    push('beams', 0, g)
  }

  // ---- 3. 平台与栈道 ----
  {
    const g = new THREE.Group()
    const mP = mat(PLANK)
    mP.map = woodTex()
    const deckGeos: THREE.BufferGeometry[] = []
    const widths = [26, 20, 13]
    LEVELS.forEach((y, li) => {
      const w = widths[li]
      const deck = new THREE.BoxGeometry(w, 0.32, 4.4)
      deck.translate(li === 2 ? 4 : 0, y + 0.35, 0.9)
      deckGeos.push(deck)
    })
    // 连接栈道（斜向）
    const stair = new THREE.BoxGeometry(1.6, 0.25, 12)
    stair.rotateX(0.42)
    stair.translate(-9, 10, 1.0)
    deckGeos.push(stair)
    const stair2 = new THREE.BoxGeometry(1.6, 0.25, 11)
    stair2.rotateX(0.45)
    stair2.translate(6, 15.6, 1.0)
    deckGeos.push(stair2)
    const decks = new THREE.Mesh(mergeGeometries(deckGeos)!, mP)
    g.add(decks)
    // 栈道栏杆
    const railGeos: THREE.BufferGeometry[] = []
    LEVELS.forEach((y, li) => {
      const w = widths[li]
      const r = new THREE.BoxGeometry(w, 0.12, 0.12)
      r.translate(li === 2 ? 4 : 0, y + 1.35, 3.0)
      railGeos.push(r)
      for (let i = 0; i <= Math.floor(w / 2); i++) {
        const x = (li === 2 ? 4 : 0) - w / 2 + i * 2
        const p = new THREE.BoxGeometry(0.1, 1.1, 0.1)
        p.translate(x, y + 0.9, 3.0)
        railGeos.push(p)
      }
    })
    g.add(new THREE.Mesh(mergeGeometries(railGeos)!, mP))
    // 垂吊立木（视觉支撑，多不受力）
    const postGeos: THREE.BufferGeometry[] = []
    LEVELS.forEach((y) => {
      for (const x of [-11, -5, 1, 7, 12]) {
        const p = new THREE.CylinderGeometry(0.11, 0.11, 2.1, 6) // 短柱垂吊，下端悬空
        p.translate(x, y - 1.25, 2.6)
        postGeos.push(p)
      }
    })
    g.add(new THREE.Mesh(mergeGeometries(postGeos)!, mat(WOOD)))
    push('decks', 0, g)
  }

  // ---- 4. 凌空殿阁（柱架墙体） ----
  const hallSpots: { x: number; z: number; y: number; w: number; ry: number }[] = [
    { x: -9, z: 0.6, y: LEVELS[0] + 0.5, w: 6, ry: 0 },
    { x: 3, z: 0.6, y: LEVELS[0] + 0.5, w: 7, ry: 0 },
    { x: 10, z: 0.3, y: LEVELS[0] + 0.5, w: 4.5, ry: 0 },
    { x: -5, z: 0.6, y: LEVELS[1] + 0.5, w: 6, ry: 0 },
    { x: 7, z: 0.6, y: LEVELS[1] + 0.5, w: 6.5, ry: 0 },
    { x: 4, z: 0.6, y: LEVELS[2] + 0.5, w: 6, ry: 0 },
  ]
  {
    const g = new THREE.Group()
    const mWood = mat(WOOD)
    const mWall = mat(0xd9cbb0, 0.9)
    mWall.side = THREE.DoubleSide
    for (const s of hallSpots) {
      const hall = new THREE.Group()
      const ch = 2.6
      const cw = s.w / 2
      for (const [dx, dz] of [
        [-cw, 1.2],
        [cw, 1.2],
        [-cw, -1.2],
        [cw, -1.2],
        [-cw * 0.33, 1.2],
        [cw * 0.33, 1.2],
      ] as const) {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, ch, 6), mWood)
        c.position.set(dx, ch / 2, dz)
        hall.add(c)
      }
      // 墙
      const back = new THREE.Mesh(new THREE.PlaneGeometry(s.w, ch * 0.8), mWall)
      back.position.set(0, ch * 0.45, -1.2)
      hall.add(back)
      // 门窗（暗色门洞）
      const door = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.7), mat(0x241c14, 1))
      door.position.set(0, 0.95, 1.22)
      hall.add(door)
      hall.position.set(s.x, s.y, s.z)
      hall.rotation.y = s.ry
      hall.traverse((o) => {
        o.userData.layerId = 'halls'
      })
      g.add(hall)
      radialParts.push({ mesh: hall, dx: s.x * 0.06, dz: 1, amount: 2.2, baseX: s.x, baseY: s.y, baseZ: s.z, lift: 0.4 })
    }
    push('halls', 0, g)
  }

  // ---- 5. 殿阁屋面 ----
  {
    const g = new THREE.Group()
    const mRoof = mat(ROOF, 0.9, { side: THREE.DoubleSide })
    for (const s of hallSpots) {
      const cw = s.w / 2 + 0.9
      const cd = 1.6 + 0.9
      // 小悬山顶：前后两坡 + 正脊
      const roof = new THREE.Group()
      const mk = (flip: 1 | -1) => {
        const NR = 3
        const pos: number[] = []
        const idx: number[] = []
        for (let r = 0; r <= NR; r++) {
          const t = r / NR
          const y = 1.5 - t * 1.5
          const z = flip * t * cd
          pos.push(-cw, y + (t > 0.7 ? 0.25 : 0), z, cw, y + (t > 0.7 ? 0.25 : 0), z)
        }
        for (let r = 0; r < NR; r++) {
          const i0 = r * 2
          idx.push(i0, i0 + 2, i0 + 1, i0 + 1, i0 + 2, i0 + 3)
        }
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2))
        geo.setIndex(idx)
        geo.computeVertexNormals()
        return new THREE.Mesh(geo, mRoof)
      }
      roof.add(mk(1), mk(-1))
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(cw * 2, 0.2, 0.24), mat(0x2f3841))
      ridge.position.y = 1.55
      roof.add(ridge)
      roof.position.set(s.x, s.y + 2.6, s.z)
      roof.traverse((o) => {
        o.userData.layerId = 'roofs'
      })
      g.add(roof)
      radialParts.push({ mesh: roof, dx: s.x * 0.06, dz: 1, amount: 3.0, baseX: s.x, baseY: s.y + 2.6, baseZ: s.z, lift: 0.9 })
    }
    // 「壮观」碑（崖下）
    const stele = plaqueMesh('壮观', 1.6, 0.7)
    stele.position.set(-12, 1.2, 6.5)
    stele.rotation.x = -0.1
    g.add(stele)
    push('roofs', 0, g)
  }

  return { group, layers, wallMats: [], fadeMats: [], radialParts, labelMats, totalHeight: cursor }
}
