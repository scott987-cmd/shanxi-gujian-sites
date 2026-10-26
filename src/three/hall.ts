// 殿堂/楼阁类古建三维建模器（面阔×进深柱网 + 大屋顶；庑殿/歇山/悬山；重檐与多楼阁层）
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { PagodaModel, BuiltLayer, RadialPart } from './pagoda'
import type { HallParams } from '@/sites/types'
import { plaqueMesh, buddhaGeo } from './pagoda'
import { tileTex, woodTex, plasterTex, latticeTex, latticeVariantTex } from './textures'

const COL = {
  wood: 0x8a5a35,
  woodDark: 0x66422a,
  bracket: 0x77604a,
  wall: 0xd9cbb0,
  roof: 0x3f4a55,
  roofRidge: 0x2f3841,
  stone: 0x8f8574,
  stoneDark: 0x6e6557,
  buddha: 0xc2a05a,
  ridgeOrn: 0x4a6a5a,
}

function mat(color: number, roughness = 0.8, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.05, ...opts })
}

const clusterCache = new Map<string, THREE.BufferGeometry>()
function clusterGeo(s: number): THREE.BufferGeometry {
  const key = s.toFixed(2)
  const hit = clusterCache.get(key)
  if (hit) return hit
  const boxes: THREE.BufferGeometry[] = []
  const add = (w: number, h: number, d: number, x: number, y: number, z: number) => {
    const b = new THREE.BoxGeometry(w, h, d)
    b.translate(x, y, z)
    boxes.push(b)
  }
  add(0.62 * s, 0.42 * s, 0.62 * s, 0, 0.21 * s, 0)
  add(0.26 * s, 0.24 * s, 1.7 * s, 0, 0.55 * s, 0)
  {
    const arm = curvedArm(1.45 * s, 0.22 * s, 0.26 * s, false)
    arm.translate(0, 0.56 * s - 0.11 * s, 0)
    boxes.push(arm)
  }
  add(0.34 * s, 0.3 * s, 0.34 * s, 0, 0.82 * s, 0.72 * s)
  for (const sg of [-1, 1]) {
    add(0.3 * s, 0.26 * s, 0.3 * s, sg * 0.62 * s, 0.8 * s, 0)
    add(0.3 * s, 0.26 * s, 0.3 * s, sg * 1.05 * s, 1.26 * s, 0.72 * s)
  }
  add(0.26 * s, 0.24 * s, 2.5 * s, 0, 1.02 * s, 0.36 * s)
  {
    const arm = curvedArm(2.15 * s, 0.24 * s, 0.28 * s, false)
    arm.translate(0, 1.5 * s - 0.12 * s, 0.72 * s)
    boxes.push(arm)
  }
  // 斜昂：杠杆式斜构件
  {
    const ang = new THREE.BoxGeometry(0.3 * s, 0.34 * s, 2.2 * s)
    ang.rotateX(-0.34)
    ang.translate(0, 1.62 * s, 0.5 * s)
    boxes.push(ang)
  }
  add(2.5 * s, 0.3 * s, 0.32 * s, 0, 1.78 * s, 0.72 * s)
  const geo = mergeGeometries(boxes)!
  clusterCache.set(key, geo)
  return geo
}


// 卷杀栱臂：两端上卷的弧形木栱（分 7 段拟合）
function curvedArm(len: number, h: number, thick: number, alongZ: boolean): THREE.BufferGeometry {
  const segs = 7
  const geos: THREE.BufferGeometry[] = []
  for (let i = 0; i < segs; i++) {
    const t0 = i / segs
    const t1 = (i + 1) / segs
    const seg = len / segs
    // 中段平直、两端上翘（卷杀）
    const lift = (t: number) => Math.pow(Math.abs(t - 0.5) * 2, 2.4) * h * 0.9
    const y0 = lift(t0)
    const y1 = lift(t1)
    const g = new THREE.BoxGeometry(alongZ ? thick : seg, h, alongZ ? seg : thick)
    const xm = (t0 + t1) / 2 - 0.5
    g.translate(alongZ ? 0 : xm * len, h / 2 + (y0 + y1) / 2, alongZ ? xm * len : 0)
    geos.push(g)
  }
  return mergeGeometries(geos)!
}

