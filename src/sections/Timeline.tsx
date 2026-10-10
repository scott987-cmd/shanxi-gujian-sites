import { useEffect, useRef, useState } from 'react'
import type { BuildingConfig } from '@/sites/types'

// 每个时代的氛围底色（黄昏 → 战火 → 现代）
const ERA_BG = [
  '#2a2118', // 1056 辽
  '#2d2317', // 1195 金
  '#3a2410', // 1305 地震
  '#2e2519', // 1406 明
  '#2e2519', // 1517 明
  '#441d16', // 1926 战火
  '#223038', // 1933 测绘
  '#3d1d1d', // 1934 破坏
  '#253327', // 1961 新生
  '#2f2a1d', // 1974 大修
  '#3a2c0e', // 2016 吉尼斯
  '#1f2733', // 今天
]

function hexLerp(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')
}

// 随建造进度生长的木塔剪影
function EraPagoda({ progress, active }: { progress: number; active: number }) {
  const build = Math.min(1, progress * 2.2) // 前两个节点内建成
  const H = 140
  const reveal = build * H
  return (
    <svg viewBox="0 0 100 150" className="h-[46vh] max-h-[380px] w-auto">
      <defs>
        <clipPath id="buildClip">
          <rect x="0" y={H - reveal} width="100" height={reveal} style={{ transition: 'y 0.6s cubic-bezier(0.22,1,0.36,1), height 0.6s cubic-bezier(0.22,1,0.36,1)' }} />
        </clipPath>
      </defs>
      {/* 地面 */}
      <line x1="8" y1="140" x2="92" y2="140" stroke="#8a7f6a" strokeWidth="1.4" opacity="0.6" />
      <g clipPath="url(#buildClip)">
        {/* 台基 */}
        <polygon points="25,140 75,140 71,131 29,131" fill="#9a8f7d" />
        {/* 五层塔身 */}
        {[0, 1, 2, 3, 4].map((i) => {
          const yBot = 131 - i * 22
          const wBot = 46 - i * 6.5
          const wTop = 46 - (i + 1) * 6.5
          return (
            <g key={i}>
              <rect x={50 - wTop / 2} y={yBot - 13} width={wTop} height={13} fill="#7a4e2d" />
              <polygon
                points={`${50 - wBot / 2},${yBot - 11} ${50 + wBot / 2},${yBot - 11} ${50 + wTop / 2 + 2},${yBot - 20} ${50 - wTop / 2 - 2},${yBot - 20}`}
                fill="#46525c"
              />
            </g>
          )
        })}
        {/* 塔刹 */}
        <line x1="50" y1="21" x2="50" y2="8" stroke="#9c7a45" strokeWidth="2" />
        <circle cx="50" cy="7" r="2.2" fill="#a63d2a" />
        {/* 1933 测绘网格 */}
        {active === 6 && (
          <g stroke="#7fb4c9" strokeWidth="0.4" opacity="0.55">
            {[30, 52, 74, 96, 118].map((y) => (
              <line key={y} x1="14" y1={y} x2="86" y2={y} strokeDasharray="3 2" />
            ))}
            {[26, 50, 74].map((x) => (
              <line key={x} x1={x} y1="10" x2={x} y2="140" strokeDasharray="3 2" />
            ))}
          </g>
        )}
        {/* 1934 裂缝 */}
        {active === 7 && (
          <polyline points="38,80 45,88 40,96 47,104 43,112" fill="none" stroke="#e04c38" strokeWidth="1.4" />
        )}
        {/* 倾斜警示 */}
        {active === 11 && (
          <g>
            <line x1="30" y1="96" x2="70" y2="96" stroke="#e04c38" strokeWidth="0.8" strokeDasharray="4 2" />
            <text x="50" y="91" textAnchor="middle" fontSize="7" fill="#e04c38">
              二层倾斜 · 监测中
            </text>
          </g>
        )}
      </g>
      {/* 1926 炮火硝烟 */}
      {active === 5 && (
        <g fill="#8a7f6a">
          <circle cx="30" cy="70" r="5" opacity="0.4" className="animate-ping" style={{ transformOrigin: '30px 70px', animationDuration: '2.2s' }} />
          <circle cx="68" cy="52" r="4" opacity="0.35" className="animate-ping" style={{ transformOrigin: '68px 52px', animationDuration: '1.8s' }} />
          <circle cx="58" cy="95" r="4.5" opacity="0.3" className="animate-ping" style={{ transformOrigin: '58px 95px', animationDuration: '2.6s' }} />
        </g>
      )}
      {/* 吉尼斯光环 */}
      {active === 10 && <circle cx="50" cy="75" r="62" fill="none" stroke="#c9a227" strokeWidth="1" opacity="0.7" strokeDasharray="5 4" className="animate-spin" style={{ transformOrigin: '50px 75px', animationDuration: '24s' }} />}
    </svg>
  )
}

