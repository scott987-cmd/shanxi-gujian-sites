import { useState } from 'react'
import { SITES } from '../sites'

// 山西省轮廓（示意性简化，经纬度）
const OUTLINE: [number, number][] = [
  [113.8, 40.6], [112.9, 40.55], [112.2, 40.3], [111.4, 40.1], [111.05, 39.55], [110.75, 39.0],
  [110.55, 38.3], [110.6, 37.6], [110.95, 36.9], [110.85, 36.3], [110.5, 35.6], [110.55, 35.0],
  [110.7, 34.65], [111.1, 34.55], [111.6, 34.8], [112.1, 35.1], [112.6, 35.28], [113.1, 35.42],
  [113.55, 35.8], [113.85, 36.15], [114.15, 36.6], [114.0, 37.1], [113.75, 37.7], [114.0, 38.35],
  [113.95, 39.0], [113.8, 39.7], [114.1, 40.2],
]
// 主要城市标注
const CITIES: [string, number, number][] = [
  ['大同', 113.3, 40.18], ['太原', 112.55, 37.82], ['临汾', 111.5, 36.1], ['运城', 111.0, 34.95],
]

const LNG0 = 110.3
const LNG1 = 114.3
const LAT0 = 34.3
const LAT1 = 40.9
const W = 460
const H = 560

function proj(lng: number, lat: number): [number, number] {
  const x = ((lng - LNG0) / (LNG1 - LNG0)) * W
  const y = ((LAT1 - lat) / (LAT1 - LAT0)) * H
  return [x, y]
}

export default function ShanxiMap() {
  const [hover, setHover] = useState<string | null>(null)
  const outline = OUTLINE.map(([lng, lat]) => proj(lng, lat).join(',')).join(' ')

  return (
    <div className="relative rounded-2xl border border-[#4a4032] bg-[#221c15] p-4 md:p-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px] select-none">
        {/* 省界 */}
        <polygon points={outline} fill="rgba(201,162,39,0.06)" stroke="#c9a227" strokeWidth={1.5} opacity={0.9} />
        {/* 黄河（西、南界河示意） */}
        <path
          d={`M ${proj(111.05, 39.55).join(' ')} L ${proj(110.75, 39.0).join(' ')} L ${proj(110.55, 38.3).join(' ')} L ${proj(110.6, 37.6).join(' ')} L ${proj(110.95, 36.9).join(' ')} L ${proj(110.85, 36.3).join(' ')} L ${proj(110.5, 35.6).join(' ')} L ${proj(110.55, 35.0).join(' ')} L ${proj(110.7, 34.65).join(' ')} L ${proj(111.1, 34.55).join(' ')} L ${proj(111.6, 34.8).join(' ')}`}
          fill="none"
          stroke="#4a6a7a"
          strokeWidth={2}
          opacity={0.6}
        />
        <text x={proj(110.45, 36.6)[0]} y={proj(110.45, 36.6)[1]} fontSize={10} fill="#4a6a7a" transform={`rotate(-84 ${proj(110.45, 36.6)[0]} ${proj(110.45, 36.6)[1]})`} className="font-serif-sc">
          黄河
        </text>
        {/* 汾河（示意） */}
        <path
          d={`M ${proj(112.4, 39.2).join(' ')} L ${proj(112.55, 38.3).join(' ')} L ${proj(112.5, 37.7).join(' ')} L ${proj(112.1, 37.1).join(' ')} L ${proj(111.6, 36.4).join(' ')} L ${proj(111.0, 35.5).join(' ')} L ${proj(110.8, 34.9).join(' ')}`}
          fill="none"
          stroke="#4a6a7a"
          strokeWidth={1.4}
          strokeDasharray="6 4"
          opacity={0.45}
        />
        {/* 城市 */}
        {CITIES.map(([name, lng, lat]) => {
          const [x, y] = proj(lng, lat)
          return (
            <text key={name} x={x} y={y} fontSize={11} fill="#6b5f4c" textAnchor="middle" className="font-serif-sc">
              {name}
            </text>
          )
        })}
        {/* 图钉 */}
        {SITES.filter((s) => s.geo).map((s, i) => {
          const [lng, lat, jx, jy] = s.geo!
          const [x, y] = proj(lng + jx, lat + jy)
          const active = hover === s.id
          return (
            <a key={s.id} href={`#/s/${s.id}`}>
              <g
                transform={`translate(${x} ${y})`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover(null)}
              >
                {active && <circle r={16} fill="none" stroke="#c9a227" strokeWidth={1} opacity={0.8} className="animate-ping" style={{ transformOrigin: '0 0' }} />}
                <circle r={active ? 7.5 : 5.5} fill={active ? '#c9a227' : '#a63d2a'} stroke="#1d1812" strokeWidth={1.2} style={{ transition: 'r .2s' }} />
                <text y={3.2} fontSize={7} textAnchor="middle" fill="#f7f1e3" fontWeight={700}>
                  {i + 1}
                </text>
                {active && (
                  <g transform="translate(10 -10)">
                    <rect x={0} y={-14} width={s.name.length * 12 + 34} height={22} rx={4} fill="#1d1812" stroke="#c9a227" strokeWidth={0.8} />
                    <text x={8} y={2} fontSize={11} fill="#eacd7a" className="font-serif-sc">
                      {s.name}
                    </text>
                  </g>
                )}
              </g>
            </a>
          )
        })}
      </svg>
      <div className="mt-3 text-center text-xs text-[#8a7f6a]">晋北雁北到晋南河东 · 点击图钉进入站点</div>
    </div>
  )
}
