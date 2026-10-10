import type { HallParams } from '@/sites/types'

// 殿堂矩形平面柱网（面阔 × 进深）
export default function HallPlan({
  params,
  selected,
  onSelect,
}: {
  params: HallParams
  selected: string | null
  onSelect: (id: string) => void
}) {
  const W = 400
  const H = 420
  const cx = W / 2
  const cy = H / 2 + 10
  const scale = Math.min(360 / (params.bays * params.bayW), 300 / (params.depthBays * params.bayD))
  const w = params.bays * params.bayW * scale
  const d = params.depthBays * params.bayD * scale
  const x0 = cx - w / 2
  const y0 = cy - d / 2 // 上 = 后檐，下 = 前檐（南）

  const dimIf = (id: string) => (selected === null || selected === id ? 1 : 0.22)
  const hl = (id: string) => selected === id

  // 檐柱位
  const perim: [number, number][] = []
  for (let i = 0; i <= params.bays; i++) {
    const x = x0 + (i * w) / params.bays
    perim.push([x, y0 + d], [x, y0])
  }
  for (let j = 1; j < params.depthBays; j++) {
    const z = y0 + (j * d) / params.depthBays
    perim.push([x0, z], [x0 + w, z])
  }
  // 金柱位
  const inner: [number, number][] = []
  for (let r = 0; r < params.innerColRows; r++) {
    const z = y0 + ((r + 1) / (params.innerColRows + 1)) * d
    for (let i = 1; i < params.bays; i += 2) {
      inner.push([x0 + (i * w) / params.bays, z])
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img" aria-label="大殿平面柱网图">
      {/* 台基轮廓 */}
      <rect x={x0 - 26} y={y0 - 26} width={w + 52} height={d + 52} fill="#efe6d0" stroke="#9a8f7d" strokeWidth={1.5} />
      {/* 墙体（前檐留门） */}
      <g opacity={dimIf('door')} onClick={() => onSelect('door')} style={{ cursor: 'pointer' }}>
        <line x1={x0} y1={y0} x2={x0 + w} y2={y0} stroke="#46525c" strokeWidth={5} />
        <line x1={x0} y1={y0} x2={x0} y2={y0 + d} stroke="#46525c" strokeWidth={5} />
        <line x1={x0 + w} y1={y0} x2={x0 + w} y2={y0 + d} stroke="#46525c" strokeWidth={5} />
        <line x1={x0} y1={y0 + d} x2={cx - 22} y2={y0 + d} stroke="#46525c" strokeWidth={5} />
        <line x1={cx + 22} y1={y0 + d} x2={x0 + w} y2={y0 + d} stroke="#46525c" strokeWidth={5} />
        <rect x={cx - 3} y={y0 + d - 3} width={6} height={6} fill="#a63d2a" transform={`rotate(45 ${cx} ${y0 + d})`} />
        <text x={cx} y={y0 + d + 20} textAnchor="middle" fontSize={12} fill={hl('door') ? '#a63d2a' : '#5c5142'} className="font-serif-sc">
          殿门（南）
        </text>
      </g>
      {/* 梁枋连线 */}
      {inner.map(([x], i) => (
        <line key={i} x1={x} y1={y0} x2={x} y2={y0 + d} stroke="#c9a227" strokeWidth={0.8} opacity={0.35} />
      ))}
      {/* 檐柱 */}
      <g opacity={dimIf('eaveCols')} onClick={() => onSelect('eaveCols')} style={{ cursor: 'pointer' }}>
        {perim.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={6.5} fill={hl('eaveCols') ? '#a63d2a' : '#7a4e2d'} stroke="#3d2716" strokeWidth={1.2} />
        ))}
        <text x={x0 + w + 8} y={y0 + d * 0.5} fontSize={12} fill="#7a4e2d" className="font-serif-sc">
          檐柱
        </text>
      </g>
      {/* 金柱 */}
      <g opacity={dimIf('innerCols')} onClick={() => onSelect('innerCols')} style={{ cursor: 'pointer' }}>
        {inner.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={7.5} fill={hl('innerCols') ? '#46525c' : '#5d6b76'} stroke="#2b333a" strokeWidth={1.2} />
        ))}
        <text x={x0 + 10} y={y0 + d * 0.35} fontSize={12} fill="#46525c" className="font-serif-sc">
          金柱（内槽）
        </text>
      </g>
      {/* 佛坛 */}
      <g opacity={dimIf('altar')} onClick={() => onSelect('altar')} style={{ cursor: 'pointer' }}>
        <rect x={x0 + w * 0.14} y={y0 + d * 0.1} width={w * 0.72} height={d * 0.3} rx={4} fill={hl('altar') ? 'rgba(201,162,39,0.28)' : 'rgba(201,162,39,0.12)'} stroke="#c9a227" strokeWidth={1.5} />
        <g transform={`translate(${cx} ${y0 + d * 0.25})`}>
          <circle cx={0} cy={-9} r={4.2} fill={hl('altar') ? '#a63d2a' : '#b99a5e'} />
          <path d="M -9 8 Q -7 -4 0 -4 Q 7 -4 9 8 Z" fill={hl('altar') ? '#a63d2a' : '#b99a5e'} />
          <ellipse cx={0} cy={9.5} rx={11} ry={3.2} fill={hl('altar') ? '#a63d2a' : '#b99a5e'} opacity={0.85} />
        </g>
        <text x={cx} y={y0 + d * 0.25 + 26} textAnchor="middle" fontSize={12} fill={hl('altar') ? '#a63d2a' : '#8a6d1d'} className="font-serif-sc">
          佛坛
        </text>
      </g>
      <text x={cx} y={H - 14} textAnchor="middle" fontSize={13} fill="#5c5142" className="font-serif-sc">
        面阔 {params.bays} 间 × 进深 {params.depthBays} 间 · 南面为前
      </text>
    </svg>
  )
}
