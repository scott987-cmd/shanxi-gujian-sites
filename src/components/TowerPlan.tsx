// 多层塔平面示意（八角双筒：琉璃外壁 + 砖砌内筒 + 塔心室）
export default function TowerPlan({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  const CX = 260
  const CY = 240
  const oct = (r: number) => {
    const pts: string[] = []
    for (let k = 0; k < 8; k++) {
      const a = ((22.5 + 45 * k) * Math.PI) / 180
      pts.push(`${CX + r * Math.cos(a)},${CY + r * Math.sin(a)}`)
    }
    return pts.join(' ')
  }
  const dimIf = (id: string) => (selected === null || selected === id ? 1 : 0.22)
  const hl = (id: string) => selected === id
  return (
    <svg viewBox="0 0 520 480" className="w-full h-auto select-none" role="img" aria-label="琉璃塔平面示意">
      <g opacity={dimIf('wall')} onClick={() => onSelect('wall')} style={{ cursor: 'pointer' }}>
        <polygon points={oct(170)} fill={hl('wall') ? 'rgba(58,106,82,0.18)' : 'rgba(58,106,82,0.08)'} stroke="#3a6a52" strokeWidth={6} />
        <text x={CX} y={CY - 178} textAnchor="middle" fontSize={12} fill="#3a6a52" className="font-serif-sc">琉璃外壁</text>
      </g>
      <g opacity={dimIf('core')} onClick={() => onSelect('core')} style={{ cursor: 'pointer' }}>
        <polygon points={oct(105)} fill="none" stroke="#7a4e2d" strokeWidth={4} />
        <text x={CX + 108} y={CY + 80} fontSize={12} fill="#7a4e2d" className="font-serif-sc">砖砌内筒</text>
      </g>
      {/* 绕壁梯道 */}
      <g opacity={dimIf('stairs')} onClick={() => onSelect('stairs')} style={{ cursor: 'pointer' }}>
        <path d={`M ${CX + 120} ${CY + 60} L ${CX + 150} ${CY + 95} L ${CX + 132} ${CY + 110} L ${CX + 105} ${CY + 78} Z`} fill={hl('stairs') ? 'rgba(166,61,42,0.2)' : 'rgba(122,78,45,0.12)'} stroke="#7a4e2d" strokeWidth={1.2} />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={CX + 112 + i * 11} y1={CY + 70 + i * 11} x2={CX + 128 + i * 11} y2={CY + 88 + i * 11} stroke="#7a4e2d" strokeWidth={1.4} />
        ))}
        <text x={CX + 150} y={CY + 140} fontSize={11} fill={hl('stairs') ? '#a63d2a' : '#7a4e2d'} className="font-serif-sc">登塔梯道（绕壁而上）</text>
      </g>
      {/* 塔心室 */}
      <g opacity={dimIf('core-room')} onClick={() => onSelect('core-room')} style={{ cursor: 'pointer' }}>
        <circle cx={CX} cy={CY} r={58} fill={hl('core-room') ? 'rgba(201,162,39,0.25)' : 'rgba(201,162,39,0.10)'} stroke="#c9a227" strokeWidth={1.5} />
        <circle cx={CX} cy={CY} r={10} fill="#c9a227" opacity={0.85} />
        <text x={CX} y={CY + 76} textAnchor="middle" fontSize={12} fill="#8a6d1d" className="font-serif-sc">塔心室</text>
      </g>
      {/* 南门 */}
      <g opacity={dimIf('door')} onClick={() => onSelect('door')} style={{ cursor: 'pointer' }}>
        <rect x={CX - 4} y={CY - 174} width={8} height={8} fill="#a63d2a" transform={`rotate(45 ${CX} ${CY - 170})`} />
        <text x={CX} y={CY - 192} textAnchor="middle" fontSize={11} fill={hl('door') ? '#a63d2a' : '#5c5142'} className="font-serif-sc">塔门（南）</text>
      </g>
      <text x={CX} y={462} textAnchor="middle" fontSize={13} fill="#5c5142" className="font-serif-sc">
        八角形平面 · 双层筒体结构 · 十三层楼阁式琉璃塔
      </text>
    </svg>
  )
}
