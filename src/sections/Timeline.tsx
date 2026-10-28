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

function EraHall({ progress, active }: { progress: number; active: number }) {
  const build = Math.min(1, progress * 2.2)
  const H = 140
  const reveal = build * H
  return (
    <svg viewBox="0 0 100 150" className="h-[46vh] max-h-[380px] w-auto">
      <defs>
        <clipPath id="buildClipHall">
          <rect x="0" y={H - reveal} width="100" height={reveal} style={{ transition: 'y 0.6s cubic-bezier(0.22,1,0.36,1), height 0.6s cubic-bezier(0.22,1,0.36,1)' }} />
        </clipPath>
      </defs>
      <line x1="8" y1="140" x2="92" y2="140" stroke="#8a7f6a" strokeWidth="1.4" opacity="0.6" />
      <g clipPath="url(#buildClipHall)">
        {/* 台基 */}
        <polygon points="22,140 78,140 74,132 26,132" fill="#9a8f7d" />
        {/* 柱网 */}
        {[30, 38, 46, 54, 62, 70].map((x) => (
          <rect key={x} x={x - 1.4} y={104} width={2.8} height={28} fill="#7a4e2d" />
        ))}
        {/* 斗拱带 */}
        <rect x="26" y="97" width="48" height="6" fill="#a37a4f" />
        {/* 大屋顶 */}
        <polygon points="16,96 84,96 70,78 30,78" fill="#46525c" />
        <rect x="34" y="74" width="32" height="4.5" fill="#2f3841" />
        <circle cx="33" cy="76" r="2.4" fill="#4a6a5a" />
        <circle cx="67" cy="76" r="2.4" fill="#4a6a5a" />
        {active === 6 && (
          <g stroke="#7fb4c9" strokeWidth="0.4" opacity="0.55">
            {[96, 112, 128].map((y) => (
              <line key={y} x1="14" y1={y} x2="86" y2={y} strokeDasharray="3 2" />
            ))}
            {[34, 50, 66].map((x) => (
              <line key={x} x1={x} y1="70" x2={x} y2="140" strokeDasharray="3 2" />
            ))}
          </g>
        )}
        {active === 7 && <polyline points="38,100 45,108 40,116 47,124" fill="none" stroke="#e04c38" strokeWidth="1.4" />}
      </g>
      {active === 5 && (
        <g fill="#8a7f6a">
          <circle cx="30" cy="80" r="5" opacity="0.4" className="animate-ping" style={{ transformOrigin: '30px 80px', animationDuration: '2.2s' }} />
          <circle cx="68" cy="66" r="4" opacity="0.35" className="animate-ping" style={{ transformOrigin: '68px 66px', animationDuration: '1.8s' }} />
        </g>
      )}
      {active === 10 && <circle cx="50" cy="100" r="58" fill="none" stroke="#c9a227" strokeWidth="1" opacity="0.7" strokeDasharray="5 4" className="animate-spin" style={{ transformOrigin: '50px 100px', animationDuration: '24s' }} />}
    </svg>
  )
}


// 年代事件 → 场景图
function sceneOf(title: string, desc: string): string {
  const s = title + desc
  if (/炮|战火|硝烟|军阀/.test(s)) return 'war'
  if (/地震|强震/.test(s)) return 'quake'
  if (/测绘|梁思成|林徽因|营造学社/.test(s)) return 'survey'
  if (/盗|倾斜|拆|裂缝|破坏|夹泥墙|灭法|尽毁|毁弃|盗劫/.test(s)) return 'damage'
  if (/数字|监测|今天|扫描|沉浸|数字重生|AI/.test(s)) return 'digital'
  if (/国保|世界遗产|吉尼斯|纪录|首批|列入|文保/.test(s)) return 'heritage'
  if (/匾|题|御|帝王|永乐|正德|朱棣|朱厚照/.test(s)) return 'plaque'
  return 'construction'
}

export default function Timeline({ config }: { config: BuildingConfig }) {
  const TIMELINE = config.timeline
  const secRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const n = TIMELINE.length

  useEffect(() => {
    let last = 0
    const onScroll = () => {
      const now = performance.now()
      if (now - last < 50) return
      last = now
      {
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
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
          {/* 年代场景图背景 */}
          {(() => {
            const generic = sceneOf(item.title, item.desc)
            const isSignature = config.eraMoment && (item.year + item.title + item.desc).includes(config.eraMoment)
            const isModern = /今天|数字|监测|沉浸|AR|扫描|数字档案|数字重生|保护协调/.test(item.title + item.desc)
            const isStart = /始建|重建|增修|落成|建成|建寺|建殿/.test(item.title)
            const scene = isSignature ? `${config.id}-sig` : isModern ? `${config.id}-modern` : isStart ? `${config.id}-start` : generic
            return <img key={scene} src={`/heroes/eras/${scene}.jpg`} alt="" className="era-scene-img" />
          })()}
          <div className="era-scene-mask" />
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
            {config.archetype === 'hall' || config.archetype === 'cliff' ? (
              <EraHall progress={progress} active={active} />
            ) : (
              <EraPagoda progress={progress} active={active} />
            )}
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
