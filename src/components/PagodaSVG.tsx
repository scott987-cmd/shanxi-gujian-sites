import { useMemo } from 'react'
import { PAGODA_PARTS, type PagodaPart, type PartKind } from '@/data/pagoda'

// 颜色
const C = {
  wood: '#7a4e2d',
  woodDark: '#5c3a21',
  woodLight: '#a37a4f',
  beam: '#8a5c36',
  gold: '#c9a227',
  cinnabar: '#a63d2a',
  tile: '#46525c',
  tileLight: '#5d6b76',
  stone: '#9a8f7d',
  stoneDark: '#7d7264',
  wall: '#e8dfc9',
  ink: '#2b2620',
}

const PX = 8 // 每米像素
const CX = 300 // 中心
const GAP = 15 // 爆炸单层间距
const LABEL_X = 474

export interface PagodaSVGProps {
  explode: number // 0..1
  mode: 'explode' | 'xray'
  activeSystem: string | null
  selectedId: string | null
  onSelect: (id: string) => void
}

interface Geom {
  part: PagodaPart
  yTop: number // 未爆炸时顶部
  hPx: number
  wPx: number
}

function bracketMotif(x: number, y: number, w: number, h: number, key: string) {
  // 一攒斗拱：三层出跳，自下而上逐渐放宽
  const rows = [0.36, 0.62, 1]
  const rh = h / 3
  return (
    <g key={key}>
      {rows.map((r, i) => {
        const rw = w * r
        return (
          <rect
            key={i}
            x={x - rw / 2}
            y={y + i * rh}
            width={rw}
            height={rh - 1}
            rx={1}
            fill={C.gold}
            stroke={C.woodDark}
            strokeWidth={0.5}
          />
        )
      })}
    </g>
  )
}