// 屋面网格（带角部起翘）
function roofFace(
  topA: THREE.Vector3,
  topB: THREE.Vector3,
  botA: THREE.Vector3,
  botB: THREE.Vector3,
  upA: number,
  upB: number,
): THREE.BufferGeometry {
  const NR = 8
  const NA = 8
  const faceW = botA.distanceTo(botB)
  const slopeL = Math.max(1, topA.clone().lerp(topB, 0.5).distanceTo(botA.clone().lerp(botB, 0.5)))
  const pos: number[] = []
  const uvArr: number[] = []
  const idx: number[] = []
  for (let r = 0; r <= NR; r++) {
    const t = r / NR
    for (let j = 0; j <= NA; j++) {
      const u = j / NA
      const top = topA.clone().lerp(topB, u)
      const bot = botA.clone().lerp(botB, u)
      const p = top.lerp(bot, t)
      // 举折凹曲线：近脊陡、近檐缓
      p.y = top.y + (bot.y - top.y) * Math.pow(t, 1.35)
      const lift = (upA + (upB - upA) * u) * Math.pow(t, 1.7)
      pos.push(p.x, p.y + lift, p.z)
      uvArr.push(u * (faceW / 2.4), t * (slopeL / 2.4))
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
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

// 檐下椽条（矩形面）
function rafterRow(width: number, y1: number, z1: number, y2: number, z2: number): THREE.BufferGeometry {
  const geos: THREE.BufferGeometry[] = []
  const n = Math.max(8, Math.round(width / 0.75))
  for (let i = 0; i <= n; i++) {
    const x = -width / 2 + (width * i) / n
    const p1 = new THREE.Vector3(x, y1, z1)
    const p2 = new THREE.Vector3(x, y2, z2)
    const dir = new THREE.Vector3().subVectors(p2, p1)
    const g = new THREE.CylinderGeometry(0.055, 0.055, dir.length(), 4)
    const m = new THREE.Mesh(g)
    m.position.copy(p1).addScaledVector(dir, 0.5)
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    m.updateMatrix()
    g.applyMatrix4(m.matrix)
    geos.push(g)
  }
  return mergeGeometries(geos)!
}

function ridgeBeam(p1: THREE.Vector3, p2: THREE.Vector3, r: number): THREE.BufferGeometry {
  const dir = new THREE.Vector3().subVectors(p2, p1)
  const g = new THREE.CylinderGeometry(r, r, dir.length(), 6)
  const m = new THREE.Mesh(g)
  m.position.copy(p1).addScaledVector(dir, 0.5)
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
  m.updateMatrix()
  g.applyMatrix4(m.matrix)
  return g
}

// 重檐/楼阁腰檐：四面下檐环
function skirtFaces(Wl: number, Dl: number, yTop: number, yBot: number, ov: number): THREE.BufferGeometry {
  const lw = Wl / 2 + ov
  const ld = Dl / 2 + ov
  const faces: THREE.BufferGeometry[] = []
  faces.push(roofFace(new THREE.Vector3(-Wl / 2, yTop, 0), new THREE.Vector3(Wl / 2, yTop, 0), new THREE.Vector3(-lw, yBot, ld), new THREE.Vector3(lw, yBot, ld), 0.45, 0.45))
  faces.push(roofFace(new THREE.Vector3(Wl / 2, yTop, 0), new THREE.Vector3(-Wl / 2, yTop, 0), new THREE.Vector3(lw, yBot, -ld), new THREE.Vector3(-lw, yBot, -ld), 0.45, 0.45))
  faces.push(roofFace(new THREE.Vector3(Wl / 2, yTop, 0), new THREE.Vector3(Wl / 2, yTop, 0), new THREE.Vector3(lw, yBot, -ld), new THREE.Vector3(lw, yBot, ld), 0.35, 0.35))
  faces.push(roofFace(new THREE.Vector3(-Wl / 2, yTop, 0), new THREE.Vector3(-Wl / 2, yTop, 0), new THREE.Vector3(-lw, yBot, ld), new THREE.Vector3(-lw, yBot, -ld), 0.35, 0.35))
  return mergeGeometries(faces)!
}

export function buildHall(cfg: HallParams): PagodaModel {
  const group = new THREE.Group()
  const layers: BuiltLayer[] = []
  const wallMats: THREE.MeshStandardMaterial[] = []
  const fadeMats: THREE.MeshStandardMaterial[] = []
  const radialParts: RadialPart[] = []
  const labelMats: THREE.SpriteMaterial[] = []

  const floors = cfg.floors ?? 1
  const W = cfg.bays * cfg.bayW
  const D = cfg.depthBays * cfg.bayD
  const colH = cfg.colH
  const platH = 1.2
  const brkH = 1.9 * cfg.bracketSize
  const beamH = 1.4
  // 顶层体量（楼阁逐层收分）
  const topTaper = Math.pow(0.86, floors - 1)
  const Wr = W * topTaper
  const Dr = D * topTaper
  const roofH = Math.max(Wr, Dr) * 0.32
  const overhang = 2.2 * cfg.bracketSize

  let cursor = 0
  let index = 0
  const staticHeights: Record<string, number> = {
    platform: platH,
    columns: colH,
    brackets: brkH,
    beams: beamH,
    roof: roofH,
    ridge: 1.2,
  }
  const pushH = (id: string, h: number, obj: THREE.Object3D, mats: THREE.MeshStandardMaterial[]) => {
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
    cursor += h
    index++
  }

  const addRadial = (mesh: THREE.Object3D, lift = 0, scale = 0.55) => {
    const x = mesh.position.x
    const z = mesh.position.z
    const d = Math.hypot(x, z)
    if (d < 0.01) return
    radialParts.push({ mesh, dx: x / d, dz: z / d, amount: d * scale + 0.6, baseX: x, baseY: mesh.position.y, baseZ: z, lift })
  }

  // ---- 台基 ----
  {
    const g = new THREE.Group()
    const m1 = mat(COL.stoneDark, 0.95)
    const m2 = mat(COL.stone, 0.95)
    const low = new THREE.Mesh(new THREE.BoxGeometry(W + 8, platH * 0.5, D + 8), m1)
    low.position.y = platH * 0.25
    const up = new THREE.Mesh(new THREE.BoxGeometry(W + 5, platH * 0.55, D + 5), m2)
    up.position.y = platH * 0.5 + platH * 0.275
    g.add(low, up)
    const steps = new THREE.Mesh(new THREE.BoxGeometry(4, platH * 0.5, 2.4), m2)
    steps.position.set(0, platH * 0.25, D / 2 + 3.4)
    g.add(steps)
    // 晋祠：殿前鱼沼与十字飞梁
    if (cfg.water) {
      const pond = new THREE.Mesh(
        new THREE.PlaneGeometry(17, 11),
        new THREE.MeshStandardMaterial({ color: 0x3d5a66, roughness: 0.25, metalness: 0.3 }),
      )
      pond.rotation.x = -Math.PI / 2
      pond.position.set(0, 0.08, D / 2 + 8.5)
      g.add(pond)
      const mBridge = mat(0x9a8f7d, 0.85)
      const deck1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.35, 15), mBridge)
      deck1.position.set(0, 0.85, D / 2 + 7.0)
      const deck2 = new THREE.Mesh(new THREE.BoxGeometry(15, 0.35, 3.0), mBridge)
      deck2.position.set(0, 0.85, D / 2 + 8.0)
      g.add(deck1, deck2)
      const pierGeos: THREE.BufferGeometry[] = []
      for (const [px, pz] of [[-4, 6.5], [4, 6.5], [-4, 10], [4, 10], [0, 8.5]] as const) {
        const pier = new THREE.CylinderGeometry(0.3, 0.34, 1.4, 8)
        pier.translate(px, 0.3, D / 2 + pz)
        pierGeos.push(pier)
      }
      g.add(new THREE.Mesh(mergeGeometries(pierGeos)!, mBridge))
    }
    pushH('platform', platH, g, [m1, m2])
  }

  // ---- 楼层（柱架 + 斗拱 [+ 腰檐]） ----
  for (let f = 1; f <= floors; f++) {
    const taper = Math.pow(0.86, f - 1)
    const Wl = W * taper
    const Dl = D * taper
    const ch = f === 1 ? colH : colH * 0.88
    const isGround = f === 1
    const colsId = floors === 1 ? 'columns' : `f${f}-cols`
    const brkId = floors === 1 ? 'brackets' : `f${f}-brackets`

    // 柱架
    {
      const g = new THREE.Group()
      const mWood = mat(COL.wood)
      mWood.map = woodTex()
      const mWall = mat(COL.wall, 0.9)
      mWall.map = plasterTex()
      const mBeam = mat(COL.woodDark)
      mBeam.map = woodTex()
      const colGeo = new THREE.CylinderGeometry(0.27, 0.33, ch, 8) // 柱头卷杀
      const baseGeo = new THREE.CylinderGeometry(0.48, 0.55, 0.36, 8)
      const mBase = mat(COL.stone, 0.9)
      const perim: [number, number][] = []
      for (let i = 0; i <= cfg.bays; i++) {
        const x = -Wl / 2 + i * (Wl / cfg.bays)
        perim.push([x, Dl / 2], [x, -Dl / 2])
      }
      for (let j = 1; j < cfg.depthBays; j++) {
        const z = -Dl / 2 + j * (Dl / cfg.depthBays)
        perim.push([-Wl / 2, z], [Wl / 2, z])
      }
      const baseGeos: THREE.BufferGeometry[] = []
      perim.forEach(([x, z]) => {
        const c = new THREE.Mesh(colGeo, mWood)
        c.position.set(x, ch / 2, z)
        g.add(c)
        addRadial(c, 0.3)
        const bs = baseGeo.clone()
        bs.translate(x, 0.18, z)
        baseGeos.push(bs)
      })
      g.add(new THREE.Mesh(mergeGeometries(baseGeos)!, mBase))
      if (isGround) {
        // 内槽金柱
        const innerGeo = new THREE.CylinderGeometry(0.36, 0.39, ch + beamH * 0.5, 8)
        for (let r = 0; r < cfg.innerColRows; r++) {
          const z = -Dl / 2 + ((r + 1) / (cfg.innerColRows + 1)) * Dl
          for (let i = 1; i < cfg.bays; i += 2) {
            const x = -Wl / 2 + i * (Wl / cfg.bays)
            const c = new THREE.Mesh(innerGeo, mat(COL.woodDark))
            c.position.set(x, (ch + beamH * 0.5) / 2, z)
            g.add(c)
            addRadial(c, 0.5, 0.4)
          }
        }
      }
      // 阑额
      for (const z of [Dl / 2, -Dl / 2]) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(Wl + 0.6, 0.42, 0.4), mBeam)
        beam.position.set(0, ch - 0.2, z)
        g.add(beam)
      }
      for (const x of [-Wl / 2, Wl / 2]) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, Dl + 0.6), mBeam)
        beam.position.set(x, ch - 0.2, 0)
        g.add(beam)
      }
      // 墙体与门（楼阁上层只留栏杆无墙）
      mWall.side = THREE.DoubleSide
      if (isGround) {
        const mkWall = (w: number, h: number, x: number, z: number, ry: number) => {
          const wl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mWall)
          wl.position.set(x, h / 2 + 0.4, z)
          wl.rotation.y = ry
          g.add(wl)
        }
        mkWall(Wl, ch * 0.82, 0, -Dl / 2, 0)
        mkWall(Dl, ch * 0.82, -Wl / 2, 0, Math.PI / 2)
        mkWall(Dl, ch * 0.82, Wl / 2, 0, Math.PI / 2)
        const sideW = (Wl - 4.4) / 2
        mkWall(sideW, ch * 0.82, -(Wl / 4 + 1.1), Dl / 2, 0)
        mkWall(sideW, ch * 0.82, Wl / 4 + 1.1, Dl / 2, 0)
        const mDoor = new THREE.MeshStandardMaterial({ map: latticeTex(2, 2), roughness: 0.85 })
        mDoor.transparent = true
        fadeMats.push(mDoor)
        const door = new THREE.Mesh(new THREE.PlaneGeometry(4.4, ch * 0.6), mDoor)
        door.position.set(0, ch * 0.3 + 0.4, Dl / 2 + 0.01)
        g.add(door)
        // 晋祠：前檐蟠龙柱（宋元祐木雕盘龙）
      if (cfg.dragonColumns) {
        const dragonMat = mat(0xc9a227, 0.55, { metalness: 0.2 })
        for (const dx of [-Wl / 2 + (Wl / cfg.bays) * 1.0, Wl / 2 - (Wl / cfg.bays) * 1.0]) {
          const geos: THREE.BufferGeometry[] = []
          for (let k = 0; k < 13; k++) {
            const a = k * 0.72
            const seg = new THREE.CapsuleGeometry(0.15, 0.28, 3, 6)
            seg.rotateZ(Math.PI / 2)
            seg.rotateY(a)
            seg.translate(Math.cos(a) * 0.5, 0.9 + k * 0.32, Math.sin(a) * 0.5)
            geos.push(seg)
          }
          const head = new THREE.ConeGeometry(0.22, 0.55, 6)
          head.rotateZ(-0.9)
          head.translate(0.55, 5.1, 0)
          geos.push(head)
          const dragon = new THREE.Mesh(mergeGeometries(geos)!, dragonMat)
          dragon.position.set(dx, 0, Dl / 2)
          g.add(dragon)
          addRadial(dragon, 0.3)
        }
      }
      // 前檐格扇窗带（次间与梢间）
        for (let bi = 0; bi < cfg.bays; bi++) {
          if (bi === Math.floor(cfg.bays / 2)) continue // 明间留门
          const bx = -Wl / 2 + (bi + 0.5) * (Wl / cfg.bays)
          const winMat = new THREE.MeshStandardMaterial({ map: cfg.richLattice ? latticeVariantTex(bi % 5, 1.2, 1.3) : latticeTex(1.2, 1.3), roughness: 0.85, transparent: true })
          fadeMats.push(winMat)
          const win = new THREE.Mesh(new THREE.PlaneGeometry((Wl / cfg.bays) * 0.72, ch * 0.55), winMat)
          win.position.set(bx, 0.4 + ch * 0.4, Dl / 2 + 0.02)
          g.add(win)
        }
        // 造像与佛光
        const mBuddha = mat(cfg.statueColor ?? COL.buddha, 0.55)
        for (const s of cfg.statues) {
          const b = new THREE.Mesh(buddhaGeo(), mBuddha)
          b.position.set(s.x, 0, s.z)
          b.scale.setScalar(s.s)
          b.rotation.y = s.ry ?? 0
          b.castShadow = true
          g.add(b)
        }
        const glow = new THREE.PointLight(0xffc078, 24, Math.max(W, D) * 1.1, 1.8)
        glow.position.set(0, ch * 0.6, 0)
        g.add(glow)
        cfg.plaqueTexts.forEach((t, i) => {
          const pq = plaqueMesh(t, Math.min(4.2, t.length * 1.05 + 1), 1.1)
          pq.position.set(i === 0 ? 0 : (i - 0.5) * 6, ch * 0.72, Dl / 2 + 0.4)
          g.add(pq)
          addRadial(pq, 0.2)
        })
      } else {
        // 上层：栏杆一周
        const mRail = mat(COL.wood, 0.85)
        const railGeos: THREE.BufferGeometry[] = []
        for (const [x, z] of perim) {
          const p = new THREE.BoxGeometry(0.12, 0.9, 0.12)
          p.translate(x, 0.45, z)
          railGeos.push(p)
        }
        for (const z of [Dl / 2 + 0.4, -Dl / 2 - 0.4]) {
          const b = new THREE.BoxGeometry(Wl + 1.2, 0.12, 0.14)
          b.translate(0, 0.95, z)
          railGeos.push(b)
        }
        for (const x of [-Wl / 2 - 0.4, Wl / 2 + 0.4]) {
          const b = new THREE.BoxGeometry(0.14, 0.12, Dl + 1.2)
          b.translate(x, 0.95, 0)
          railGeos.push(b)
        }
        g.add(new THREE.Mesh(mergeGeometries(railGeos)!, mRail))
      }
      wallMats.push(mWall)
      fadeMats.push(mWall)
      pushH(colsId, ch, g, [mWood, mWall, mBeam])
    }

    // 斗拱
    {
      const g = new THREE.Group()
      const mBr = mat(COL.bracket, 0.85)
      const mBeam = mat(COL.woodDark)
      const geo = clusterGeo(cfg.bracketSize)
      const spots: { x: number; z: number; ry: number }[] = []
      for (let i = 0; i <= cfg.bays; i++) {
        const x = -Wl / 2 + i * (Wl / cfg.bays)
        spots.push({ x, z: Dl / 2 + 0.2, ry: 0 })
        spots.push({ x, z: -Dl / 2 - 0.2, ry: Math.PI })
        if (i < cfg.bays && isGround) {
          for (const t of [0.33, 0.67]) {
            spots.push({ x: -Wl / 2 + (i + t) * (Wl / cfg.bays), z: Dl / 2 + 0.2, ry: 0 })
            spots.push({ x: -Wl / 2 + (i + t) * (Wl / cfg.bays), z: -Dl / 2 - 0.2, ry: Math.PI })
          }
        }
      }
      for (let j = 0; j <= cfg.depthBays; j++) {
        const z = -Dl / 2 + j * (Dl / cfg.depthBays)
        spots.push({ x: -Wl / 2 - 0.2, z, ry: -Math.PI / 2 })
        spots.push({ x: Wl / 2 + 0.2, z, ry: Math.PI / 2 })
      }
      for (const s of spots) {
        const m = new THREE.Mesh(geo, mBr)
        m.position.set(s.x, 0, s.z)
        m.rotation.y = s.ry
        g.add(m)
        addRadial(m, 0.9)
      }
      const ring = [
        new THREE.BoxGeometry(Wl + 1, 0.26, 0.42),
        new THREE.BoxGeometry(Wl + 1, 0.26, 0.42),
        new THREE.BoxGeometry(0.42, 0.26, Dl + 1),
        new THREE.BoxGeometry(0.42, 0.26, Dl + 1),
      ]
      ring[0].translate(0, 0.1, Dl / 2)
      ring[1].translate(0, 0.1, -Dl / 2)
      ring[2].translate(-Wl / 2, 0.1, 0)
      ring[3].translate(Wl / 2, 0.1, 0)
      g.add(new THREE.Mesh(mergeGeometries(ring)!, mBeam))
      pushH(brkId, brkH, g, [mBr, mBeam])
    }

    // 楼阁腰檐（非顶层的四滴水檐）
    if (f < floors) {
      const g = new THREE.Group()
      const mRoof = mat(COL.roof, 0.92, { side: THREE.DoubleSide })
      const skirt = new THREE.Mesh(skirtFaces(Wl, Dl, 0.9, 0, overhang * 0.85), mRoof)
      g.add(skirt)
      pushH(`f${f}-eave`, 1.6, g, [mRoof])
    }
  }

  // ---- 梁架层（单层殿） ----
  if (floors === 1) {
    const g = new THREE.Group()
    const mBeam = mat(COL.woodDark)
    const beams: THREE.BufferGeometry[] = []
    for (let i = 0; i <= cfg.bays; i++) {
      const x = -W / 2 + i * cfg.bayW
      const b = new THREE.BoxGeometry(0.36, beamH * 0.5, D - 1)
      b.translate(x, beamH * 0.3, 0)
      beams.push(b)
    }
    for (let j = 0; j <= cfg.depthBays; j++) {
      const z = -D / 2 + j * cfg.bayD
      const b = new THREE.BoxGeometry(W - 1, beamH * 0.4, 0.36)
      b.translate(0, beamH * 0.72, z)
      beams.push(b)
    }
    g.add(new THREE.Mesh(mergeGeometries(beams)!, mBeam))
    pushH('beams', beamH, g, [mBeam])
  }

  // ---- 大屋顶 ----
  const eaveW = Wr / 2 + overhang
  const eaveD = Dr / 2 + overhang
  const ridgeLen = cfg.roof === 'xuanshan' ? Wr / 2 + overhang * 0.6 : Math.max(2, Wr / 2 - eaveD * 0.9)
  const upturn = 0.7
  {
    const g = new THREE.Group()
    const mRoof = mat(0xececec, 0.92, { side: THREE.DoubleSide })
    mRoof.map = tileTex()
    mRoof.bumpMap = tileTex()
    mRoof.bumpScale = 0.4
    const y0 = roofH
    const faces: { geo: THREE.BufferGeometry; nx: number; nz: number }[] = []
    const mk = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, nx: number, nz: number) => {
      faces.push({ geo: roofFace(a, b, c, d, upturn, upturn), nx, nz })
    }
    mk(new THREE.Vector3(-ridgeLen / 2, y0, 0), new THREE.Vector3(ridgeLen / 2, y0, 0), new THREE.Vector3(-eaveW, 0, eaveD), new THREE.Vector3(eaveW, 0, eaveD), 0, 1)
    mk(new THREE.Vector3(ridgeLen / 2, y0, 0), new THREE.Vector3(-ridgeLen / 2, y0, 0), new THREE.Vector3(eaveW, 0, -eaveD), new THREE.Vector3(-eaveW, 0, -eaveD), 0, -1)
    if (cfg.roof !== 'xuanshan') {
      mk(new THREE.Vector3(ridgeLen / 2, y0, 0), new THREE.Vector3(ridgeLen / 2, y0, 0), new THREE.Vector3(eaveW, 0, -eaveD), new THREE.Vector3(eaveW, 0, eaveD), 1, 0)
      mk(new THREE.Vector3(-ridgeLen / 2, y0, 0), new THREE.Vector3(-ridgeLen / 2, y0, 0), new THREE.Vector3(-eaveW, 0, eaveD), new THREE.Vector3(-eaveW, 0, -eaveD), -1, 0)
    } else {
      for (const sx of [-1, 1]) {
        const tri = new THREE.BufferGeometry()
        const px = sx * (Wr / 2 + overhang * 0.3)
        const pos = new Float32Array([px, 0, eaveD, px, 0, -eaveD, px, y0, 0])
        tri.setAttribute('position', new THREE.BufferAttribute(pos, 3))
        tri.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(6), 2))
        tri.setIndex([0, 1, 2])
        tri.computeVertexNormals()
        faces.push({ geo: tri, nx: sx, nz: 0 })
      }
    }
    for (const f of faces) {
      const mesh = new THREE.Mesh(f.geo, mRoof)
      g.add(mesh)
      radialParts.push({ mesh, dx: f.nx, dz: f.nz, amount: 2.6, baseX: 0, baseY: 0, baseZ: 0, lift: 0.8 })
    }
    // 檐口连檐与瓦当
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(eaveW * 2, 0.22, 0.18), mat(COL.woodDark))
    fascia.position.set(0, 0.05, eaveD)
    g.add(fascia)
    const fasciaB = fascia.clone()
    fasciaB.position.z = -eaveD
    g.add(fasciaB)
    const wadangGeos: THREE.BufferGeometry[] = []
    for (let x = -eaveW + 0.4; x <= eaveW - 0.4; x += 0.45) {
      for (const z of [eaveD, -eaveD]) {
        const d = new THREE.CylinderGeometry(0.1, 0.1, 0.06, 8)
        d.rotateX(Math.PI / 2)
        d.translate(x, 0.05, z)
        wadangGeos.push(d)
      }
    }
    g.add(new THREE.Mesh(mergeGeometries(wadangGeos)!, mat(COL.roofRidge, 0.85)))
    // 前后檐椽条
    const mRafter = mat(COL.woodDark, 0.9, { transparent: true })
    fadeMats.push(mRafter)
    const rafterGeos: THREE.BufferGeometry[] = []
    rafterGeos.push(rafterRow(Wr, 0.3, eaveD - 1.7, 0.0, eaveD + 0.2))
    rafterGeos.push(rafterRow(Wr, 0.3, -eaveD + 1.7, 0.0, -eaveD - 0.2))
    if (cfg.roof !== 'xuanshan') {
      const side1 = rafterRow(Dr, 0.3, eaveW - 1.7, 0.0, eaveW + 0.2)
      side1.rotateY(Math.PI / 2)
      const side2 = rafterRow(Dr, 0.3, eaveW - 1.7, 0.0, eaveW + 0.2)
      side2.rotateY(-Math.PI / 2)
      rafterGeos.push(side1, side2)
    }
    g.add(new THREE.Mesh(mergeGeometries(rafterGeos)!, mRafter))
    // 歇山：山花板与悬鱼
    if (cfg.roof === 'xieshan') {
      const mGable = mat(0xd9cbb0, 0.9, { side: THREE.DoubleSide })
      mGable.map = plasterTex()
      const gx = ridgeLen / 2 + 0.2
      for (const sx of [-1, 1]) {
        const gable = new THREE.BufferGeometry()
        const gy = roofH * 0.98
        const by = roofH * 0.42
        const bz = eaveD * 0.5
        const pos = new Float32Array([sx * gx, gy, 0, sx * gx, by, bz, sx * gx, by, -bz])
        gable.setAttribute('position', new THREE.BufferAttribute(pos, 3))
        gable.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0.5, 1, 0, 0, 1, 0]), 2))
        gable.setIndex([0, 1, 2])
        gable.computeVertexNormals()
        g.add(new THREE.Mesh(gable, mGable))
        // 悬鱼（木鱼形垂饰）
        const fish = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.1, 4), mat(COL.woodDark))
        fish.rotation.x = Math.PI
        fish.position.set(sx * (gx + 0.12), by + 0.55, 0)
        g.add(fish)
      }
    }
    // 重檐下檐环（单层殿用）
    if (cfg.doubleEave && floors === 1) {
      const mRoof2 = mRoof
      const lower = new THREE.Mesh(skirtFaces(W, D, -beamH - brkH * 0.4 + 1.4, -beamH - brkH * 0.4, overhang * 0.7), mRoof2)
      g.add(lower)
    }
    pushH('roof', roofH, g, [mRoof])
  }

  // ---- 脊饰 ----
  {
    const g = new THREE.Group()
    const mRidge = mat(COL.roofRidge, 0.85)
    const mOrn = mat(COL.ridgeOrn, 0.7)
    const ridges: THREE.BufferGeometry[] = []
    ridges.push(ridgeBeam(new THREE.Vector3(-ridgeLen / 2, 0.35, 0), new THREE.Vector3(ridgeLen / 2, 0.35, 0), 0.35))
    if (cfg.roof !== 'xuanshan') {
      for (const [sx, sz] of [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ] as const) {
        ridges.push(
          ridgeBeam(new THREE.Vector3((sx * ridgeLen) / 2, 0.1, 0), new THREE.Vector3(sx * eaveW * 0.98, -roofH + upturn * 1.2, sz * eaveD * 0.98), 0.18),
        )
      }
    }
    // 垂脊走兽队列
    if (cfg.roof !== 'xuanshan') {
      for (const [sx, sz] of [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ] as const) {
        const p1 = new THREE.Vector3((sx * ridgeLen) / 2, 0.1, 0)
        const p2 = new THREE.Vector3(sx * eaveW * 0.98, -roofH + upturn * 1.2, sz * eaveD * 0.98)
        for (let i = 1; i <= 5; i++) {
          const p = p1.clone().lerp(p2, 0.45 + i * 0.1)
          const beast = new THREE.ConeGeometry(0.14, 0.34, 5)
          beast.translate(p.x, p.y + 0.28, p.z)
          ridges.push(beast)
        }
      }
    }
    // 正脊合脊瓦带
    const capMat = mat(0xececec, 0.85)
    capMat.map = tileTex()
    const cap = new THREE.Mesh(new THREE.BoxGeometry(ridgeLen + 0.3, 0.3, 0.55), capMat)
    cap.position.y = 0.52
    g.add(cap)
    g.add(new THREE.Mesh(mergeGeometries(ridges)!, mRidge))
    for (const sx of [-1, 1]) {
      const orn = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.6, 6), mOrn)
      orn.position.set((sx * ridgeLen) / 2, 1.1, 0)
      orn.scale.z = 0.5
      g.add(orn)
    }
    pushH('ridge', 1.2, g, [mRidge, mOrn])
  }

  void staticHeights
  return { group, layers, wallMats, fadeMats, radialParts, labelMats, totalHeight: cursor }
}
