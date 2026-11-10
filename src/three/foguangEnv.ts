// 佛光寺东大殿环境：佛光山台地、松林与石板庭院。
// 环境为意向复原，不冒充寺院现状测绘。
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { contactTex, slabTex } from './textures'

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

function pine(x: number, z: number, height: number, seed: number) {
  const group = new THREE.Group()
  const rand = seeded(seed)
  const wood = new THREE.MeshStandardMaterial({ color: 0x62503b, roughness: 1 })
  const foliage = new THREE.MeshStandardMaterial({ color: 0x314d36, roughness: 0.98 })
  const trunk = new THREE.CylinderGeometry(height * 0.014, height * 0.026, height * 0.82, 12, 8)
  const positions = trunk.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < positions.count; i++) {
    const t = (positions.getY(i) + height * 0.41) / (height * 0.82)
    positions.setX(i, positions.getX(i) + Math.sin(t * 2.4) * height * 0.026 * t)
  }
  trunk.computeVertexNormals()
  trunk.translate(0, height * 0.41, 0)
  const woodParts: THREE.BufferGeometry[] = [trunk]
  const crowns: THREE.BufferGeometry[] = []
  for (let level = 0; level < 9; level++) {
    const t = level / 8
    const y = height * (0.45 + t * 0.48)
    const length = height * (0.27 - t * 0.17)
    const count = level < 3 ? 4 : 3
    for (let branch = 0; branch < count; branch++) {
      const angle = branch / count * Math.PI * 2 + level * 1.72 + rand() * 0.3
      const endpoint = new THREE.Vector3(Math.cos(angle) * length, y + height * 0.04, Math.sin(angle) * length)
      const start = new THREE.Vector3(Math.sin(y / height * 2.4) * height * 0.026, y, 0)
      const direction = endpoint.clone().sub(start)
      const geometry = new THREE.CylinderGeometry(height * 0.003, height * 0.009, direction.length(), 7)
      const matrix = new THREE.Matrix4().compose(
        start.clone().add(endpoint).multiplyScalar(0.5),
        new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()),
        new THREE.Vector3(1, 1, 1),
      )
      woodParts.push(geometry.applyMatrix4(matrix))
      for (let cluster = 0; cluster < 16; cluster++) {
        const k = 0.2 + cluster * 0.053
        const center = start.clone().lerp(endpoint, k)
        center.x += (rand() - 0.5) * height * 0.025
        center.z += (rand() - 0.5) * height * 0.025
        center.y += rand() * height * 0.025
        const crown = new THREE.IcosahedronGeometry(height * (0.012 + rand() * 0.014), 0)
        crown.scale(1.1 + rand() * 0.65, 0.35 + rand() * 0.2, 1.0 + rand() * 0.45)
        crown.rotateY(rand() * Math.PI)
        crown.translate(center.x, center.y, center.z)
        crowns.push(crown)
      }
    }
  }
  const trunkMesh = new THREE.Mesh(mergeGeometries(woodParts)!, wood)
  const crownMesh = new THREE.Mesh(mergeGeometries(crowns)!, foliage)
  trunkMesh.castShadow = crownMesh.castShadow = true
  trunkMesh.receiveShadow = crownMesh.receiveShadow = true
  group.add(trunkMesh, crownMesh)
  group.position.set(x, 0, z)
  return group
}

function mountainRange(z: number, width: number, height: number, seed: number) {
  const geometry = new THREE.PlaneGeometry(width, 120, 90, 26)
  geometry.rotateX(-Math.PI / 2)
  const position = geometry.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const depth = (position.getZ(i) + 60) / 120
    const ridge = Math.sin(x * 0.024 + seed) * 0.24 + Math.sin(x * 0.055 + seed * 0.7) * 0.12 + 0.68
    const falloff = Math.sin(depth * Math.PI)
    position.setY(i, Math.max(0, falloff * height * ridge - 3))
  }
  geometry.computeVertexNormals()
  const mountain = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x39483e, roughness: 1 }))
  mountain.position.set(0, 0, z)
  mountain.receiveShadow = true
  return mountain
}

export function buildFoguangEnvironment() {
  const group = new THREE.Group()
  const ground = new THREE.Mesh(new THREE.CircleGeometry(500, 96), new THREE.MeshStandardMaterial({ color: 0x525846, roughness: 1 }))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.09
  ground.receiveShadow = true
  group.add(ground)
  const paving = slabTex().clone()
  paving.repeat.set(18, 18)
  paving.needsUpdate = true
  const courtyard = new THREE.Mesh(new THREE.PlaneGeometry(96, 100), new THREE.MeshStandardMaterial({ color: 0xaaa18b, map: paving, roughness: 1 }))
  courtyard.rotation.x = -Math.PI / 2
  courtyard.position.set(0, -0.035, 12)
  courtyard.receiveShadow = true
  group.add(courtyard)
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(61, 54), new THREE.MeshBasicMaterial({ map: contactTex(), transparent: true, depthWrite: false }))
  contact.rotation.x = -Math.PI / 2
  contact.position.y = 0.006
  group.add(contact)
  group.add(mountainRange(-220, 500, 48, 3))
  group.add(mountainRange(-330, 700, 70, 7))
  group.add(pine(-25, 0, 22, 31))
  group.add(pine(26, -1, 24, 57))
  group.add(pine(-46, -28, 18, 76))
  group.add(pine(49, -33, 19, 91))
  // 台地边缘的低位石坎只放在两侧，避免遮挡大殿立面。
  const stone = new THREE.MeshStandardMaterial({ color: 0x89816e, roughness: 1 })
  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.5, 42), stone)
    wall.position.set(side * 32, 0.7, 0)
    wall.castShadow = wall.receiveShadow = true
    group.add(wall)
  }
  return group
}
