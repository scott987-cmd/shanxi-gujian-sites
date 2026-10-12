// 程序化纹理库（Canvas 生成，无需外部图片）
import * as THREE from 'three'

function canvasTex(size: number, draw: (ctx: CanvasRenderingContext2D, s: number) => void, repeat = 1): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = cv.height = size
  const ctx = cv.getContext('2d')!
  draw(ctx, size)
  const tex = new THREE.CanvasTexture(cv)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeat, repeat)
  tex.anisotropy = 8
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// 瓦垄纹理（深瓦色 + 竖向垄线 + 横向叠瓦行）
export function tileTexture(): THREE.CanvasTexture {
  return canvasTex(256, (ctx, s) => {
    ctx.fillStyle = '#414c58'
    ctx.fillRect(0, 0, s, s)
    // 横向叠瓦行
    for (let y = 0; y < s; y += 24) {
      ctx.fillStyle = 'rgba(0,0,0,0.28)'
      ctx.fillRect(0, y, s, 3)
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.fillRect(0, y + 3, s, 2)
    }
    // 竖向瓦垄
    for (let x = 0; x < s; x += 16) {
      ctx.fillStyle = 'rgba(255,255,255,0.07)'
      ctx.fillRect(x, 0, 4, s)
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.fillRect(x + 11, 0, 5, s)
    }
    // 噪声
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},0.04)`
      ctx.fillRect(Math.random() * s, Math.random() * s, 2, 2)
    }
  })
}

// 木纹
export function woodTexture(base = '#8a5a35'): THREE.CanvasTexture {
  return canvasTex(256, (ctx, s) => {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * s
      ctx.strokeStyle = `rgba(60,35,15,${0.08 + Math.random() * 0.12})`
      ctx.lineWidth = 1 + Math.random() * 2
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.bezierCurveTo(x + 6, s * 0.3, x - 6, s * 0.6, x + 3, s)
      ctx.stroke()
    }
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`
      ctx.fillRect(Math.random() * s, Math.random() * s, 2, 3)
    }
  })
}

// 抹灰墙面（米白微旧 + 斑驳）
export function plasterTexture(): THREE.CanvasTexture {
  return canvasTex(256, (ctx, s) => {
    ctx.fillStyle = '#d9cbb0'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(${120 + Math.random() * 60},${100 + Math.random() * 50},${70 + Math.random() * 40},${Math.random() * 0.08})`
      ctx.fillRect(Math.random() * s, Math.random() * s, 3, 3)
    }
    // 底部风化
    const grad = ctx.createLinearGradient(0, s * 0.8, 0, s)
    grad.addColorStop(0, 'rgba(90,75,55,0)')
    grad.addColorStop(1, 'rgba(90,75,55,0.25)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, s, s)
  })
}

// 岩石（崖壁）
export function rockTexture(): THREE.CanvasTexture {
  return canvasTex(256, (ctx, s) => {
    ctx.fillStyle = '#55483c'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 1200; i++) {
      const v = 60 + Math.random() * 50
      ctx.fillStyle = `rgba(${v},${v * 0.88},${v * 0.72},${0.1 + Math.random() * 0.2})`
      ctx.fillRect(Math.random() * s, Math.random() * s, 2 + Math.random() * 4, 2 + Math.random() * 3)
    }
    // 岩层理线
    for (let y = 0; y < s; y += 30 + Math.random() * 20) {
      ctx.strokeStyle = 'rgba(30,22,16,0.35)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.bezierCurveTo(s * 0.3, y + 8, s * 0.6, y - 6, s, y + 4)
      ctx.stroke()
    }
  })
}

// 格扇门窗（棂格）
export function latticeTexture(): THREE.CanvasTexture {
  return canvasTex(256, (ctx, s) => {
    ctx.fillStyle = '#3a2a1c'
    ctx.fillRect(0, 0, s, s)
    // 棂格窗心
    ctx.fillStyle = '#1e140d'
    ctx.fillRect(s * 0.12, s * 0.1, s * 0.76, s * 0.62)
    ctx.strokeStyle = '#8a5a35'
    ctx.lineWidth = 4
    for (let i = 0; i <= 4; i++) {
      const x = s * 0.12 + (i * s * 0.76) / 4
      ctx.beginPath()
      ctx.moveTo(x, s * 0.1)
      ctx.lineTo(x, s * 0.72)
      ctx.stroke()
    }
    for (let i = 0; i <= 5; i++) {
      const y = s * 0.1 + (i * s * 0.62) / 5
      ctx.beginPath()
      ctx.moveTo(s * 0.12, y)
      ctx.lineTo(s * 0.88, y)
      ctx.stroke()
    }
    // 绦环板与裙板
    ctx.fillStyle = '#5c3a21'
    ctx.fillRect(s * 0.08, s * 0.74, s * 0.84, s * 0.22)
    ctx.strokeStyle = '#7a4e2d'
    ctx.strokeRect(s * 0.08, s * 0.74, s * 0.84, s * 0.22)
    ctx.strokeRect(s * 0.04, s * 0.04, s * 0.92, s * 0.92)
  })
}

// ---- 单例缓存 ----
let _tile: THREE.CanvasTexture | null = null
export function tileTex(): THREE.CanvasTexture {
  if (!_tile) _tile = tileTexture()
  return _tile
}
let _wood: THREE.CanvasTexture | null = null
export function woodTex(): THREE.CanvasTexture {
  if (!_wood) _wood = woodTexture()
  return _wood
}
let _plaster: THREE.CanvasTexture | null = null
export function plasterTex(): THREE.CanvasTexture {
  if (!_plaster) _plaster = plasterTexture()
  return _plaster
}
let _rock: THREE.CanvasTexture | null = null
export function rockTex(): THREE.CanvasTexture {
  if (!_rock) _rock = rockTexture()
  return _rock
}
// 格扇门窗（按门面尺寸克隆以设重复次数）
export function latticeTex(repX: number, repY: number): THREE.CanvasTexture {
  const t = latticeTexture()
  t.repeat.set(repX, repY)
  return t
}
