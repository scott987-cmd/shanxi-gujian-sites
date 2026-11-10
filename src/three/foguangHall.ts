// 佛光寺东大殿专用结构复原：七开间、四进深、单檐庑殿顶。
// 尺寸依据公开测绘资料；用于科普交互，不替代文物测绘模型。
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { buddhaGeo, plaqueMesh, type BuiltLayer, type PagodaModel, type RadialPart } from './pagoda'
import type { HallParams } from '@/sites/types'

const W = 34.02
const D = 17.66
const PLATFORM = 0.9
const COLUMN = 5.2
const BRACKET = 2.65
const BEAM = 0.9
const ROOF = 4.81
const OVERHANG = 3.96
const RIDGE_LENGTH = W - D
const EAVE_W = W / 2 + OVERHANG
const EAVE_D = D / 2 + OVERHANG

function randomSource(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

function surfaceTexture(kind: 'wood' | 'red' | 'stone' | 'tile') {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1024
  const ctx = canvas.getContext('2d')!
  const rand = randomSource({ wood: 37, red: 857, stone: 1937, tile: 61 }[kind])
  const colors = { wood: '#793c26', red: '#934b34', stone: '#a69b83', tile: '#777b74' }
  ctx.fillStyle = colors[kind]
  ctx.fillRect(0, 0, 1024, 1024)
  if (kind === 'wood' || kind === 'red') {
    for (let i = 0; i < 700; i++) {
      const x = rand() * 1024
      ctx.strokeStyle = rand() > 0.45 ? `rgba(44,22,13,${0.03 + rand() * 0.14})` : `rgba(219,173,125,${0.02 + rand() * 0.11})`
      ctx.lineWidth = 0.4 + rand() * 3
      ctx.beginPath()
      ctx.moveTo(x, -10)
      ctx.bezierCurveTo(x + rand() * 15, 300, x - rand() * 14, 690, x + rand() * 7, 1034)
      ctx.stroke()
    }
    for (let i = 0; i < 150; i++) {
      const x = rand() * 1024
      const y = rand() * 1024
      ctx.fillStyle = `rgba(204,180,143,${rand() * 0.16})`
      ctx.fillRect(x, y, 1 + rand() * 4, 5 + rand() * 42)
    }
  } else if (kind === 'stone') {
    const rowH = 128
    for (let row = 0; row < 8; row++) {
      const offset = row % 2 ? -128 : 0
      for (let col = 0; col < 5; col++) {
        const x = offset + col * 256
        const y = row * rowH
        const light = Math.floor(135 + rand() * 35)
        ctx.fillStyle = `rgb(${light + 15},${light + 7},${light - 8})`
        ctx.fillRect(x + 3, y + 3, 250, rowH - 6)
        ctx.strokeStyle = 'rgba(55,48,39,.38)'
        ctx.lineWidth = 3
        ctx.strokeRect(x + 2, y + 2, 252, rowH - 4)
      }
    }
  }
  for (let i = 0; i < 26000; i++) {
    const bright = rand() > 0.52
    ctx.fillStyle = bright ? `rgba(238,226,196,${rand() * 0.07})` : `rgba(25,23,19,${rand() * 0.1})`
    const size = 0.5 + rand() * (kind === 'stone' ? 6 : 2)
    ctx.fillRect(rand() * 1024, rand() * 1024, size, size)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function standard(color: number, map?: THREE.Texture, roughness = 0.88) {
  return new THREE.MeshStandardMaterial({ color, map, roughness, metalness: 0.01 })
}

function box(w: number, h: number, d: number, x = 0, y = 0, z = 0) {
  const geometry = new THREE.BoxGeometry(w, h, d)
  geometry.translate(x, y, z)
  return geometry
}

function beamBetween(a: THREE.Vector3, b: THREE.Vector3, width: number, depth = width) {
  const direction = b.clone().sub(a)
  const geometry = new THREE.BoxGeometry(width, direction.length(), depth)
  const matrix = new THREE.Matrix4().compose(
    a.clone().add(b).multiplyScalar(0.5),
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()),
    new THREE.Vector3(1, 1, 1),
  )
  return geometry.applyMatrix4(matrix)
}

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0) {
  const result = new THREE.Mesh(geometry, material)
  result.position.set(x, y, z)
  return result
}

function tangBracketGeometry() {
  const parts: THREE.BufferGeometry[] = []
  parts.push(box(0.72, 0.4, 0.72, 0, 0.2, 0))
  parts.push(box(0.48, 0.15, 0.48, 0, 0.46, 0))
  // 双杪双下昂，四跳向外逐层承接，而非装饰性的方盒子堆叠。
  for (let jump = 0; jump < 4; jump++) {
    const y = 0.52 + jump * 0.47
    const reach = 0.44 + jump * 0.47
    parts.push(box(0.21, 0.24, 1.1 + jump * 0.82, 0, y, reach * 0.55))
    parts.push(box(1.25 + jump * 0.32, 0.22, 0.24, 0, y + 0.23, reach))
    parts.push(box(0.31, 0.25, 0.31, 0, y + 0.22, reach))
    for (const sign of [-1, 1]) {
      parts.push(box(0.28, 0.23, 0.28, sign * (0.48 + jump * 0.15), y + 0.34, reach))
    }
  }
  for (let layer = 0; layer < 2; layer++) {
    parts.push(beamBetween(
      new THREE.Vector3(0, 0.65 + layer * 0.72, -0.25),
      new THREE.Vector3(0, 1.85 + layer * 0.47, 1.65 + layer * 0.55),
      0.24,
      0.28,
    ))
  }
  parts.push(box(2.35, 0.25, 0.29, 0, 2.31, 1.9))
  parts.push(box(0.27, 0.3, 2.55, 0, 2.28, 0.75))
  return mergeGeometries(parts)!
}

type RoofCorner = readonly [number, number, number]
type RoofFace = { topA: RoofCorner; topB: RoofCorner; botA: RoofCorner; botB: RoofCorner; dx: number; dz: number }

function roofPoint(face: RoofFace, u: number, t: number) {
  const lerp = (a: RoofCorner, b: RoofCorner, k: number) => new THREE.Vector3(...a).lerp(new THREE.Vector3(...b), k)
  const top = lerp(face.topA, face.topB, u)
  const bottom = lerp(face.botA, face.botB, u)
  const point = top.clone().lerp(bottom, t)
  const lift = 0.16 * Math.pow(t, 3) + 0.5 * Math.pow(Math.abs(u * 2 - 1), 8) * Math.pow(t, 4)
  point.y = top.y + (bottom.y - top.y) * Math.pow(t, 1.28) + lift
  return point
}

function roofGeometry(face: RoofFace) {
  const positions: number[] = []
  const uv: number[] = []
  const indices: number[] = []
  const rows = 24
  const columns = 40
  for (let row = 0; row <= rows; row++) {
    for (let column = 0; column <= columns; column++) {
      const point = roofPoint(face, column / columns, row / rows)
      positions.push(point.x, point.y, point.z)
      uv.push(column / columns * 10, row / rows * 4)
    }
  }
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const a = row * (columns + 1) + column
      const b = a + columns + 1
      indices.push(a, b, a + 1, a + 1, b, b + 1)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function tiledRoofGeometry(face: RoofFace, seed: number) {
  const positions: number[] = []
  const colors: number[] = []
  const indices: number[] = []
  const rand = randomSource(seed)
  const width = new THREE.Vector3(...face.botA).distanceTo(new THREE.Vector3(...face.botB))
  const columns = Math.max(30, Math.round(width / 0.29))
  const rows = Math.max(22, Math.round(Math.hypot(EAVE_D, ROOF) / 0.38))
  const arcSegments = 6
  for (let column = 0; column < columns; column++) {
    const u = (column + 0.5) / columns
    for (let row = 0; row < rows; row++) {
      const t0 = row / rows
      const t1 = Math.min(1, (row + 1.14) / rows)
      const centerU = Math.max(0.001, Math.min(0.999, u))
      const cross = roofPoint(face, centerU + 0.001, (t0 + t1) / 2).sub(roofPoint(face, centerU - 0.001, (t0 + t1) / 2)).normalize()
      const localWidth = roofPoint(face, 0.5 + 0.5 / columns, (t0 + t1) / 2).distanceTo(roofPoint(face, 0.5 - 0.5 / columns, (t0 + t1) / 2))
      const radius = Math.max(0.035, Math.min(0.155, localWidth * 0.58))
      const shade = 0.76 + rand() * 0.32
      const offset = positions.length / 3
      for (let axial = 0; axial <= 1; axial++) {
        const t = t0 + (t1 - t0) * axial
        const point = roofPoint(face, u, t)
        const direction = roofPoint(face, u, Math.min(1, t + 0.003)).sub(roofPoint(face, u, Math.max(0, t - 0.003))).normalize()
        const normal = direction.clone().cross(cross).normalize()
        if (normal.y < 0) normal.negate()
        for (let arc = 0; arc <= arcSegments; arc++) {
          const angle = arc / arcSegments * Math.PI
          const vertex = point.clone()
            .addScaledVector(cross, Math.cos(angle) * radius)
            .addScaledVector(normal, Math.sin(angle) * radius * 0.67 + 0.025)
          positions.push(vertex.x, vertex.y, vertex.z)
          colors.push(shade, shade * (0.985 + rand() * 0.03), shade * 0.96)
          if (axial === 0 && arc < arcSegments) {
            const a = offset + arc
            const b = a + arcSegments + 1
            indices.push(a, b, a + 1, a + 1, b, b + 1)
          }
        }
      }
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function chiwenGeometry(sign: number) {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.bezierCurveTo(-0.16, 0.35, -0.32, 0.85, -0.08, 1.18)
  shape.bezierCurveTo(-0.32, 1.32, -0.33, 1.64, -0.08, 1.83)
  shape.lineTo(0.12, 1.65)
  shape.bezierCurveTo(0.02, 1.46, 0.36, 1.51, 0.36, 1.33)
  shape.bezierCurveTo(0.12, 1.23, 0.25, 0.91, 0.3, 0.7)
  shape.bezierCurveTo(0.43, 0.35, 0.4, 0.12, 0.24, 0)
  shape.closePath()
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.04, bevelThickness: 0.035, curveSegments: 12 })
  geometry.scale(sign, 1, 1)
  return geometry
}

export function buildFoguangHall(_params: HallParams): PagodaModel {
  void _params
  const group = new THREE.Group()
  const layers: BuiltLayer[] = []
  const radialParts: RadialPart[] = []
  const wallMats: THREE.MeshStandardMaterial[] = []
  const fadeMats: THREE.MeshStandardMaterial[] = []
  const wood = standard(0xb08a70, surfaceTexture('wood'))
  const red = standard(0xb58570, surfaceTexture('red'), 0.94)
  const darkWood = standard(0x795c46, surfaceTexture('wood'))
  const stone = standard(0xd1c8b3, surfaceTexture('stone'), 0.98)
  const roofMat = standard(0x91978f, surfaceTexture('tile'), 0.94)
  roofMat.side = THREE.DoubleSide
  roofMat.vertexColors = true
  const underRoof = standard(0x56594f, surfaceTexture('tile'))
  underRoof.side = THREE.DoubleSide
  const metal = standard(0x3c362e, undefined, 0.63)
  metal.metalness = 0.36
  const brick = standard(0xc8bda2, surfaceTexture('stone'))
  const plaster = standard(0xc4b99c, surfaceTexture('stone'))
  wallMats.push(red, brick, plaster)
  fadeMats.push(red, brick, plaster)
  let cursor = 0
  const addLayer = (id: string, height: number, object: THREE.Group, materials: THREE.MeshStandardMaterial[]) => {
    object.position.y = cursor
    object.traverse((child) => {
      child.userData.layerId = id
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    object.userData.layerId = id
    group.add(object)
    layers.push({ id, obj: object, baseY: cursor, index: layers.length, mats: materials })
    cursor += height
  }
  const radial = (object: THREE.Object3D, amount = 1.2, lift = 0.25) => {
    const length = Math.hypot(object.position.x, object.position.z)
    if (length < 0.01) return
    radialParts.push({ mesh: object, dx: object.position.x / length, dz: object.position.z / length, amount: length * 0.45 + amount, baseX: object.position.x, baseY: object.position.y, baseZ: object.position.z, lift })
  }

  {
    const g = new THREE.Group()
    g.add(mesh(box(W + 3.5, PLATFORM, D + 3.5, 0, PLATFORM / 2, 0), stone))
    for (let step = 0; step < 3; step++) {
      g.add(mesh(box(5.2, 0.18, 0.48, 0, 0.09 + step * 0.18, D / 2 + 3.0 - step * 0.46), stone))
    }
    addLayer('platform', PLATFORM, g, [stone])
  }

  {
    const g = new THREE.Group()
    const columnGeometry = new THREE.CylinderGeometry(0.27, 0.34, COLUMN - 0.12, 24)
    const baseGeometry = new THREE.CylinderGeometry(0.43, 0.48, 0.2, 24)
    const positions: [number, number][] = []
    for (let bay = 0; bay <= 7; bay++) {
      const x = -W / 2 + bay * W / 7
      positions.push([x, D / 2], [x, -D / 2])
    }
    for (let row = 1; row < 4; row++) {
      const z = -D / 2 + row * D / 4
      positions.push([-W / 2, z], [W / 2, z])
    }
    for (const [x, z] of positions) {
      const column = mesh(columnGeometry, wood, x, COLUMN / 2, z)
      g.add(column, mesh(baseGeometry, stone, x, 0.1, z))
      radial(column, 0.7, 0.4)
    }
    // 金厢斗底槽：内槽柱网不是实心墙体。
    for (const x of [-12.15, -7.29, -2.43, 2.43, 7.29, 12.15]) {
      for (const z of [-D / 4, D / 4]) {
        const column = mesh(new THREE.CylinderGeometry(0.31, 0.36, COLUMN + 0.25, 24), darkWood, x, (COLUMN + 0.25) / 2, z)
        g.add(column)
        radial(column, 0.5, 0.3)
      }
    }
    for (const z of [-D / 2, D / 2]) g.add(mesh(box(W + 0.5, 0.38, 0.34, 0, COLUMN - 0.16, z), wood))
    for (const x of [-W / 2, W / 2]) g.add(mesh(box(0.34, 0.38, D, x, COLUMN - 0.16, 0), wood))

    // 背面与山墙：朱红墙、青砖下碱、白色墙肩。
    g.add(mesh(box(W - 0.5, 1.45, 0.34, 0, 0.73, -D / 2 + 0.17), brick))
    g.add(mesh(box(W - 0.5, 2.75, 0.3, 0, 2.83, -D / 2 + 0.17), red))
    g.add(mesh(box(W - 0.5, 0.6, 0.3, 0, 4.5, -D / 2 + 0.17), plaster))
    for (const x of [-W / 2 + 0.16, W / 2 - 0.16]) {
      g.add(mesh(box(0.34, 1.45, D - 0.4, x, 0.73, 0), brick))
      g.add(mesh(box(0.3, 2.75, D - 0.4, x, 2.83, 0), red))
      g.add(mesh(box(0.3, 0.6, D - 0.4, x, 4.5, 0), plaster))
    }

    for (let bay = 0; bay < 7; bay++) {
      const centerX = -W / 2 + (bay + 0.5) * W / 7
      const bayW = W / 7
      if (bay === 0 || bay === 6) {
        g.add(mesh(box(bayW - 0.42, 1.48, 0.32, centerX, 0.74, D / 2), brick))
        g.add(mesh(box(bayW - 0.42, 0.43, 0.32, centerX, 4.43, D / 2), red))
        g.add(mesh(box(bayW - 0.55, 2.28, 0.18, centerX, 2.94, D / 2 - 0.06), darkWood))
        const slats: THREE.BufferGeometry[] = []
        for (let slat = 0; slat < 23; slat++) {
          slats.push(box(0.045, 2.17, 0.09, centerX - (bayW - 0.85) / 2 + slat * (bayW - 0.85) / 22, 2.94, D / 2 + 0.075))
        }
        for (const y of [1.82, 4.06]) slats.push(box(bayW - 0.5, 0.14, 0.18, centerX, y, D / 2 + 0.08))
        g.add(mesh(mergeGeometries(slats)!, wood))
      } else {
        // 五间双开板门；明间门扇打开，能看到殿内佛坛。
        const opening = bay === 3
        for (const sign of [-1, 1]) {
          const leafW = (bayW - 0.45) / 2
          const leaf = new THREE.Group()
          const boards: THREE.BufferGeometry[] = []
          for (let board = 0; board < 9; board++) boards.push(box(leafW / 9 - 0.012, 3.97, 0.13, -leafW / 2 + (board + 0.5) * leafW / 9, 2.1, 0))
          leaf.add(mesh(mergeGeometries(boards)!, red))
          for (const y of [0.48, 2.0, 3.7]) leaf.add(mesh(box(leafW, 0.12, 0.055, 0, y, 0.09), darkWood))
          const studs: THREE.BufferGeometry[] = []
          for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 4; col++) {
              const stud = new THREE.SphereGeometry(0.034, 7, 5)
              stud.translate(-leafW * 0.38 + col * leafW * 0.25, 0.65 + row * 0.48, 0.09)
              studs.push(stud)
            }
          }
          leaf.add(mesh(mergeGeometries(studs)!, metal))
          leaf.position.set(centerX + sign * (bayW - 0.45) / 4, 0.1, D / 2)
          if (opening) {
            leaf.position.x = centerX + sign * (bayW - 0.45) / 2
            leaf.rotation.y = sign * Math.PI * 0.43
            leaf.children.forEach((child) => { child.position.x = -sign * leafW / 2 })
          }
          g.add(leaf)
        }
      }
      g.add(mesh(box(bayW - 0.22, 0.23, 0.34, centerX, 4.36, D / 2), wood))
    }
    const plaque = plaqueMesh('佛光真容禅寺', 1.02, 3.58, true)
    plaque.position.set(0, COLUMN + 0.8, D / 2 + 2.12)
    g.add(plaque)
    radial(plaque, 0.4, 0.3)
    const statueMat = standard(0xbc955b, undefined, 0.72)
    for (const [x, z, scale] of [[-7.2, -2.8, 1.2], [-3.6, -2.8, 1.25], [0, -2.8, 1.4], [3.6, -2.8, 1.25], [7.2, -2.8, 1.2]]) {
      const statue = mesh(buddhaGeo(), statueMat, x, 0.45, z)
      statue.scale.setScalar(scale)
      g.add(statue)
    }
    const glow = new THREE.PointLight(0xffc78c, 18, 22, 1.7)
    glow.position.set(0, 3.5, 0)
    g.add(glow)
    addLayer('columns', COLUMN, g, [wood, red, darkWood, stone, brick, plaster])
  }

  {
    const g = new THREE.Group()
    const bracketGeometry = tangBracketGeometry()
    const spots: { x: number; z: number; rotation: number }[] = []
    for (let bay = 0; bay <= 7; bay++) {
      const x = -W / 2 + bay * W / 7
      for (const sign of [-1, 1]) {
        spots.push({ x, z: sign * (D / 2 + 0.1), rotation: sign > 0 ? 0 : Math.PI })
        if (bay < 7) spots.push({ x: x + W / 14, z: sign * (D / 2 + 0.1), rotation: sign > 0 ? 0 : Math.PI })
      }
    }
    for (let row = 0; row <= 4; row++) {
      const z = -D / 2 + row * D / 4
      for (const sign of [-1, 1]) {
        spots.push({ x: sign * (W / 2 + 0.1), z, rotation: sign > 0 ? Math.PI / 2 : -Math.PI / 2 })
        if (row < 4) spots.push({ x: sign * (W / 2 + 0.1), z: z + D / 8, rotation: sign > 0 ? Math.PI / 2 : -Math.PI / 2 })
      }
    }
    for (const spot of spots) {
      const bracket = mesh(bracketGeometry, darkWood, spot.x, 0, spot.z)
      bracket.rotation.y = spot.rotation
      g.add(bracket)
      radial(bracket, 0.9, 0.7)
    }
    for (const z of [-D / 2, D / 2]) g.add(mesh(box(W + 0.9, 0.22, 0.28, 0, 0.18, z), darkWood))
    for (const x of [-W / 2, W / 2]) g.add(mesh(box(0.28, 0.22, D + 0.8, x, 0.18, 0), darkWood))
    addLayer('brackets', BRACKET, g, [darkWood])
  }

  {
    const g = new THREE.Group()
    for (let bay = 0; bay <= 7; bay++) {
      const x = -W / 2 + bay * W / 7
      g.add(mesh(box(0.34, 0.62, D + 1.4, x, 0.34, 0), darkWood))
    }
    for (let row = 0; row <= 4; row++) g.add(mesh(box(W + 1.2, 0.27, 0.28, 0, 0.7, -D / 2 + row * D / 4), darkWood))
    addLayer('beams', BEAM, g, [darkWood])
  }

  const faces: RoofFace[] = [
    { topA: [-RIDGE_LENGTH / 2, ROOF, 0], topB: [RIDGE_LENGTH / 2, ROOF, 0], botA: [-EAVE_W, 0, EAVE_D], botB: [EAVE_W, 0, EAVE_D], dx: 0, dz: 1 },
    { topA: [RIDGE_LENGTH / 2, ROOF, 0], topB: [-RIDGE_LENGTH / 2, ROOF, 0], botA: [EAVE_W, 0, -EAVE_D], botB: [-EAVE_W, 0, -EAVE_D], dx: 0, dz: -1 },
    { topA: [RIDGE_LENGTH / 2, ROOF, 0], topB: [RIDGE_LENGTH / 2, ROOF, 0], botA: [EAVE_W, 0, -EAVE_D], botB: [EAVE_W, 0, EAVE_D], dx: 1, dz: 0 },
    { topA: [-RIDGE_LENGTH / 2, ROOF, 0], topB: [-RIDGE_LENGTH / 2, ROOF, 0], botA: [-EAVE_W, 0, EAVE_D], botB: [-EAVE_W, 0, -EAVE_D], dx: -1, dz: 0 },
  ]
  {
    const g = new THREE.Group()
    const rafters: THREE.BufferGeometry[] = []
    faces.forEach((face, index) => {
      const base = mesh(roofGeometry(face), underRoof)
      const tiles = mesh(tiledRoofGeometry(face, 857 + index * 97), roofMat)
      g.add(base, tiles)
      for (const object of [base, tiles]) radialParts.push({ mesh: object, dx: face.dx, dz: face.dz, amount: 3.1, baseX: 0, baseY: 0, baseZ: 0, lift: 0.9 })
      const width = new THREE.Vector3(...face.botA).distanceTo(new THREE.Vector3(...face.botB))
      const count = Math.round(width / 0.31)
      for (let column = 0; column <= count; column++) {
        const u = column / count
        const a = roofPoint(face, u, 0.64)
        const b = roofPoint(face, u, 1)
        a.y -= 0.15
        b.y -= 0.14
        rafters.push(beamBetween(a, b, 0.095, 0.13))
      }
    })
    g.add(mesh(mergeGeometries(rafters)!, darkWood))
    // 草栿、平梁与唐构叉手在拆解后可见。
    for (const x of [-12.15, -7.29, -2.43, 2.43, 7.29, 12.15]) {
      g.add(mesh(beamBetween(new THREE.Vector3(x, 0.2, -D / 2), new THREE.Vector3(x, 0.2, D / 2), 0.32, 0.5), darkWood))
      for (const sign of [-1, 1]) {
        g.add(mesh(beamBetween(new THREE.Vector3(x, 0.55, sign * D / 2), new THREE.Vector3(x, ROOF - 0.25, 0), 0.2, 0.28), darkWood))
      }
    }
    addLayer('roof', ROOF, g, [roofMat, underRoof, darkWood])
  }

  {
    const g = new THREE.Group()
    const ridgeMat = standard(0x747d71, surfaceTexture('tile'))
    g.add(mesh(box(RIDGE_LENGTH + 0.5, 0.46, 0.55, 0, 0.26, 0), ridgeMat))
    const capGeometries: THREE.BufferGeometry[] = []
    for (let x = -RIDGE_LENGTH / 2; x <= RIDGE_LENGTH / 2; x += 0.3) {
      const cap = new THREE.CylinderGeometry(0.16, 0.16, 0.33, 10, 1, false, 0, Math.PI)
      cap.rotateZ(Math.PI / 2)
      cap.rotateY(Math.PI / 2)
      cap.translate(x, 0.54, 0)
      capGeometries.push(cap)
    }
    g.add(mesh(mergeGeometries(capGeometries)!, ridgeMat))
    for (const face of [faces[0], faces[2]]) {
      for (const u of [0, 1]) {
        for (let segment = 0; segment < 16; segment++) {
          const a = roofPoint(face, u, segment / 16)
          const b = roofPoint(face, u, (segment + 1) / 16)
          // 脊饰层原点已在屋脊，垂脊须向下回到檐角，不能再次叠加屋顶举高。
          a.y += 0.12 - ROOF
          b.y += 0.12 - ROOF
          g.add(mesh(beamBetween(a, b, 0.25, 0.28), ridgeMat))
        }
      }
    }
    const patina = standard(0x708777, surfaceTexture('tile'), 0.76)
    for (const sign of [-1, 1]) {
      const chiwen = mesh(chiwenGeometry(sign), patina, sign * RIDGE_LENGTH / 2, 0.42, -0.12)
      g.add(chiwen)
      radial(chiwen, 0.7, 0.4)
    }
    addLayer('ridge', 2.3, g, [ridgeMat, patina])
  }

  return { group, layers, wallMats, fadeMats, radialParts, labelMats: [], totalHeight: cursor }
}
