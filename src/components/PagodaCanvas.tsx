import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { buildPagoda, buildGenericTower, type PagodaModel } from '@/three/pagoda'
import { buildHall } from '@/three/hall'
import { buildCliff } from '@/three/cliff'
import { buildJoint, type JointModel } from '@/three/joint'
import { buildEnvironment } from '@/three/env'
import type { BuildingConfig } from '@/sites/types'

export interface PagodaCanvasProps {
  config: BuildingConfig
  mode: 'pagoda' | 'joint'
  explode: number
  spread: number
  selectedId: string | null
  onSelect: (id: string | null) => void
  seeThrough: boolean
  autoRotate: boolean
}

interface CamPreset {
  pos: THREE.Vector3
  tgt: THREE.Vector3
  spacing: number // 逐层拆解层间距
  liftK: number // 拆解时相机目标抬升量
  scaleK: number // 拆解时相机拉远系数
  spreadK: number // 散开时拉远系数
  baseY: number
}

const CAM_JOINT = { pos: new THREE.Vector3(4.5, 8, 18.5), tgt: new THREE.Vector3(0, 5, 0) }

export default function PagodaCanvas({ config, mode, explode, spread, selectedId, onSelect, seeThrough, autoRotate }: PagodaCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    controls: OrbitControls
    pagoda: PagodaModel
    joint: JointModel
    env: THREE.Group
    cam: CamPreset
    raycaster: THREE.Raycaster
    explodeCur: number
    radialCur: number
  } | null>(null)

  const propsRef = useRef({ mode, explode, spread, selectedId, seeThrough, autoRotate, onSelect })
  propsRef.current = { mode, explode, spread, selectedId, seeThrough, autoRotate, onSelect }

  // 初始化（仅一次）
  useEffect(() => {
    const host = hostRef.current!
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setClearColor(0x272d36)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    // 黄昏渐变天空
    const skyCv = document.createElement('canvas')
    skyCv.width = 4
    skyCv.height = 512
    const skyCtx = skyCv.getContext('2d')!
    const grad = skyCtx.createLinearGradient(0, 0, 0, 512)
    grad.addColorStop(0, '#2a3448')
    grad.addColorStop(0.45, '#4a4a54')
    grad.addColorStop(0.72, '#8a6a4e')
    grad.addColorStop(1, '#2b2620')
    skyCtx.fillStyle = grad
    skyCtx.fillRect(0, 0, 4, 512)
    const skyTex = new THREE.CanvasTexture(skyCv)
    skyTex.colorSpace = THREE.SRGBColorSpace
    scene.background = skyTex
    scene.fog = new THREE.Fog(0x3a3440, 170, 400)

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 900)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.maxDistance = 400
    controls.minDistance = 3
    controls.autoRotateSpeed = 0.9

    // 灯光
    scene.add(new THREE.HemisphereLight(0xfff2dd, 0x4a3a28, 1.0))
    const sun = new THREE.DirectionalLight(0xffe8c4, 2.5)
    sun.position.set(50, 80, 35)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -55
    sun.shadow.camera.right = 55
    sun.shadow.camera.top = 90
    sun.shadow.camera.bottom = -10
    sun.shadow.camera.far = 260
    sun.shadow.bias = -0.0004
    scene.add(sun)
    const rim = new THREE.DirectionalLight(0x9db4d0, 0.5)
    rim.position.set(-45, 30, -50)
    scene.add(rim)

    // 环境
    const env = buildEnvironment(config.archetype === 'cliff' ? 'mountain' : 'courtyard')
    scene.add(env)

    // 模型（按建筑类型选引擎）
    const pagoda = config.archetype === 'pagoda' ? buildPagoda() : config.archetype === 'tower' ? buildGenericTower(config.tower!.stories, config.tower!.glaze) : config.archetype === 'cliff' ? buildCliff() : buildHall(config.hall!)
    scene.add(pagoda.group)
    const joint = buildJoint()
    joint.group.visible = false
    scene.add(joint.group)

    // 依据体量自动计算相机与拆解参数
    const bbox = new THREE.Box3().setFromObject(pagoda.group)
    const size = bbox.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const n = pagoda.layers.length
    const spacing = Math.max(1.1, maxDim * 0.032)
    const dist = maxDim * 1.15
    const cam: CamPreset = {
      pos: new THREE.Vector3(dist * 0.62, size.y * 0.62 + dist * 0.2, dist * 0.92),
      tgt: new THREE.Vector3(0, size.y * 0.42, 0),
      spacing,
      liftK: spacing * (n - 1) * 0.72,
      scaleK: Math.min(0.8, Math.max(0.25, (spacing * (n - 1)) / dist)),
      spreadK: 0.3,
      baseY: size.y * 0.42,
    }
    if (config.archetype === 'cliff') {
      cam.pos.set(8, 17, 40)
      cam.tgt.set(0, 13, 0)
      cam.baseY = 13
    }
    camera.position.copy(cam.pos)
    controls.target.copy(cam.tgt)

    const raycaster = new THREE.Raycaster()

    stateRef.current = { renderer, scene, camera, controls, pagoda, joint, env, cam, raycaster, explodeCur: 0, radialCur: 0 }

    // 尺寸
    const resize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    // 点击选择（区分拖拽）
    let downX = 0
    let downY = 0
    const onDown = (e: PointerEvent) => {
      downX = e.clientX
      downY = e.clientY
    }
    const onUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return
      const rect = renderer.domElement.getBoundingClientRect()
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(ndc, camera)
      const p = propsRef.current
      const root = p.mode === 'pagoda' ? pagoda.group : joint.group
      const hits = raycaster.intersectObjects(root.children, true)
      const hit = hits.find((h) => h.object.userData.layerId || h.object.userData.blockId)
      if (!hit) {
        p.onSelect(null)
        return
      }
      const id = p.mode === 'pagoda' ? hit.object.userData.layerId : hit.object.userData.blockId
      p.onSelect(id === p.selectedId ? null : id)
    }
    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('pointerup', onUp)

    // 动画循环
    let raf = 0
    let prevDistScale = 1
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const p = propsRef.current
      const st = stateRef.current!

      pagoda.group.visible = p.mode === 'pagoda'
      joint.group.visible = p.mode === 'joint'
      env.visible = p.mode === 'pagoda'

      st.explodeCur += (p.explode - st.explodeCur) * 0.09
      st.radialCur += (p.spread - st.radialCur) * 0.09
      const e = st.explodeCur
      const r = st.radialCur
      for (const l of pagoda.layers) {
        l.obj.position.y = l.baseY + e * l.index * st.cam.spacing
      }
      for (const b of joint.blocks) {
        b.mesh.position.y = b.baseY + e * b.index * 0.42
      }
      for (const rp of pagoda.radialParts) {
        rp.mesh.position.x = rp.baseX + rp.dx * rp.amount * r
        rp.mesh.position.z = rp.baseZ + rp.dz * rp.amount * r
        rp.mesh.position.y = rp.baseY + rp.lift * r
      }
      const labelOp = Math.min(1, Math.max(0, (r - 0.3) * 2))
      for (const m of pagoda.labelMats) m.opacity = labelOp

      // 相机随拆解抬升拉远
      const baseY = p.mode === 'pagoda' ? st.cam.baseY : 5
      const liftK = p.mode === 'pagoda' ? st.cam.liftK : 2
      const scaleK = p.mode === 'pagoda' ? st.cam.scaleK : 0.25
      const want = baseY + e * liftK
      controls.target.y += (want - controls.target.y) * 0.06
      const scale = 1 + e * scaleK + r * st.cam.spreadK
      const factor = scale / prevDistScale
      prevDistScale = scale
      if (Math.abs(factor - 1) > 0.0001) {
        camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target)
      }

      // 墙体透视 / 散开淡出
      for (const m of pagoda.wallMats) {
        const o = p.seeThrough ? 0.15 : 1 - r * 0.88
        m.transparent = o < 1
        m.opacity = o
        m.depthWrite = o >= 1
      }
      for (const m of pagoda.fadeMats) {
        if ((pagoda.wallMats as THREE.MeshStandardMaterial[]).includes(m)) continue
        const o = p.seeThrough ? 0.15 : 1 - r
        m.transparent = o < 1
        m.opacity = o
        m.depthWrite = o >= 1
      }

      // 选中高亮
      const applyEmissive = (obj: THREE.Object3D, on: boolean) => {
        obj.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            const mm = o.material as THREE.MeshStandardMaterial
            if (mm.emissive) {
              mm.emissive.setHex(on ? 0xa63d2a : 0x000000)
              mm.emissiveIntensity = on ? 0.45 : 0
            }
          }
        })
      }
      if (p.mode === 'pagoda') {
        for (const l of pagoda.layers) applyEmissive(l.obj, l.id === p.selectedId)
      } else {
        for (const b of joint.blocks) applyEmissive(b.mesh, b.id === p.selectedId)
      }

      controls.autoRotate = p.autoRotate
      controls.update()
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onDown)
      renderer.domElement.removeEventListener('pointerup', onUp)
      controls.dispose()
      renderer.dispose()
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose()
          const m = o.material
          if (Array.isArray(m)) m.forEach((x) => x.dispose())
          else m.dispose()
        }
      })
      host.removeChild(renderer.domElement)
      stateRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 模式切换：相机跳位
  useEffect(() => {
    const st = stateRef.current
    if (!st) return
    if (mode === 'joint') {
      st.camera.position.copy(CAM_JOINT.pos)
      st.controls.target.copy(CAM_JOINT.tgt)
    } else {
      st.camera.position.copy(st.cam.pos)
      st.controls.target.copy(st.cam.tgt)
    }
    st.controls.update()
  }, [mode])

  return <div ref={hostRef} className="h-full w-full cursor-grab active:cursor-grabbing" />
}
