import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { buildPagoda, buildGenericTower, type PagodaModel } from '@/three/pagoda'
import { buildHall } from '@/three/hall'
import { buildFoguangHall } from '@/three/foguangHall'
import { buildCliff } from '@/three/cliff'
import { buildJointOf } from '@/three/jointVariants'
import type { JointModel } from '@/three/joint'
import { buildEnvironment } from '@/three/env'
import { buildFoguangEnvironment } from '@/three/foguangEnv'
import { loadGLB, swapModel } from '@/three/assets'
import { fitToHeight, loadBuildingModel } from '@/three/assets'
import { createParticleBurst, type ParticleBurst } from '@/three/particles'
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
  burstTs: number
  slowMo: boolean
  realistic: boolean
  tour: boolean
  assemblyTs: number
  assemblyPlaying: boolean
  showForces: boolean
  onAssemblyProgress: (step: number) => void
  onAssemblyComplete: () => void
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
const CAM_FOGUANG_JOINT = { pos: new THREE.Vector3(5.2, 6.6, 13.2), tgt: new THREE.Vector3(0, 3.8, 1.1) }
const jointFitScale = (id: string, aspect: number) => Math.max(1, (id === 'foguangsi' ? 0.78 : 1.05) / aspect)

export default function PagodaCanvas({ config, mode, explode, spread, selectedId, onSelect, seeThrough, autoRotate, burstTs, slowMo, realistic, tour, assemblyTs, assemblyPlaying, showForces, onAssemblyProgress, onAssemblyComplete }: PagodaCanvasProps) {
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
    realModel: THREE.Group | null
    realScaled: boolean
    realFailed: boolean
    particles: ParticleBurst | null
  } | null>(null)
  const burstRef = useRef<{ active: boolean; t: number }>({ active: false, t: 0 })
  const assemblyRef = useRef<{ time: number | null; lastStep: number; completed: boolean }>({ time: null, lastStep: 0, completed: false })

  const propsRef = useRef({ mode, explode, spread, selectedId, seeThrough, autoRotate, onSelect, slowMo, realistic, tour, assemblyPlaying, showForces, onAssemblyProgress, onAssemblyComplete })
  propsRef.current = { mode, explode, spread, selectedId, seeThrough, autoRotate, onSelect, slowMo, realistic, tour, assemblyPlaying, showForces, onAssemblyProgress, onAssemblyComplete }

  // 初始化（仅一次）
  useEffect(() => {
    const host = hostRef.current!
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setClearColor(0x272d36)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.32
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    // PBR 环境反射（木、瓦、金属的真实反光）
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environmentIntensity = 0.35
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
    controls.autoRotateSpeed = 0.45

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
    sun.shadow.normalBias = 0.025
    scene.add(sun)
    const rim = new THREE.DirectionalLight(0x9db4d0, 0.5)
    rim.position.set(-45, 30, -50)
    scene.add(rim)
    if (config.id === 'foguangsi') {
      const facadeFill = new THREE.DirectionalLight(0xffe9d0, 0.65)
      facadeFill.position.set(-18, 20, 48)
      scene.add(facadeFill)
    }

    // 环境
    const env = config.id === 'foguangsi' ? buildFoguangEnvironment() : buildEnvironment(config.archetype === 'cliff' || config.envKind === 'mountain' ? 'mountain' : 'courtyard')
    scene.add(env)

    // 东大殿采用同一套结构模型兼顾外观和拆解，其他建筑保留既有渲染路径。
    const pagoda = config.id === 'foguangsi' ? buildFoguangHall(config.hall!) : config.archetype === 'pagoda' ? buildPagoda() : config.archetype === 'tower' ? buildGenericTower(config.tower!.stories, config.tower!.glaze) : config.archetype === 'cliff' ? buildCliff() : buildHall(config.hall!)
    scene.add(pagoda.group)
    // Tripo 高精度模型替换斗拱与佛像（保留可拆解结构）
    void Promise.all([
      loadGLB('/models/dougong.glb'),
      loadGLB('/models/buddha.glb'),
      loadGLB('/models/chiwen.glb'),
      loadGLB('/models/weituo.glb'),
      loadGLB('/models/panlong.glb'),
    ]).then(([dg, bud, cw, wt, pl]) => {
      if (dg) swapModel(pagoda.group, 'bracket', dg, pagoda.radialParts)
      if (bud) swapModel(pagoda.group, 'buddha', bud, pagoda.radialParts)
      if (cw) swapModel(pagoda.group, 'chiwen', cw, pagoda.radialParts)
      if (wt) swapModel(pagoda.group, 'weituo', wt, pagoda.radialParts)
      if (pl) swapModel(pagoda.group, 'panlong', pl, pagoda.radialParts)
    })
    const joint = buildJointOf(config.jointType ?? 'default')
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
      cam.pos.set(12, 22, 65)
      cam.tgt.set(0, 14, 0)
      cam.baseY = 14
    }
    if (config.id === 'foguangsi') {
      // 东大殿以接近人视的高度呈现七开间立面，避免俯视遮死斗拱与板门。
      cam.pos.set(dist * 0.20, size.y * 0.60, dist * 1.03)
      cam.tgt.set(0, size.y * 0.39, 0)
      cam.baseY = size.y * 0.39
    }
    camera.position.copy(cam.pos)
    controls.target.copy(cam.tgt)

    const raycaster = new THREE.Raycaster()

    // 整楼写实模型（仅加载已通过形制复核的版本）
    const realTargetHeight = config.id === 'qingliansi' ? pagoda.totalHeight * 3.2 : pagoda.totalHeight
    let realModel: THREE.Group | null = null
    let loading: HTMLDivElement | null = null
    if (config.realisticModel !== false) {
      host.style.position = 'relative'
      loading = document.createElement('div')
      loading.textContent = '高清模型加载中…'
      loading.style.cssText = 'position:absolute;inset:0;z-index:3;display:flex;align-items:center;justify-content:center;background:rgba(39,45,54,.72);color:#e8dcb8;font-size:14px;letter-spacing:3px;pointer-events:none'
      host.appendChild(loading)
      void loadBuildingModel(config.id, realTargetHeight, renderer).then((m) => {
        loading?.remove()
        if (!m) {
          if (stateRef.current) stateRef.current.realFailed = true
          return
        }
        if (stateRef.current) stateRef.current.realModel = m
        scene.add(m)
      }).catch((error) => {
        loading?.remove()
        if (stateRef.current) stateRef.current.realFailed = true
        console.error('整楼模型适配失败', config.id, error)
      })
    }

    stateRef.current = { renderer, scene, camera, controls, pagoda, joint, env, cam, raycaster, explodeCur: 0, radialCur: 0, realModel, realScaled: false, realFailed: false, particles: null }

    // 尺寸
    const resize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      if (propsRef.current.mode === 'joint') {
        const preset = config.id === 'foguangsi' ? CAM_FOGUANG_JOINT : CAM_JOINT
        const fitScale = jointFitScale(config.id, camera.aspect)
        camera.position.copy(preset.pos).sub(preset.tgt).multiplyScalar(fitScale).add(preset.tgt)
        controls.target.copy(preset.tgt)
      } else if (config.id === 'foguangsi') {
        const fitScale = Math.max(1, 1.05 / camera.aspect)
        camera.position.copy(cam.pos).sub(cam.tgt).multiplyScalar(fitScale).add(cam.tgt)
        controls.target.copy(cam.tgt)
      }
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
    const clock = new THREE.Clock()
    let tourTime = 0
    const tourWaypoints = (cam: CamPreset) => {
      const d = cam.pos.distanceTo(cam.tgt)
      const H = cam.baseY
      return [
        { pos: new THREE.Vector3(d * 0.62, H * 0.62 + d * 0.2, d * 0.92), tgt: new THREE.Vector3(0, H, 0) },
        { pos: new THREE.Vector3(-d * 0.75, H * 0.35, d * 0.75), tgt: new THREE.Vector3(0, H * 0.75, 0) },
        { pos: new THREE.Vector3(-d * 0.7, H * 0.5, -d * 0.8), tgt: new THREE.Vector3(0, H * 0.85, 0) },
        { pos: new THREE.Vector3(d * 0.1, H * 1.4, d * 0.35), tgt: new THREE.Vector3(0, H * 0.5, 0) },
        { pos: new THREE.Vector3(d * 0.35, H * 0.5, d * 0.55), tgt: new THREE.Vector3(0, H * 0.55, 0) },
      ]
    }
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const p = propsRef.current
      const st = stateRef.current!
      const delta = Math.min(clock.getDelta(), 0.06)

      if (st.realModel && !st.realScaled) {
        fitToHeight(st.realModel, realTargetHeight)
        if (config.id === 'qingliansi') {
          // 全景寺院需要按建筑群的实际范围取景，而不是按单殿高度放大
          const size = new THREE.Box3().setFromObject(st.realModel).getSize(new THREE.Vector3())
          const d = Math.max(size.x, size.y, size.z)
          st.camera.position.set(d * 0.62, size.y * 0.72, d * 0.92)
          st.controls.target.set(0, size.y * 0.36, 0)
          st.cam.pos.copy(st.camera.position)
          st.cam.tgt.copy(st.controls.target)
          st.cam.baseY = size.y * 0.36
        }
        st.realScaled = true
      }
      // 拆解/散开时必须用结构模型，合拢时才展示写实整楼
      const disassembling = st.explodeCur > 0.03 || st.radialCur > 0.03
      const useReal = p.realistic && st.realModel !== null && !disassembling
      const waitingReal = p.realistic && config.realisticModel !== false && st.realModel === null && !st.realFailed
      if (config.archetype === 'cliff') {
        // 正面保留崖壁；转向背面时自动剖开，避免岩体遮死殿阁
        pagoda.group.visible = p.mode === 'pagoda'
        for (const l of pagoda.layers) {
          // 写实模式只留崖壁；拆解模式显示全部构件，背面统一剖开
          l.obj.visible = useReal
            ? l.id === 'cliff' && st.camera.position.z > -2
            : l.id === 'cliff' ? st.camera.position.z > -2 : !waitingReal
        }
      } else {
        pagoda.group.visible = p.mode === 'pagoda' && !useReal && !waitingReal
      }
      if (st.realModel) st.realModel.visible = p.mode === 'pagoda' && useReal
      joint.group.visible = p.mode === 'joint'
      env.visible = p.mode === 'pagoda'

      // 爆炸动画（缓动）/ 瞬间爆炸（回弹）
      if (burstRef.current.active) {
        burstRef.current.t = Math.min(1, burstRef.current.t + (slowMo ? 0.006 : 0.02))
        const t = burstRef.current.t
        const sBack = 1.70158
        const ease = 1 + (sBack + 1) * Math.pow(t - 1, 3) + sBack * Math.pow(t - 1, 2)
        st.explodeCur = ease
        st.radialCur = ease
        // 粒子仅作开场闪爆，之后进入分层拆解
        if (st.particles) {
          if (t < 0.55) st.particles.setProgress(Math.min(1, t * 1.6))
          else st.particles.points.visible = false
        }
        if (t >= 1) {
          burstRef.current.active = false
          if (st.particles) st.particles.points.visible = false
        }
      } else {
        st.explodeCur += (p.explode - st.explodeCur) * 0.09
        st.radialCur += (p.spread - st.radialCur) * 0.09
      }
      const assembling = config.id === 'foguangsi' && p.mode === 'joint' && assemblyRef.current.time !== null
      if (assembling) {
        const sequence = assemblyRef.current
        const stepDuration = 0.55
        const totalTime = joint.blocks.length * stepDuration
        if (p.assemblyPlaying && !sequence.completed) {
          sequence.time = Math.min(totalTime, sequence.time! + delta * (slowMo ? 0.5 : 1))
        }
        const time = sequence.time!
        const step = Math.min(joint.blocks.length, Math.floor(time / stepDuration))
        if (step !== sequence.lastStep) {
          sequence.lastStep = step
          p.onAssemblyProgress(step)
        }
        if (time >= totalTime && !sequence.completed) {
          sequence.completed = true
          p.onAssemblyComplete()
        }
        for (const b of joint.blocks) {
          const local = time - b.index * stepDuration
          if (local < 0) {
            b.mesh.visible = false
            continue
          }
          b.mesh.visible = true
          const t = Math.min(1, local / stepDuration)
          const ease = 1 - Math.pow(1 - t, 3)
          const remaining = 1 - ease
          b.mesh.position.set(
            (b.baseX ?? 0) + (b.dx ?? 0) * 0.35 * remaining,
            b.baseY + remaining * (1.4 + (b.index % 3) * 0.4),
            (b.baseZ ?? 0) + ((b.dz ?? 0) * 0.35 + 0.6) * remaining,
          )
        }
      }
      const e = assembling ? 0 : st.explodeCur
      const r = assembling ? 0 : st.radialCur
      // 错峰解构：自上而下依次分离，每层错峰升起
      const nL = pagoda.layers.length
      for (const l of pagoda.layers) {
        const delay = ((nL - 1 - l.index) / (nL - 1)) * 0.65 // 顶层先走，底层后到
        const u = Math.max(0, Math.min(1, (e - delay) / 0.35))
        const ease = u * u * (3 - 2 * u)
        l.obj.position.y = l.baseY + ease * l.index * st.cam.spacing
      }
      // 粒子爆炸：点云从模型表面飞散
      if (p.mode === 'pagoda' && burstRef.current.active) {
        if (e > 0.02 && !st.particles) {
          const src = useReal && st.realModel ? st.realModel : pagoda.group
          st.particles = createParticleBurst(src)
          scene.add(st.particles.points)
        }
      } else if (st.particles && !burstRef.current.active) {
        st.particles.points.visible = false
      }
      if (!assembling) {
        for (const b of joint.blocks) {
          b.mesh.visible = true
          b.mesh.position.x = (b.baseX ?? b.mesh.position.x) + (b.dx ?? 0) * r
          b.mesh.position.z = (b.baseZ ?? b.mesh.position.z) + (b.dz ?? 0) * r
          b.mesh.position.y = b.baseY + e * b.index * (config.id === 'foguangsi' ? 0.34 : 0.42)
        }
      }
      if (config.id === 'foguangsi') {
        const forceVisible = p.showForces && p.mode === 'joint'
        if (joint.forceGroup) joint.forceGroup.visible = forceVisible
        if (joint.forceLinks) {
          const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          const flowTime = reducedMotion ? 0 : performance.now() / 1000
          joint.forceLinks.forEach((link, index) => {
            const from = joint.blocks.find((block) => block.id === link.from)
            const to = joint.blocks.find((block) => block.id === link.to)
            if (!from || !to) return
            const visible = forceVisible && from.mesh.visible && to.mesh.visible
            link.arrow.visible = visible
            link.dot.visible = visible
            if (!visible) return
            const start = from.mesh.getWorldPosition(new THREE.Vector3())
            const end = to.mesh.getWorldPosition(new THREE.Vector3())
            const direction = start.clone().sub(end)
            const length = direction.length()
            if (length < 0.001) {
              link.arrow.visible = false
              link.dot.visible = false
              return
            }
            link.arrow.position.copy(end)
            link.arrow.setDirection(direction.normalize())
            link.arrow.setLength(length, Math.min(0.2, length * 0.3), Math.min(0.13, length * 0.25))
            const progress = reducedMotion ? 0.5 : (flowTime * 0.65 + index * 0.17) % 1
            link.dot.position.copy(end).lerp(start, progress)
          })
        }
        joint.group.traverse((object) => {
          if (object.userData.explodeLabel) object.visible = e < 0.08
        })
      }
      for (const rp of pagoda.radialParts) {
        rp.mesh.position.x = rp.baseX + rp.dx * rp.amount * r
        rp.mesh.position.z = rp.baseZ + rp.dz * rp.amount * r
        rp.mesh.position.y = rp.baseY + rp.lift * r
      }
      const labelOp = Math.min(1, Math.max(0, (r - 0.3) * 2))
      for (const m of pagoda.labelMats) m.opacity = labelOp

      // 相机随拆解抬升拉远
      const baseY = p.mode === 'pagoda' ? st.cam.baseY : config.id === 'foguangsi' ? 4.2 : 5
      const liftK = p.mode === 'pagoda' ? st.cam.liftK : config.id === 'foguangsi' ? 6.4 : 2
      const scaleK = p.mode === 'pagoda' ? st.cam.scaleK : config.id === 'foguangsi' ? 0.72 : 0.25
      const want = config.id === 'foguangsi' && p.mode === 'joint' && p.selectedId ? controls.target.y : baseY + e * liftK * 0.5
      controls.target.y += (want - controls.target.y) * 0.06
      const scale = 1 + e * scaleK * 2.2 + r * st.cam.spreadK
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

      // 电影巡游：缓入缓出的环绕镜头
      if (p.tour && p.mode === 'pagoda') {
        tourTime += delta
        const wps = tourWaypoints(st.cam)
        const leg = 6
        const idx = Math.floor(tourTime / leg) % wps.length
        const next = (idx + 1) % wps.length
        const u0 = (tourTime % leg) / leg
        const u = u0 * u0 * (3 - 2 * u0)
        camera.position.lerpVectors(wps[idx].pos, wps[next].pos, u)
        controls.target.lerpVectors(wps[idx].tgt, wps[next].tgt, u)
        controls.autoRotate = false
      } else {
        controls.autoRotate = p.autoRotate
      }
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

  // 瞬间爆炸触发
  useEffect(() => {
    if (burstTs > 0) {
      burstRef.current = { active: true, t: 0 }
    } else {
      burstRef.current.active = false
    }
  }, [burstTs])

  // 安装顺序：新播放从零开始；手动操作时退出安装模式。
  useEffect(() => {
    assemblyRef.current = { time: assemblyTs > 0 ? 0 : null, lastStep: 0, completed: false }
    const st = stateRef.current
    if (st) {
      st.explodeCur = 0
      st.radialCur = 0
      burstRef.current.active = false
    }
  }, [assemblyTs])

  // 模式切换：相机跳位
  useEffect(() => {
    const st = stateRef.current
    if (!st) return
    if (mode === 'joint') {
      // 窄屏横向视野较小，拉远节点相机以保留完整斗拱，而不是裁掉两侧。
      const preset = config.id === 'foguangsi' ? CAM_FOGUANG_JOINT : CAM_JOINT
      const fitScale = jointFitScale(config.id, st.camera.aspect)
      st.camera.position.copy(preset.pos).sub(preset.tgt).multiplyScalar(fitScale).add(preset.tgt)
      st.controls.target.copy(preset.tgt)
    } else {
      const fitScale = config.id === 'foguangsi' ? Math.max(1, 1.05 / st.camera.aspect) : 1
      st.camera.position.copy(st.cam.pos).sub(st.cam.tgt).multiplyScalar(fitScale).add(st.cam.tgt)
      st.controls.target.copy(st.cam.tgt)
    }
    st.controls.update()
  }, [mode])

  // 东大殿：点击单根栱、昂、斗自动聚焦；再次点击后回到整攒。
  useEffect(() => {
    const st = stateRef.current
    if (!st || config.id !== 'foguangsi' || mode !== 'joint') return
    const block = selectedId ? st.joint.blocks.find((item) => item.id === selectedId) : null
    if (block) {
      assemblyRef.current.time = null
      block.mesh.updateWorldMatrix(true, true)
      const bounds = new THREE.Box3().setFromObject(block.mesh)
      const center = bounds.getCenter(new THREE.Vector3())
      const size = bounds.getSize(new THREE.Vector3())
      const distance = Math.max(3.2, Math.max(size.x, size.y, size.z) * 3)
      const direction = new THREE.Vector3(1, 0.45, 1).normalize()
      st.camera.position.copy(center).addScaledVector(direction, distance)
      st.controls.target.copy(center)
    } else {
      const fitScale = jointFitScale(config.id, st.camera.aspect)
      st.camera.position.copy(CAM_FOGUANG_JOINT.pos).sub(CAM_FOGUANG_JOINT.tgt).multiplyScalar(fitScale).add(CAM_FOGUANG_JOINT.tgt)
      st.controls.target.copy(CAM_FOGUANG_JOINT.tgt)
    }
    st.controls.update()
  }, [selectedId, mode])

  return <div ref={hostRef} className="h-full w-full cursor-grab active:cursor-grabbing" />
}
