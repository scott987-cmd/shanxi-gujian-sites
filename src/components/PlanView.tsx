import { useMemo } from 'react'

const CX = 260
const CY = 250

export interface PlanSelection {
  id: string
  name: string
  title: string
  desc: string
}

export const PLAN_INFO: PlanSelection[] = [
  {
    id: 'veranda',
    name: '副阶（外廊）',
    title: '副阶周匝',
    desc: '最外一圈廊柱围合的环廊。“副阶周匝”是《营造法式》中的高等级做法，供礼佛绕行，也让一层呈现重檐。',
  },
  {
    id: 'outer',
    name: '外槽柱 · 24 根',
    title: '外层套筒',
    desc: '外圈 24 根立柱沿八角形布置，是塔身的外层骨架，承担屋檐与平坐荷载。外槽即内外圈柱之间的环形礼佛通道。',
  },
  {
    id: 'inner',
    name: '内槽柱 · 8 根',
    title: '内层套筒',
    desc: '内圈 8 根主柱围合出八角佛堂。内外两圈柱以梁枋斗拱拉结，构成“双层套筒”，是抗倾覆的核心。',
  },
  {
    id: 'altar',
    name: '佛堂 · 11 米大佛',
    title: '内槽佛堂',
    desc: '内柱环绕的中央空间。一层供奉 11 米高的释迦牟尼坐像，头顶为斗八藻井，四壁存辽代壁画。',
  },
  {
    id: 'stairs',
    name: '楼梯',
    title: '登塔楼梯',
    desc: '楼梯设于外槽一侧，逐层盘折而上。木塔已禁止登临十余年，如今的“登塔”只能在数字世界里完成。',
  },
  {
    id: 'door',
    name: '南门',
    title: '塔门（南）',
    desc: '木塔坐北朝南，正门开在南面，门上檐下悬“万古观瞻”匾。梁思成当年正是从此门走入，抬头望见 11 米大佛。',
  },
]

