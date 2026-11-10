// 佛光寺东大殿外檐柱头铺作：逐件可拆解的教学模型。
// 斗口和横栱半卯为真实几何；不可见销钉与隐蔽榫形不作实测推断。
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { addBlock, textSprite, type JointBlock, type JointModel } from './joint'
import { woodTex } from './textures'

function material(color: number, roughness = 0.82) {
  return new THREE.MeshStandardMaterial({ color, map: woodTex(), roughness, metalness: 0.01 })
}

const WOOD = material(0xc7a589)
const HENG = material(0xd0ab89)
const DOU = material(0xb99575, 0.88)
const ANG = material(0xd5af62, 0.78)
const DARK = material(0x92755c, 0.9)

function placed(geometry: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) {
  const mesh = new THREE.Mesh(geometry, mat)
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function rounded(w: number, h: number, d: number, x: number, y: number, z: number) {
  const geometry = new RoundedBoxGeometry(w, h, d, 2, Math.min(0.025, h * 0.08))
  geometry.translate(x, y, z)
  return geometry
}

// 四耳斗：底座加四角斗耳，中间保留真正的十字槽。
export function crossDouGeometry(w: number, h: number, slot: number) {
  const parts = [rounded(w * 0.82, h * 0.48, w * 0.82, 0, -h * 0.26, 0)]
  const ear = (w - slot) / 2
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      parts.push(rounded(ear, h * 0.52, ear, sx * (slot + ear) / 2, h * 0.24, sz * (slot + ear) / 2))
    }
  }
  return mergeGeometries(parts)!
}

// 双耳斗：沿 x 方向贯通的一字槽，用于承托横栱或枋木。
export function singleDouGeometry(w: number, h: number, slot: number) {
  const parts = [rounded(w * 0.84, h * 0.48, w * 0.84, 0, -h * 0.26, 0)]
  const ear = (w - slot) / 2
  for (const sign of [-1, 1]) {
    parts.push(rounded(w, h * 0.52, ear, 0, h * 0.24, sign * (slot + ear) / 2))
  }
  return mergeGeometries(parts)!
}

function straightBeam(length: number, height: number, thick: number, axis: 'x' | 'z', notch?: 'top' | 'bottom') {
  const parts: THREE.BufferGeometry[] = []
  const make = (len: number, h: number, along: number, y: number) => {
    const geometry = new THREE.BoxGeometry(axis === 'x' ? len : thick, h, axis === 'z' ? len : thick)
    geometry.translate(axis === 'x' ? along : 0, y, axis === 'z' ? along : 0)
    parts.push(geometry)
  }
  if (!notch) {
    make(length, height, 0, 0)
  } else {
    const notchWidth = Math.min(thick * 1.08, length * 0.25)
    const side = (length - notchWidth) / 2
    make(side, height, -(notchWidth + side) / 2, 0)
    make(side, height, (notchWidth + side) / 2, 0)
    make(notchWidth, height / 2, 0, notch === 'top' ? -height / 4 : height / 4)
  }
  return mergeGeometries(parts)!
}

// 带卷杀轮廓与顶部半卯的横栱，避免把栱做成普通方木。
function gongGeometry(length: number, height: number, thick: number) {
  const half = length / 2
  const notch = thick * 0.54
  const shape = new THREE.Shape()
  shape.moveTo(-half, -height * 0.15)
  shape.lineTo(-half, height * 0.16)
  shape.quadraticCurveTo(-half * 0.88, height * 0.4, -half * 0.7, height * 0.48)
  shape.lineTo(-notch, height * 0.5)
  shape.lineTo(-notch, 0)
  shape.lineTo(notch, 0)
  shape.lineTo(notch, height * 0.5)
  shape.lineTo(half * 0.7, height * 0.48)
  shape.quadraticCurveTo(half * 0.88, height * 0.4, half, height * 0.16)
  shape.lineTo(half, -height * 0.15)
  shape.quadraticCurveTo(half * 0.74, -height * 0.32, half * 0.45, -height * 0.38)
  shape.quadraticCurveTo(0, -height * 0.68, -half * 0.45, -height * 0.38)
  shape.quadraticCurveTo(-half * 0.74, -height * 0.32, -half, -height * 0.15)
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.012, bevelThickness: 0.012, curveSegments: 8 })
  geometry.translate(0, 0, -thick / 2)
  return geometry
}

// 批竹式昂嘴与斜置昂身，局部 x 方向为厚度、z 方向为出跳。
function angGeometry(length: number, rise: number, thick: number, width: number) {
  const shape = new THREE.Shape()
  shape.moveTo(-length / 2, rise / 2 + thick / 2)
  shape.lineTo(length / 2, -rise / 2 + thick / 2)
  shape.lineTo(length / 2 + 0.16, -rise / 2 - thick * 0.82)
  shape.lineTo(length / 2 - 0.08, -rise / 2 - thick * 1.12)
  shape.lineTo(-length / 2, rise / 2 - thick / 2)
  shape.closePath()
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.015, bevelThickness: 0.015 })
  geometry.translate(0, 0, -width / 2)
  geometry.rotateY(-Math.PI / 2)
  return geometry
}

function shuaGeometry(length: number, height: number, width: number) {
  const shape = new THREE.Shape()
  shape.moveTo(-length / 2, -height / 2)
  shape.lineTo(length / 2 - 0.28, -height / 2)
  shape.lineTo(length / 2, -height * 0.12)
  shape.lineTo(length / 2 - 0.18, height * 0.25)
  shape.lineTo(length / 2 - 0.44, height / 2)
  shape.lineTo(-length / 2, height / 2)
  shape.closePath()
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.018, bevelThickness: 0.018 })
  geometry.translate(0, 0, -width / 2)
  geometry.rotateY(-Math.PI / 2)
  return geometry
}