export default function PagodaSVG({ explode, mode, activeSystem, selectedId, onSelect }: PagodaSVGProps) {
  const geoms: Geom[] = useMemo(() => {
    const arr: Geom[] = []
    let cum = 0
    for (const p of PAGODA_PARTS) {
      const hPx = p.h * PX
      arr.push({ part: p, yTop: 0, hPx, wPx: p.w * PX * 0.9 })
      cum += hPx
    }
    // yTop 稍后统一计算（需要总高）
    return arr.map((g) => ({ ...g, _cum: cum }))
  }, [])

  const totalPx = useMemo(() => PAGODA_PARTS.reduce((s, p) => s + p.h * PX, 0), [])
  const extra = explode * GAP * (PAGODA_PARTS.length - 1)
  const viewH = 46 + totalPx + extra + 26
  const bottomY = viewH - 26

  // 计算每个构件的位置（含爆炸偏移）
  const positioned = useMemo(() => {
    let cursor = bottomY
    return geoms.map((g, i) => {
      const yBot = cursor
      const yTop = cursor - g.hPx
      cursor = yTop
      const lift = explode * GAP * i
      return { ...g, yTop: yTop - lift, yBot: yBot - lift }
    })
  }, [geoms, bottomY, explode])

  const sysOn = (id: string) => (mode === 'xray' ? activeSystem === null || activeSystem === id : false)

  const drawPart = (g: (typeof positioned)[number]) => {
    const p = g.part
    const w = g.wPx
    const x0 = CX - w / 2
    const kind: PartKind = p.kind
    const sel = selectedId === p.id
    const dim = selectedId && !sel
    const y = g.yTop

    let body: React.ReactNode = null
    let xray: React.ReactNode = null

    if (kind === 'foundation') {
      const wLow = w * 1.08
      const hUp = g.hPx * 0.52
      body = (
        <>
          <polygon
            points={`${CX - wLow / 2 + 8},${y + hUp} ${CX + wLow / 2 - 8},${y + hUp} ${CX + wLow / 2},${g.yBot} ${CX - wLow / 2},${g.yBot}`}
            fill={C.stoneDark}
          />
          <polygon
            points={`${CX - w / 2 + 6},${y} ${CX + w / 2 - 6},${y} ${CX + w / 2},${y + hUp} ${CX - w / 2},${y + hUp}`}
            fill={C.stone}
          />
          <line x1={x0 + 6} y1={y + 3} x2={CX + w / 2 - 6} y2={y + 3} stroke={C.stoneDark} strokeWidth={1} />
        </>
      )
    }

    if (kind === 'columns' || kind === 'veranda') {
      const isVeranda = kind === 'veranda'
      const nCol = isVeranda ? 9 : 7
      const colW = isVeranda ? 4 : 5.5
      const beamH = 5
      // 墙体与门窗
      body = (
        <>
          <rect x={x0} y={y} width={w} height={g.hPx} fill={C.wall} opacity={isVeranda ? 0.25 : 0.55} />
          {/* 阑额 */}
          <rect x={x0 - 2} y={y} width={w + 4} height={beamH} fill={C.beam} />
          {/* 柱 */}
          {Array.from({ length: nCol }).map((_, i) => {
            const cxp = x0 + (w / (nCol - 1)) * i
            return <rect key={i} x={cxp - colW / 2} y={y} width={colW} height={g.hPx} fill={C.wood} />
          })}
          {/* 一层中央开门 */}
          {p.id === 's1-cols' && (
            <path
              d={`M ${CX - 14} ${g.yBot} L ${CX - 14} ${g.yBot - 26} Q ${CX} ${g.yBot - 38} ${CX + 14} ${g.yBot - 26} L ${CX + 14} ${g.yBot} Z`}
              fill={C.ink}
              opacity={0.75}
            />
          )}
          {/* 副阶无墙 */}
          {isVeranda && <rect x={x0} y={y} width={w} height={g.hPx} fill="none" />}
        </>
      )
      // 透视：外槽柱（两侧边柱）高亮
      if (sysOn('outer')) {
        xray = (
          <>
            <rect x={x0 - 2.75} y={y - 1} width={5.5} height={g.hPx + 2} fill="none" stroke={C.cinnabar} strokeWidth={2} />
            <rect x={x0 + w - 2.75} y={y - 1} width={5.5} height={g.hPx + 2} fill="none" stroke={C.cinnabar} strokeWidth={2} />
          </>
        )
      }
      if (sysOn('inner') && !isVeranda) {
        const ih = 30
        xray = (
          <>
            <line x1={CX - ih} y1={y} x2={CX - ih} y2={g.yBot} stroke={C.tile} strokeWidth={3} strokeDasharray="6 3" />
            <line x1={CX + ih} y1={y} x2={CX + ih} y2={g.yBot} stroke={C.tile} strokeWidth={3} strokeDasharray="6 3" />
          </>
        )
      }
    }

    if (kind === 'brackets') {
      const bw = w
      const n = Math.max(4, Math.round(bw / 24))
      const motifW = 16
      body = (
        <>
          <rect x={x0} y={y} width={bw} height={2.5} fill={C.beam} />
          <rect x={x0} y={g.yBot - 2.5} width={bw} height={2.5} fill={C.beam} />
          {Array.from({ length: n }).map((_, i) => {
            const cxp = x0 + (bw / (n - 1)) * i
            return bracketMotif(cxp, y + 3, motifW, g.hPx - 6, `${p.id}-${i}`)
          })}
        </>
      )
      if (sysOn('dougong')) {
        xray = <rect x={x0 - 2} y={y - 2} width={bw + 4} height={g.hPx + 4} fill="none" stroke={C.gold} strokeWidth={2.5} rx={2} />
      }
    }

    if (kind === 'eave') {
      const hw = w / 2
      const isSpire = p.id === 's5-eave'
      if (isSpire) {
        // 八角攒尖顶：收向塔心
        const apexY = y
        body = (
          <>
            <path
              d={`M ${CX - hw} ${g.yBot - 7} Q ${CX - hw * 0.92} ${g.yBot - 14} ${CX - hw * 0.62} ${y + (g.hPx * 2) / 3} L ${CX} ${apexY} L ${CX + hw * 0.62} ${y + (g.hPx * 2) / 3} Q ${CX + hw * 0.92} ${g.yBot - 14} ${CX + hw} ${g.yBot - 7} L ${CX + hw - 4} ${g.yBot} L ${CX - hw + 4} ${g.yBot} Z`}
              fill={C.tile}
            />
            <path d={`M ${CX - hw * 0.7} ${g.yBot - 12} L ${CX} ${apexY + 3}`} stroke={C.tileLight} strokeWidth={1} fill="none" />
            <path d={`M ${CX + hw * 0.7} ${g.yBot - 12} L ${CX} ${apexY + 3}`} stroke={C.tileLight} strokeWidth={1} fill="none" />
          </>
        )
      } else {
        const topHw = hw * 0.74
        body = (
          <>
            <path
              d={`M ${CX - hw} ${g.yBot - 8} Q ${CX - hw * 0.95} ${g.yBot - 13} ${CX - topHw} ${y + 2} L ${CX + topHw} ${y + 2} Q ${CX + hw * 0.95} ${g.yBot - 13} ${CX + hw} ${g.yBot - 8} L ${CX + hw - 5} ${g.yBot} L ${CX - hw + 5} ${g.yBot} Z`}
              fill={C.tile}
            />
            {/* 瓦垄 */}
            {[0.35, 0.55, 0.75].map((t) => (
              <path
                key={t}
                d={`M ${CX - topHw - (hw - topHw) * (1 - t) * 0.6} ${y + g.hPx * (1 - t) * 0.75} L ${CX + topHw + (hw - topHw) * (1 - t) * 0.6} ${y + g.hPx * (1 - t) * 0.75}`}
                stroke={C.tileLight}
                strokeWidth={0.8}
                opacity={0.6}
              />
            ))}
          </>
        )
      }
    }

    if (kind === 'mezzanine') {
      const n = 6
      const posts: number[] = Array.from({ length: n + 1 }).map((_, i) => x0 + (w / n) * i)
      const diagColor = sysOn('diag') ? C.gold : C.woodLight
      body = (
        <>
          <rect x={x0} y={y} width={w} height={g.hPx} fill={C.wall} opacity={0.35} />
          <rect x={x0} y={y} width={w} height={3} fill={C.beam} />
          <rect x={x0} y={g.yBot - 3} width={w} height={3} fill={C.beam} />
          {posts.map((px, i) => (
            <line key={`p${i}`} x1={px} y1={y} x2={px} y2={g.yBot} stroke={C.wood} strokeWidth={2.5} />
          ))}
          {posts.slice(0, -1).map((px, i) => (
            <g key={`d${i}`}>
              <line x1={px} y1={g.yBot - 1.5} x2={posts[i + 1]} y2={y + 1.5} stroke={diagColor} strokeWidth={sysOn('diag') ? 2.4 : 1.4} />
              <line x1={px} y1={y + 1.5} x2={posts[i + 1]} y2={g.yBot - 1.5} stroke={diagColor} strokeWidth={sysOn('diag') ? 2.4 : 1.4} />
            </g>
          ))}
          {/* 平坐栏杆 */}
          <rect x={x0 - 5} y={y - 4} width={w + 10} height={4} fill={C.woodLight} rx={1} />
        </>
      )
    }

    if (kind === 'finial') {
      const baseW = 30
      const rings = 7
      const ringZoneH = g.hPx * 0.62
      const ringY0 = y + 14
      body = (
        <>
          {/* 覆钵 */}
          <path d={`M ${CX - baseW / 2} ${g.yBot} A ${baseW / 2} ${baseW / 2} 0 0 1 ${CX + baseW / 2} ${g.yBot} Z`} fill="#8c6b3f" />
          {/* 刹杆 */}
          <line x1={CX} y1={g.yBot} x2={CX} y2={y + 4} stroke="#6b5335" strokeWidth={3} />
          {/* 相轮 */}
          {Array.from({ length: rings }).map((_, i) => {
            const ry = ringY0 + (ringZoneH / rings) * i
            const rw = 20 - i * 2.2
            return <ellipse key={i} cx={CX} cy={ry} rx={rw} ry={2.2} fill="none" stroke="#8c6b3f" strokeWidth={1.6} />
          })}
          {/* 宝珠 */}
          <circle cx={CX} cy={y + 5} r={4} fill={C.cinnabar} />
        </>
      )
    }

    // 标签引线
    const showLabel = mode === 'explode' && explode > 0.18
    const midY = (g.yTop + g.yBot) / 2
    const label =
      showLabel && p.kind !== 'foundation' ? (
        <g opacity={Math.min(1, (explode - 0.18) * 3)}>
          <line x1={CX + w / 2 + 6} y1={midY} x2={LABEL_X - 4} y2={midY} stroke={C.ink} strokeWidth={0.6} opacity={0.4} />
          <circle cx={CX + w / 2 + 6} cy={midY} r={2} fill={C.cinnabar} />
          <text x={LABEL_X} y={midY + 4} fontSize={12} fill={C.ink} className="font-serif-sc" fontWeight={600}>
            {p.shortLabel}
          </text>
        </g>
      ) : null

    return (
      <g
        key={p.id}
        className={`pg-part ${dim ? 'pg-dim' : ''}`}
        onClick={() => onSelect(sel ? '' : p.id)}
        style={{ cursor: 'pointer' }}
      >
        {/* 点击热区 */}
        <rect className="part-hit" x={x0 - 14} y={y - 4} width={w + 28} height={g.hPx + 8} fill={C.cinnabar} opacity={0} />
        {sel && <rect x={x0 - 10} y={y - 3} width={w + 20} height={g.hPx + 6} fill="none" stroke={C.cinnabar} strokeWidth={1.8} strokeDasharray="5 3" rx={3} />}
        {body}
        {xray}
        {label}
      </g>
    )
  }

  return (
    <svg
      viewBox={`0 0 620 ${viewH}`}
      className="w-full h-auto select-none"
      role="img"
      aria-label="应县木塔立面结构拆解图"
    >
      {/* 地面 */}
      <line x1={40} y1={bottomY + 0.5} x2={580} y2={bottomY + 0.5} stroke={C.ink} strokeWidth={2} opacity={0.5} />
      <line x1={60} y1={bottomY + 6} x2={560} y2={bottomY + 6} stroke={C.ink} strokeWidth={0.8} opacity={0.25} />

      {positioned.map(drawPart)}

      {/* 高度标注 */}
      {mode === 'explode' && explode < 0.25 && (
        <g opacity={0.7}>
          <line x1={70} y1={bottomY} x2={70} y2={bottomY - totalPx} stroke={C.ink} strokeWidth={1} />
          <line x1={64} y1={bottomY} x2={76} y2={bottomY} stroke={C.ink} strokeWidth={1} />
          <line x1={64} y1={bottomY - totalPx} x2={76} y2={bottomY - totalPx} stroke={C.ink} strokeWidth={1} />
          <text x={56} y={bottomY - totalPx / 2} fontSize={13} fill={C.ink} textAnchor="middle" transform={`rotate(-90 56 ${bottomY - totalPx / 2})`} className="font-serif-sc">
            67.31 米
          </text>
        </g>
      )}
    </svg>
  )
}