function octPts(r: number, cx = CX, cy = CY): [number, number][] {
  const pts: [number, number][] = []
  for (let k = 0; k < 8; k++) {
    const a = ((22.5 + 45 * k) * Math.PI) / 180
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  return pts
}
const pts2str = (pts: [number, number][]) => pts.map((p) => p.join(',')).join(' ')

export default function PlanView({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (id: string) => void
}) {
  const R_OUT = 148
  const R_IN = 72
  const R_VER = 188

  const outerCols = useMemo(() => {
    const verts = octPts(R_OUT)
    const cols: [number, number][] = []
    for (let k = 0; k < 8; k++) {
      const [x1, y1] = verts[k]
      const [x2, y2] = verts[(k + 1) % 8]
      cols.push([x1, y1])
      for (const t of [1 / 3, 2 / 3]) cols.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t])
    }
    return cols
  }, [])

  const verCols = useMemo(() => {
    const verts = octPts(R_VER)
    const cols: [number, number][] = []
    for (let k = 0; k < 8; k++) {
      const [x1, y1] = verts[k]
      const [x2, y2] = verts[(k + 1) % 8]
      cols.push([x1, y1])
      cols.push([(x1 + x2) / 2, (y1 + y2) / 2])
    }
    return cols
  }, [])

  const innerCols = useMemo(() => octPts(R_IN), [])

  const hl = (id: string) => (selected === null ? false : selected === id)
  const dimIf = (id: string) => (selected === null || selected === id ? 1 : 0.22)

  // 南面 = 上方（顶点角 22.5+45k，y 向上为负方向，顶点 5→6 之间为南面）
  const southIdx = [5, 6]
  const wallPts = octPts(R_IN * 1.06)

  return (
    <svg viewBox="0 0 520 500" className="w-full h-auto select-none" role="img" aria-label="木塔一层平面柱网图">
      {/* 分区底色 */}
      <polygon points={pts2str(octPts(R_VER + 10))} fill="#efe6d0" />
      <polygon points={pts2str(octPts(R_OUT))} fill={hl('outer') ? 'rgba(166,61,42,0.10)' : '#e7dcc2'} />
      <polygon points={pts2str(octPts(R_IN))} fill={hl('inner') ? 'rgba(70,82,92,0.12)' : '#f0e8d5'} />

      {/* 副阶 */}
      <g style={{ cursor: 'pointer' }} opacity={dimIf('veranda')} onClick={() => onSelect('veranda')}>
        <polygon points={pts2str(octPts(R_VER))} fill="none" stroke="#a37a4f" strokeWidth={2} />
        {verCols.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={4.5} fill={hl('veranda') ? '#a63d2a' : '#a37a4f'} stroke="#5c3a21" strokeWidth={1} />
        ))}
        <text x={CX} y={CY - R_VER - 16} textAnchor="middle" fontSize={12} fill="#8a6a45" className="font-serif-sc">
          副阶（外廊）
        </text>
      </g>

      {/* 内外槽之间的梁枋 */}
      {outerCols
        .filter((_, i) => i % 3 === 0)
        .map(([x, y], i) => {
          const dx = CX - x
          const dy = CY - y
          const len = Math.hypot(dx, dy)
          const ix = x + (dx / len) * (R_OUT - R_IN * 1.06)
          const iy = y + (dy / len) * (R_OUT - R_IN * 1.06)
          return <line key={i} x1={x} y1={y} x2={ix} y2={iy} stroke="#c9a227" strokeWidth={1.2} opacity={0.55} />
        })}

      {/* 外槽柱 */}
      <g style={{ cursor: 'pointer' }} opacity={dimIf('outer')} onClick={() => onSelect('outer')}>
        <polygon points={pts2str(octPts(R_OUT))} fill="none" stroke="#7a4e2d" strokeWidth={3} />
        {outerCols.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={6.5} fill={hl('outer') ? '#a63d2a' : '#7a4e2d'} stroke="#3d2716" strokeWidth={1.2} />
        ))}
        <text x={CX + R_OUT * 0.82} y={CY - R_OUT * 0.55} fontSize={12} fill="#7a4e2d" className="font-serif-sc">
          外槽 24 柱
        </text>
      </g>

      {/* 内槽墙（南面开门） */}
      <g style={{ cursor: 'pointer' }} opacity={dimIf('door')} onClick={() => onSelect('door')}>
        {wallPts.map((p, i) => {
          const q = wallPts[(i + 1) % 8]
          const isSouth = i === southIdx[0]
          if (isSouth) {
            // 南面墙断开作门
            const gx = (p[0] + q[0]) / 2
            const gy = (p[1] + q[1]) / 2
            const dx = q[0] - p[0]
            const dy = q[1] - p[1]
            const L = Math.hypot(dx, dy)
            const ux = dx / L
            const uy = dy / L
            const doorW = L * 0.3
            return (
              <g key={i}>
                <line x1={p[0]} y1={p[1]} x2={gx - ux * doorW * 0.5} y2={gy - uy * doorW * 0.5} stroke="#46525c" strokeWidth={5} />
                <line x1={gx + ux * doorW * 0.5} y1={gy + uy * doorW * 0.5} x2={q[0]} y2={q[1]} stroke="#46525c" strokeWidth={5} />
                {/* 门扇 */}
                <rect x={gx - 3} y={gy - 3} width={6} height={6} fill="#a63d2a" transform={`rotate(45 ${gx} ${gy})`} />
                <text x={gx} y={gy - 16} textAnchor="middle" fontSize={12} fill={hl('door') ? '#a63d2a' : '#5c5142'} className="font-serif-sc">
                  南门
                </text>
              </g>
            )
          }
          return <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="#46525c" strokeWidth={5} />
        })}
      </g>

      {/* 内槽柱 */}
      <g style={{ cursor: 'pointer' }} opacity={dimIf('inner')} onClick={() => onSelect('inner')}>
        {innerCols.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={8} fill={hl('inner') ? '#46525c' : '#5d6b76'} stroke="#2b333a" strokeWidth={1.5} />
        ))}
        <text x={CX + R_IN * 0.95} y={CY + R_IN * 0.75} fontSize={12} fill="#46525c" className="font-serif-sc">
          内槽 8 柱
        </text>
      </g>

      {/* 楼梯（西北外槽） */}
      <g style={{ cursor: 'pointer' }} opacity={dimIf('stairs')} onClick={() => onSelect('stairs')}>
        <g transform={`translate(${CX - 108} ${CY + 62})`}>
          <rect x={-16} y={-12} width={32} height={24} fill={hl('stairs') ? 'rgba(166,61,42,0.15)' : 'rgba(122,78,45,0.10)'} stroke="#7a4e2d" strokeWidth={1.2} />
          {[-8, -2, 4].map((y) => (
            <line key={y} x1={-16} y1={y} x2={16} y2={y} stroke="#7a4e2d" strokeWidth={1.6} />
          ))}
          <text x={0} y={34} textAnchor="middle" fontSize={11} fill={hl('stairs') ? '#a63d2a' : '#7a4e2d'} className="font-serif-sc">
            楼梯
          </text>
        </g>
      </g>

      {/* 佛坛与大佛 */}
      <g style={{ cursor: 'pointer' }} opacity={dimIf('altar')} onClick={() => onSelect('altar')}>
        <polygon points={pts2str(octPts(40))} fill={hl('altar') ? 'rgba(201,162,39,0.25)' : 'rgba(201,162,39,0.12)'} stroke="#c9a227" strokeWidth={1.5} />
        <circle cx={CX} cy={CY} r={26} fill="none" stroke="#c9a227" strokeWidth={1} opacity={0.7} />
        <circle cx={CX} cy={CY} r={18} fill="none" stroke="#c9a227" strokeWidth={0.8} opacity={0.5} />
        {/* 坐佛剪影 */}
        <g transform={`translate(${CX} ${CY})`}>
          <circle cx={0} cy={-9} r={4.2} fill={hl('altar') ? '#a63d2a' : '#b99a5e'} />
          <path d={`M -9 8 Q -7 -4 0 -4 Q 7 -4 9 8 Z`} fill={hl('altar') ? '#a63d2a' : '#b99a5e'} />
          <ellipse cx={0} cy={9.5} rx={11} ry={3.2} fill={hl('altar') ? '#a63d2a' : '#b99a5e'} opacity={0.85} />
        </g>
        <text x={CX} y={CY + 56} textAnchor="middle" fontSize={12} fill={hl('altar') ? '#a63d2a' : '#8a6d1d'} className="font-serif-sc">
          佛坛 · 11 米释迦牟尼坐像
        </text>
      </g>

      {/* 指北与图名 */}
      <text x={CX} y={486} textAnchor="middle" fontSize={13} fill="#5c5142" className="font-serif-sc">
        一层平面 · 双层套筒柱网（南面向上 · 副阶周匝 / 外槽 24 柱 / 内槽 8 柱）
      </text>
    </svg>
  )
}
