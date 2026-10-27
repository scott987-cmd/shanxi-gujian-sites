// 粒子爆炸：从模型表面采样点云，向外飞散/回收
import * as THREE from 'three'

export interface ParticleBurst {
  points: THREE.Points
  setProgress: (t: number) => void
  dispose: () => void
}

export function createParticleBurst(root: THREE.Object3D): ParticleBurst {
  const base: number[] = []
  const dirs: number[] = []
  const speeds: number[] = []
  const ups: number[] = []
  const tmp = new THREE.Vector3()

  root.updateMatrixWorld(true)
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh) || !o.visible) return
    const geom = o.geometry as THREE.BufferGeometry
    const pos = geom.attributes.position as THREE.BufferAttribute
    const stride = Math.max(1, Math.floor(pos.count / 3000)) // 每 mesh 至多 160 点
    for (let i = 0; i < pos.count; i += stride) {
      tmp.fromBufferAttribute(pos, i)
      tmp.applyMatrix4(o.matrixWorld)
      base.push(tmp.x, tmp.y, tmp.z)
      // 随机向外方向（略偏上）
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      dirs.push(Math.sin(phi) * Math.cos(theta), Math.abs(Math.cos(phi)) * 0.7 + 0.35, Math.sin(phi) * Math.sin(theta))
      speeds.push(0.5 + Math.random() * 1.1)
      ups.push((Math.random() - 0.3) * 8)
    }
  })

  const count = base.length / 3
  const positions = new Float32Array(base)
  const geom = new THREE.BufferGeometry()
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({
    color: 0xd8b98a,
    size: 0.32,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  })
  const points = new THREE.Points(geom, mat)
  points.visible = false
  points.frustumCulled = false

  const setProgress = (t: number) => {
    if (t <= 0.001) {
      points.visible = false
      return
    }
    points.visible = true
    const arr = geom.attributes.position.array as Float32Array
    const spread = 26 * t
    for (let i = 0; i < count; i++) {
      const bi = i * 3
      const sp = speeds[i]
      arr[bi] = base[bi] + dirs[bi] * spread * sp
      arr[bi + 1] = base[bi + 1] + dirs[bi + 1] * spread * sp + ups[i] * t
      arr[bi + 2] = base[bi + 2] + dirs[bi + 2] * spread * sp
    }
    geom.attributes.position.needsUpdate = true
    mat.opacity = t > 0.85 ? Math.max(0.15, (1 - t) * 6) : 0.95
  }

  const dispose = () => {
    geom.dispose()
    mat.dispose()
  }

  return { points, setProgress, dispose }
}
