// 环境：佛宫寺院落、山门、松柏、远山（黄昏）
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { slabTex, contactTex } from './textures'

function m(color: number, roughness = 0.95) {
  return new THREE.MeshStandardMaterial({ color, roughness })
}

export function buildEnvironment(kind: 'courtyard' | 'mountain' = 'courtyard'): THREE.Group {
  return kind === 'mountain' ? buildMountain() : buildCourtyard()
}

function buildMountain(): THREE.Group {
  const g = new THREE.Group()
  // 山谷地貌
  const terrain = new THREE.Mesh(new THREE.CircleGeometry(340, 48), m(0x3a3f2e))
  terrain.rotation.x = -Math.PI / 2
  terrain.position.y = -0.05
  terrain.receiveShadow = true
  g.add(terrain)
  // 谷地溪流滩
  const bed = new THREE.Mesh(new THREE.BoxGeometry(120, 0.1, 26), m(0x4c4a3c))
  bed.position.set(0, 0.02, 26)
  g.add(bed)
  // 近处山岩
  const rockMat = m(0x55483c, 1)
  const rocks: [number, number, number, number][] = [
    [-30, 14, 7, 4],
    [26, 18, 5, 3],
    [-22, 30, 4, 2.4],
  ]
  for (const [x, z, r, h] of rocks) {
    const rk = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), rockMat)
    rk.position.set(x, h / 2 - 0.2, z)
    rk.castShadow = true
    g.add(rk)
  }
  // 山松
  const trunkGeos: THREE.BufferGeometry[] = []
  const crownGeos: THREE.BufferGeometry[] = []
  const spots: [number, number, number][] = [[-36, 8, 5], [34, 6, 4.4], [-30, 26, 3.8], [38, 24, 4.6], [-14, 34, 3.4], [18, 36, 3.8]]
  for (const [x, z, h] of spots) {
    const trunk = new THREE.CylinderGeometry(0.16, 0.24, h * 0.4, 5)
    trunk.translate(x, h * 0.2, z)
    trunkGeos.push(trunk)
    const c1 = new THREE.ConeGeometry(h * 0.42, h * 0.55, 7)
    c1.translate(x, h * 0.62, z)
    const c2 = new THREE.ConeGeometry(h * 0.28, h * 0.42, 7)
    c2.translate(x, h * 0.92, z)
    crownGeos.push(c1, c2)
  }
  const trunks = new THREE.Mesh(mergeGeometries(trunkGeos)!, m(0x4a3524))
  const crowns = new THREE.Mesh(mergeGeometries(crownGeos)!, m(0x2c4632))
  trunks.castShadow = true
  crowns.castShadow = true
  g.add(trunks, crowns)
  // 远山
  const hillMat = m(0x2b3138, 1)
  const hills: [number, number, number, number][] = [
    [-120, -160, 140, 60],
    [60, -200, 170, 75],
    [200, -120, 120, 55],
    [-220, -40, 130, 50],
    [230, 60, 150, 48],
    [-90, 140, 110, 36],
  ]
  const hillGeos = hills.map(([x, z, r, h]) => {
    const hg = new THREE.ConeGeometry(r, h, 24)
    hg.translate(x, h / 2 - 1, z)
    return hg
  })
  g.add(new THREE.Mesh(mergeGeometries(hillGeos)!, hillMat))
  return g
}

