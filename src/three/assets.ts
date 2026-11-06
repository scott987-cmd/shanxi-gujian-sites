// GLB 模型加载与适配（Tripo 生成件接入，保留拆解）
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

const MODEL_BASES = [
  'https://gcore.jsdelivr.net/gh/scott987-cmd/shanxi-gujian-sites@ab0dcdf0ef3a027116e8ac74b0a837ea759cdb70/models',
  'https://fastly.jsdelivr.net/gh/scott987-cmd/shanxi-gujian-sites@ab0dcdf0ef3a027116e8ac74b0a837ea759cdb70/models',
]

const cache = new Map<string, Promise<THREE.Group | null>>()

export function loadGLB(url: string): Promise<THREE.Group | null> {
  if (!cache.has(url)) {
    cache.set(
      url,
      new Promise((resolve) => {
        const urls = url.startsWith('/models/') ? MODEL_BASES.map((base) => `${base}/${url.slice('/models/'.length)}`) : [url]
        const attempt = (index: number) => {
          if (index >= urls.length) {
            resolve(null)
            return
          }
          new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(urls[index], (gltf) => resolve(gltf.scene), undefined, (error) => {
            console.warn(`模型节点加载失败，尝试备用节点：${urls[index]}`, error)
            attempt(index + 1)
          })
        }
        attempt(0)
      }),
    )
  }
  return cache.get(url)!
}

// 缩放到目标高度，底部对齐 y=0，水平居中
export function fitToHeight(obj: THREE.Object3D, h: number) {
  // 幂等：先复位缩放与位置，避免双挂载/缓存复用时把上次的变换读进测量
  obj.scale.setScalar(1)
  obj.position.set(0, 0, 0)
  const box = new THREE.Box3().setFromObject(obj)
  const size = box.getSize(new THREE.Vector3())
  const s = h / size.y
  obj.scale.setScalar(s)
  const center = box.getCenter(new THREE.Vector3())
  obj.position.x = -center.x * s
  obj.position.z = -center.z * s
  obj.position.y = -box.min.y * s
}

export function swapModel(
  root: THREE.Object3D,
  key: string,
  source: THREE.Group,
  radialParts?: { mesh: THREE.Object3D }[],
) {
  const targets: { mesh: THREE.Mesh; h: number }[] = []
  root.traverse((o) => {
    if (o instanceof THREE.Mesh && o.userData[key]) {
      targets.push({ mesh: o, h: o.userData[`${key}H`] as number })
    }
  })
  for (const t of targets) {
    const clone = source.clone(true)
    fitToHeight(clone, t.h)
    clone.position.x += t.mesh.position.x
    clone.position.z += t.mesh.position.z
    clone.position.y += t.mesh.position.y
    clone.rotation.y = t.mesh.rotation.y
    clone.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true
        o.receiveShadow = true
        o.userData.layerId = t.mesh.userData.layerId
      }
    })
    t.mesh.parent?.add(clone)
    t.mesh.visible = false
    // 径向散开表改指向 GLB 实例，保留散开动画
    if (radialParts) {
      for (const rp of radialParts) {
        if (rp.mesh === t.mesh) rp.mesh = clone
      }
    }
  }
}

// 整楼模型加载并按目标高度缩放；提高斜视屋檐、斗拱时的纹理清晰度
export async function loadBuildingModel(id: string, totalHeight: number, renderer?: THREE.WebGLRenderer): Promise<THREE.Group | null> {
  const m = await loadGLB(`/models/building-${id}.glb`)
  if (!m) return null
  fitToHeight(m, totalHeight)
  const anisotropy = renderer?.capabilities.getMaxAnisotropy() ?? 1
  m.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true
      o.receiveShadow = true
      const materials = Array.isArray(o.material) ? o.material : [o.material]
      for (const material of materials) {
        for (const slot of ['map', 'normalMap', 'bumpMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap'] as const) {
          const texture = material[slot]
          if (texture) {
            texture.anisotropy = anisotropy
            texture.needsUpdate = true
          }
        }
      }
    }
  })
  return m
}