export function buildFoguangJoint(): JointModel {
  const group = new THREE.Group()
  const blocks: JointBlock[] = []
  const assembly = new THREE.Group()
  const add = (id: string, mesh: THREE.Mesh, spreadX = 0, spreadZ = 0) => {
    const index = blocks.length
    addBlock(assembly, blocks, id, mesh, index)
    const block = blocks[blocks.length - 1]
    block.dx = spreadX
    block.dz = spreadZ
  }
  const dou = (id: string, x: number, y: number, z: number, size = 0.4, h = 0.34, cross = true) => {
    add(id, placed(cross ? crossDouGeometry(size, h, size * 0.36) : singleDouGeometry(size, h, size * 0.34), DOU, x, y, z), Math.sign(x) * 0.7)
  }
  const gong = (id: string, length: number, height: number, thick: number, y: number, z: number) => {
    add(id, placed(gongGeometry(length, height, thick), HENG, 0, y, z), 0, 0.35)
  }

  add('fq-col', placed(new THREE.CylinderGeometry(0.34, 0.42, 2.4, 24), WOOD, 0, 1.2, 0))
  add('fq-lane', placed(straightBeam(4.2, 0.38, 0.34, 'x'), DARK, 0, 2.63, 0), -0.4)
  dou('fq-ludou', 0, 3.12, 0, 1.02, 0.66)
  gong('fq-nidao', 3.3, 0.34, 0.28, 3.63, 0)
  dou('fq-nidao-san-l', -1.3, 3.94, 0)
  dou('fq-nidao-san-r', 1.3, 3.94, 0)

  add('fq-hua1', placed(straightBeam(2.6, 0.36, 0.28, 'z', 'bottom'), WOOD, 0, 3.63, 0.3), 0, 0.5)
  dou('fq-jh1', 0, 4.04, 1.45, 0.46, 0.38)
  add('fq-hua2', placed(straightBeam(3.3, 0.34, 0.28, 'z', 'bottom'), WOOD, 0, 4.35, 0.85), 0, 0.75)
  dou('fq-jh2', 0, 4.68, 2.3, 0.47, 0.4)
  gong('fq-guazi', 3.8, 0.32, 0.27, 4.98, 2.3)
  dou('fq-guazi-qixin', 0, 5.24, 2.3, 0.36, 0.3, false)
  dou('fq-guazi-san-l', -1.55, 5.24, 2.3, 0.36, 0.3, false)
  dou('fq-guazi-san-r', 1.55, 5.24, 2.3, 0.36, 0.3, false)
  gong('fq-man', 4.5, 0.34, 0.28, 5.53, 2.3)
  dou('fq-man-san-l', -1.9, 5.8, 2.3, 0.37, 0.31, false)
  dou('fq-man-san-r', 1.9, 5.8, 2.3, 0.37, 0.31, false)
  add('fq-zhutoufang', placed(straightBeam(4.2, 0.3, 0.3, 'x', 'top'), DARK, 0, 4.12, 0), -0.5)
  add('fq-luohanfang', placed(straightBeam(4.9, 0.28, 0.3, 'x', 'top'), DARK, 0, 6.04, 2.3), 0.5)

  add('fq-ang1', placed(angGeometry(4.0, 0.7, 0.25, 0.28), ANG, 0, 5.56, 1.15), 0, 1.0)
  dou('fq-jh3', 0, 5.77, 3.0, 0.45, 0.38)
  add('fq-ang2', placed(angGeometry(4.5, 0.85, 0.28, 0.3), ANG, 0, 6.16, 1.65), 0, 1.3)
  dou('fq-jh4', 0, 6.08, 3.75, 0.47, 0.4)
  gong('fq-ling', 3.7, 0.32, 0.27, 6.36, 3.75)
  dou('fq-ling-san-l', -1.5, 6.62, 3.75, 0.36, 0.3, false)
  dou('fq-ling-san-r', 1.5, 6.62, 3.75, 0.36, 0.3, false)
  dou('fq-qixin', 0, 6.62, 3.75, 0.37, 0.3, false)
  add('fq-shua', placed(shuaGeometry(4.2, 0.29, 0.28), WOOD, 0, 6.56, 2.15), 0, 1.1)
  add('fq-timu', placed(straightBeam(3.5, 0.22, 0.32, 'x'), HENG, 0, 6.88, 3.75), 0, 0.6)
  const purlin = placed(new THREE.CylinderGeometry(0.16, 0.16, 5.2, 20), DARK, 0, 7.14, 3.75)
  purlin.rotation.z = Math.PI / 2
  add('fq-liaoyan', purlin, 0, 0.8)
  const rafter = placed(new THREE.BoxGeometry(0.22, 0.22, 2.4), WOOD, 0, 7.4, 4.35)
  rafter.rotation.x = -0.18
  add('fq-rafter', rafter, 0, 1.5)
  add('fq-caoru', placed(straightBeam(3.2, 0.52, 0.4, 'z'), DARK, 0, 6.55, -0.85), 0, -1.2)

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.42, 7.7), new THREE.MeshStandardMaterial({ color: 0x655d50, roughness: 0.98 }))
  plinth.position.set(0, -0.23, 1.0)
  plinth.receiveShadow = true
  assembly.add(plinth)
  const title = textSprite('七铺作 · 双杪双下昂', 4.8, 0.68, 40)
  title.position.set(0, 8.35, 0.5)
  title.userData.explodeLabel = true
  assembly.add(title)
  const note = textSprite('一、三跳偷心 · 二、四跳计心', 4.6, 0.5, 32)
  note.position.set(0, 7.85, -0.3)
  note.userData.explodeLabel = true
  assembly.add(note)
  group.add(assembly)
  return { group, blocks }
}