function buildCourtyard(): THREE.Group {
  const g = new THREE.Group()

  // 大地（晋北高原黄昏）
  const terrain = new THREE.Mesh(new THREE.CircleGeometry(340, 48), m(0x37402e))
  terrain.rotation.x = -Math.PI / 2
  terrain.position.y = -0.05
  terrain.receiveShadow = true
  g.add(terrain)

  // 寺院石板广场
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(30, 40), (() => { const mm = m(0x5a5344); mm.map = slabTex(); return mm })())
  plaza.rotation.x = -Math.PI / 2
  plaza.receiveShadow = true
  g.add(plaza)

  // 南向甬路
  const path = new THREE.Mesh(new THREE.BoxGeometry(5, 0.12, 20), m(0x605947))
  path.position.set(0, 0.02, 38)
  path.receiveShadow = true
  g.add(path)

  // 院墙（带瓦顶，南面留山门豁口）
  const wallMat = m(0x7d7263)
  const capMat = m(0x3f4a55, 0.9)
  const W = 50 // 半宽
  const wallSegs: THREE.BufferGeometry[] = []
  const capSegs: THREE.BufferGeometry[] = []
  const addWall = (cx: number, cz: number, len: number, ry: number) => {
    const w = new THREE.BoxGeometry(len, 3.2, 0.9)
    w.rotateY(ry)
    w.translate(cx, 1.6, cz)
    wallSegs.push(w)
    const c = new THREE.BoxGeometry(len, 0.55, 1.3)
    c.rotateY(ry)
    c.translate(cx, 3.35, cz)
    capSegs.push(c)
  }
  addWall(0, -W, W * 2, 0) // 北
  addWall(-W, 0, W * 2, Math.PI / 2) // 西
  addWall(W, 0, W * 2, Math.PI / 2) // 东
  addWall(-W / 2 - 4.5, W, W - 9, 0) // 南左
  addWall(W / 2 + 4.5, W, W - 9, 0) // 南右
  const walls = new THREE.Mesh(mergeGeometries(wallSegs)!, wallMat)
  walls.castShadow = true
  walls.receiveShadow = true
  g.add(walls)
  g.add(new THREE.Mesh(mergeGeometries(capSegs)!, capMat))

  // 山门（小屋顶门楼）
  const gateBase = new THREE.Mesh(new THREE.BoxGeometry(9, 4, 3.5), wallMat)
  gateBase.position.set(0, 2, W)
  gateBase.castShadow = true
  const gateRoof = new THREE.Mesh(new THREE.ConeGeometry(6.6, 2.4, 4), capMat)
  gateRoof.rotation.y = Math.PI / 4
  gateRoof.scale.z = 0.55
  gateRoof.position.set(0, 5.2, W)
  gateRoof.castShadow = true
  const gateDoor = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.8), m(0x241c14, 1))
  gateDoor.position.set(0, 1.45, W - 1.78)
  gateDoor.rotation.y = Math.PI
  g.add(gateBase, gateRoof, gateDoor)

  // 松柏（确定性伪随机分布，避开甬路与塔基）
  const trunkGeos: THREE.BufferGeometry[] = []
  const crownGeos: THREE.BufferGeometry[] = []
  let seed = 42
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  let placed = 0
  while (placed < 18) {
    const a = rand() * Math.PI * 2
    const r = 33 + rand() * 15
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    if (Math.abs(x) < 7 && z > 20) continue // 让开甬路
    const h = 3.5 + rand() * 2.5
    const trunk = new THREE.CylinderGeometry(0.16, 0.24, h * 0.4, 5)
    trunk.translate(x, h * 0.2, z)
    trunkGeos.push(trunk)
    const c1 = new THREE.ConeGeometry(h * 0.42, h * 0.55, 7)
    c1.translate(x, h * 0.62, z)
    const c2 = new THREE.ConeGeometry(h * 0.28, h * 0.42, 7)
    c2.translate(x, h * 0.92, z)
    crownGeos.push(c1, c2)
    placed++
  }
  const trunks = new THREE.Mesh(mergeGeometries(trunkGeos)!, m(0x4a3524))
  const crowns = new THREE.Mesh(mergeGeometries(crownGeos)!, m(0x2c4632))
  trunks.castShadow = true
  crowns.castShadow = true
  g.add(trunks, crowns)

  // 远山（起伏地形网格）
  const hillMat = m(0x2b3138, 1)
  const hills: [number, number, number, number][] = [
    [-180, -240, 150, 55],
    [40, -280, 190, 70],
    [230, -200, 130, 48],
    [-260, -60, 120, 42],
    [250, 90, 140, 40],
  ]
  const hillGeos = hills.map(([x, z, r, h]) => {
    const hg = new THREE.PlaneGeometry(r * 2.2, r * 1.6, 22, 16)
    hg.rotateX(-Math.PI / 2)
    const pos = hg.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i) / (r * 1.1)
      const pz = pos.getY(i) / (r * 0.8)
      const fall = Math.max(0, 1 - (px * px + pz * pz))
      const ridge = Math.sin(px * 3.1 + z) * 0.3 + Math.cos(pz * 2.7 + x) * 0.3 + 0.55
      pos.setZ(i, fall * h * ridge)
    }
    hg.computeVertexNormals()
    hg.translate(x, -1, z)
    return hg
  })
  g.add(new THREE.Mesh(mergeGeometries(hillGeos)!, hillMat))

  // 建筑接地阴影
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(58, 58),
    new THREE.MeshBasicMaterial({ map: contactTex(), transparent: true, depthWrite: false }),
  )
  contact.rotation.x = -Math.PI / 2
  contact.position.y = 0.03
  g.add(contact)

  // 散置碑石点缀
  for (const [x, z] of [
    [-22, 18],
    [24, 14],
  ] as const) {
    const stele = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.2, 0.4), m(0x6e6557))
    stele.position.set(x, 1.1, z)
    stele.castShadow = true
    g.add(stele)
  }

  return g
}