export default function Timeline({ config }: { config: BuildingConfig }) {
  const TIMELINE = config.timeline
  const secRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const n = TIMELINE.length

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = secRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const total = r.height - window.innerHeight
        setProgress(Math.min(1, Math.max(0, -r.top / Math.max(total, 1))))
        let best = 0
        let bd = Infinity
        cardRefs.current.forEach((c, i) => {
          if (!c) return
          const cr = c.getBoundingClientRect()
          const d = Math.abs(cr.top + cr.height / 2 - window.innerHeight / 2)
          if (d < bd) {
            bd = d
            best = i
          }
        })
        setActive(best)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const f = progress * (n - 1)
  const i0 = Math.min(Math.floor(f), n - 2)
  const bg = hexLerp(ERA_BG[i0], ERA_BG[i0 + 1], f - i0)

  const item = TIMELINE[active]
  const yearNum = parseInt(item.year)
  const yearsAgo = Number.isNaN(yearNum) ? null : 2026 - yearNum

  return (
    <section id="history" className="relative" style={{ background: bg, transition: 'background 0.35s linear' }}>
      {/* 篇头 */}
      <div className="mx-auto max-w-6xl px-6 pt-24 text-[#efe7d6]">
        <div className="flex items-end gap-5">
          <span className="seal h-12 w-12 text-xl font-bold">史</span>
          <div>
            <h2 className="font-serif-sc text-4xl font-bold md:text-5xl">时空长廊</h2>
            <p className="mt-2 text-sm tracking-[0.3em] text-[#a89c80]">向下滚动，亲历木塔的九百七十年</p>
          </div>
        </div>
      </div>

      <div ref={secRef} className="relative mx-auto max-w-6xl md:grid md:grid-cols-[1fr_1.1fr]">
        {/* 左侧：粘性剧场 */}
        <div className="sticky top-0 z-10 flex h-[30vh] items-center justify-center gap-6 overflow-hidden px-6 md:h-screen md:flex-col md:gap-8">
          {/* 流云 */}
          <svg className="pointer-events-none absolute left-0 top-[18%] hidden w-40 opacity-15 md:block" style={{ transform: `translateX(${progress * 60}px)` }} viewBox="0 0 100 30">
            <path d="M5 22 Q20 8 35 18 Q45 4 60 14 Q75 6 85 18 Q95 16 97 22 Z" fill="#d8cdb4" />
          </svg>
          <svg className="pointer-events-none absolute right-4 top-[62%] hidden w-32 opacity-10 md:block" style={{ transform: `translateX(${-progress * 80}px)` }} viewBox="0 0 100 30">
            <path d="M5 22 Q20 8 35 18 Q45 4 60 14 Q75 6 85 18 Q95 16 97 22 Z" fill="#d8cdb4" />
          </svg>

          <div className="text-center md:order-1">
            <div key={item.year} className="year-pop font-serif-sc text-6xl font-black text-[#c9a227] md:text-8xl">
              {item.year}
            </div>
            <div key={item.era} className="year-pop mt-2 text-sm tracking-[0.4em] text-[#d8cdb4] md:text-base">
              {item.era}
            </div>
            {yearsAgo !== null && <div className="mt-1 text-xs text-[#8a7f6a]">距今约 {yearsAgo} 年</div>}
          </div>

          <div className="hidden md:order-2 md:block">
            <EraPagoda progress={progress} active={active} />
          </div>

          {/* 进度轨 */}
          <div className="absolute right-3 top-1/2 hidden h-[40vh] w-0.5 -translate-y-1/2 bg-[#4a4032] md:block">
            <div className="w-full bg-[#c9a227] transition-none" style={{ height: `${progress * 100}%` }} />
          </div>
        </div>

        {/* 右侧：时代卡片 */}
        <div className="relative px-6 pb-[16vh] pt-[8vh]">
          {TIMELINE.map((t, idx) => {
            const isActive = idx === active
            return (
              <div key={t.year + t.title} className="flex min-h-[52vh] items-center md:min-h-[62vh]">
                <div
                  ref={(el) => {
                    cardRefs.current[idx] = el
                  }}
                  className={`w-full rounded-2xl border p-6 transition-all duration-500 md:p-8 ${
                    isActive
                      ? 'scale-100 border-[#c9a227]/70 bg-[#faf6ec]/[0.07] opacity-100 shadow-[0_8px_40px_rgba(0,0,0,0.35)]'
                      : 'scale-[0.96] border-[#4a4032]/60 bg-transparent opacity-35'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`seal h-11 w-11 shrink-0 text-lg font-bold transition ${isActive ? '' : 'opacity-50'}`}>
                      {t.title.slice(0, 1)}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <span className="font-serif-sc text-2xl font-bold text-[#c9a227]">{t.year}</span>
                        <span className="text-xs tracking-widest text-[#8a7f6a]">{t.era}</span>
                      </div>
                      <h3 className="font-serif-sc mt-0.5 text-xl font-bold text-[#efe7d6] md:text-2xl">{t.title}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-loose text-[#cfc4a8] md:text-[15px]">{t.desc}</p>
                  <div className="mt-4 text-[10px] tracking-[0.5em] text-[#6b5f4c]">
                    {String(idx + 1).padStart(2, '0')} / {n}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
