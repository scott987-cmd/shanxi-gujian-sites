import { useMemo } from 'react'

const CX = 210
const GAP = 30

interface Layer {
  id: string
  name: string
  desc: string
  w: number
  h: number
  slant?: boolean
  beam?: boolean
  blocks: 'center' | 'ends' | 'endsCenter'
}

const LAYERS: Layer[] = [
  { id: 'ludou', name: '栌斗', desc: '最底层的大斗，坐于柱头，承接整攒斗拱', w: 74, h: 24, blocks: 'center' },
  { id: 'huagong', name: '华栱', desc: '向外出跳的栱，斗拱悬挑的主力', w: 116, h: 16, blocks: 'endsCenter' },
  { id: 'nidao', name: '泥道栱', desc: '与华栱十字相扣的横栱，稳住出跳', w: 150, h: 15, blocks: 'ends' },
  { id: 'ang', name: '下昂', desc: '斜置的杠杆：前端挑檐，后端压重，以巧取胜', w: 172, h: 16, slant: true, blocks: 'ends' },
  { id: 'ling', name: '令栱', desc: '最外一跳的横栱，托住上方的枋', w: 196, h: 14, blocks: 'ends' },
  { id: 'fang', name: '撩檐枋', desc: '斗拱顶端的通长木枋，直接承托屋檐', w: 224, h: 12, beam: true, blocks: 'ends' },
]

export default function DougongSVG({ explode, selected, onSelect, jumps = 5 }: { explode: number; selected: string | null; onSelect: (id: string) => void; jumps?: number }) {
  const LAYERS_ALL = useMemo(() => {
    if (jumps >= 7) {
      const arr = [...LAYERS]
      arr.splice(4, 0, { id: 'ang2', name: '下昂 · 第二跳', desc: '七铺作的第二重斜昂：再出跳一步，把屋檐挑得更远。', w: 188, h: 15, slant: true, blocks: 'ends' as const })
      return arr
    }
    return LAYERS
  }, [jumps])
  const baseH = useMemo(() => LAYERS_ALL.reduce((s, l) => s + l.h, 0), [LAYERS_ALL])
  const extra = explode * GAP * (LAYERS_ALL.length - 1)
  const viewH = 40 + baseH + extra + 30
  const bottomY = viewH - 26

  const positioned = useMemo(() => {
    let cursor = bottomY
    return LAYERS_ALL.map((l, i) => {
      const yBot = cursor
      const yTop = yBot - l.h
      cursor = yTop
      const lift = explode * GAP * i
      return { l, yTop: yTop - lift, yBot: yBot - lift }
    })
  }, [bottomY, explode])

  return (
    <svg viewBox={`0 0 460 ${viewH}`} className="w-full h-auto select-none" role="img" aria-label="斗拱分解示意图">
      {/* 柱头 */}
      <rect x={CX - 16} y={bottomY} width={32} height={26} fill="#7a4e2d" />
      <text x={CX} y={bottomY + 42} textAnchor="middle" fontSize={11} fill="#5c5142" className="font-serif-sc">
        柱头
      </text>

      {positioned.map(({ l, yTop, yBot }) => {
        const x0 = CX - l.w / 2
        const sel = selected === l.id
        const dim = selected && !sel
        const mid = (yTop + yBot) / 2
        return (
          <g
            key={l.id}
            opacity={dim ? 0.25 : 1}
            style={{ cursor: 'pointer', transition: 'opacity .3s' }}
            onClick={() => onSelect(sel ? '' : l.id)}
          >
            {l.slant ? (
              <polygon
                points={`${x0},${yBot - 2} ${CX + l.w / 2 - 18},${yTop + 2} ${CX + l.w / 2},${yTop + 6} ${x0 + 14},${yBot}`}
                fill="#c9a227"
                stroke="#8a6d1d"
                strokeWidth={1}
              />
            ) : (
              <rect
                x={x0}
                y={yTop}
                width={l.w}
                height={l.h}
                rx={l.beam ? 2 : 6}
                fill={l.beam ? '#8a5c36' : '#a37a4f'}
                stroke="#5c3a21"
                strokeWidth={1}
              />
            )}
            {/* 斗（小木块） */}
            {(l.blocks === 'ends' || l.blocks === 'endsCenter') && (
              <>
                <rect x={x0 - 4} y={yTop - 7} width={16} height={9} rx={1.5} fill="#5c3a21" />
                <rect x={CX + l.w / 2 - 12} y={yTop - 7} width={16} height={9} rx={1.5} fill="#5c3a21" />
              </>
            )}
            {(l.blocks === 'center' || l.blocks === 'endsCenter') && (
              <rect x={CX - 9} y={yTop - 7} width={18} height={9} rx={1.5} fill="#5c3a21" />
            )}
            {/* 标签 */}
            {(explode > 0.1 || sel) && (
              <g opacity={Math.min(1, explode * 2 + (sel ? 1 : 0))}>
                <line x1={CX + l.w / 2 + 8} y1={mid} x2={356} y2={mid} stroke="#2b2620" strokeWidth={0.6} opacity={0.35} />
                <circle cx={CX + l.w / 2 + 8} cy={mid} r={1.8} fill="#a63d2a" />
                <text x={360} y={mid + 4} fontSize={12.5} fill="#2b2620" fontWeight={600} className="font-serif-sc">
                  {l.name}
                </text>
              </g>
            )}
            {sel && <rect x={x0 - 8} y={yTop - 10} width={l.w + 16} height={l.h + 14} fill="none" stroke="#a63d2a" strokeWidth={1.6} strokeDasharray="4 3" rx={4} />}
          </g>
        )
      })}
    </svg>
  )
}
