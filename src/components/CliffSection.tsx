// 悬空寺剖面示意（侧视：崖壁 + 横梁杠杆 + 平台殿阁）
export default function CliffSection({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  const dimIf = (id: string) => (selected === null || selected === id ? 1 : 0.22)
  const hl = (id: string) => selected === id
  return (
    <svg viewBox="0 0 520 420" className="w-full h-auto select-none" role="img" aria-label="悬空寺结构剖面示意">
      {/* 崖壁 */}
      <g opacity={dimIf('cliff')} onClick={() => onSelect('cliff')} style={{ cursor: 'pointer' }}>
        <path d="M60 380 L60 60 Q140 40 180 90 Q240 30 300 80 L300 380 Z" fill={hl('cliff') ? '#7d7264' : '#6e6557'} opacity={0.9} />
        <text x={120} y={110} fontSize={13} fill="#f2ecdf" className="font-serif-sc">翠屏峰崖壁</text>
      </g>
      {/* 谷底 */}
      <line x1={20} y1={380} x2={500} y2={380} stroke="#8a7f6a" strokeWidth={2} />
      <text x={470} y={400} fontSize={11} textAnchor="end" fill="#8a7f6a" className="font-serif-sc">谷底（曾高近百米）</text>

      {/* 悬臂横梁 */}
      <g opacity={dimIf('beams')} onClick={() => onSelect('beams')} style={{ cursor: 'pointer' }}>
        {[140, 210, 280].map((y, i) => (
          <g key={i}>
            {[0, 1, 2].map((j) => (
              <rect key={j} x={180} y={y + j * 14} width={180} height={9} fill={hl('beams') ? '#a63d2a' : '#66422a'} stroke="#3d2716" strokeWidth={0.8} transform={`rotate(-3.5 180 ${y + j * 14})`} />
            ))}
          </g>
        ))}
        <text x={380} y={180} fontSize={12} fill="#a63d2a" className="font-serif-sc">悬臂横梁 ×27</text>
        <text x={380} y={196} fontSize={10} fill="#8a7f6a" className="font-serif-sc">斜向上插入崖壁 · 楔紧自锁</text>
        {/* 杠杆示意 */}
        <line x1={180} y1={320} x2={360} y2={320} stroke="#c9a227" strokeWidth={1.2} strokeDasharray="5 3" />
        <path d="M250 320 l-8 -6 v12 Z" fill="#c9a227" />
        <text x={250} y={338} fontSize={10} textAnchor="middle" fill="#8a6d1d" className="font-serif-sc">岩体自重压住梁尾 · 杠杆原理</text>
      </g>

      {/* 平台栈道 */}
      <g opacity={dimIf('decks')} onClick={() => onSelect('decks')} style={{ cursor: 'pointer' }}>
        {[128, 198, 268].map((y, i) => (
          <rect key={i} x={300} y={y} width={90 - i * 18} height={7} fill={hl('decks') ? '#a63d2a' : '#8a5a35'} />
        ))}
        <text x={330} y={120} fontSize={12} fill="#7a4e2d" className="font-serif-sc">平台栈道</text>
      </g>

      {/* 凌空殿阁 */}
      <g opacity={dimIf('halls')} onClick={() => onSelect('halls')} style={{ cursor: 'pointer' }}>
        {[128, 198, 268].map((y, i) => (
          <g key={i} transform={`translate(${310} ${y - 46})`}>
            <rect x={0} y={12} width={52} height={34} fill="#e8dfc9" stroke="#7a4e2d" strokeWidth={1.4} />
            <path d={`M -6 12 L26 ${-2} L58 12 Z`} fill="#46525c" />
            <rect x={22} y={26} width={9} height={20} fill="#241c14" />
          </g>
        ))}
        <text x={330} y={62} fontSize={12} fill="#46525c" className="font-serif-sc">凌空殿阁 40 间</text>
      </g>

      {/* 立木 */}
      <g opacity={dimIf('posts')} onClick={() => onSelect('posts')} style={{ cursor: 'pointer' }}>
        {[350, 372].map((x) => (
          <line key={x} x1={x} y1={268} x2={x} y2={378} stroke={hl('posts') ? '#a63d2a' : '#a37a4f'} strokeWidth={4} strokeDasharray="none" />
        ))}
        <text x={395} y={330} fontSize={11} fill="#7a4e2d" className="font-serif-sc">立木（多不受力）</text>
      </g>
    </svg>
  )
}
