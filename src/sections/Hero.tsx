import { useEffect, useState } from 'react'
import type { BuildingConfig } from '@/sites/types'
import PagodaSVG from '@/components/PagodaSVG'

function HallSilhouette({ doubleEave }: { doubleEave: boolean }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full">
      <g fill="#c9a227" opacity={0.85}>
        <path d="M30 108 Q60 92 200 84 Q340 92 370 108 L352 124 L48 124 Z" />
        <rect x="140" y="76" width="120" height="8" rx={2} />
        {doubleEave && <path d="M58 158 Q90 146 200 140 Q310 146 342 158 L330 172 L70 172 Z" />}
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={58 + i * 40.5} y={doubleEave ? 176 : 128} width={7} height={doubleEave ? 74 : 122} />
        ))}
        <path d="M40 252 L360 252 L372 272 L28 272 Z" />
      </g>
    </svg>
  )
}

export default function Hero({ config }: { config: BuildingConfig }) {
  const [imgOk, setImgOk] = useState(true)
  useEffect(() => {
    const im = new Image()
    im.onload = () => setImgOk(true)
    im.onerror = () => setImgOk(false)
    im.src = `/heroes/${config.id}.jpg`
  }, [config.id])

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden text-[#efe7d6]">
      {/* 全幅主视觉（AI 艺术图） */}
      {imgOk ? (
        <>
          <img src={`/heroes/${config.id}.jpg`} alt={config.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#14100c]/95 via-[#14100c]/55 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#14100c]/95 to-transparent" />
        </>
      ) : (
        <div className="night-texture absolute inset-0">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] items-center justify-center opacity-45 md:flex">
            <div className="w-full max-w-[520px]">
              {config.archetype === 'pagoda' || config.archetype === 'tower' ? (
                <PagodaSVG explode={0} mode="explode" activeSystem={null} selectedId={null} onSelect={() => {}} />
              ) : (
                <HallSilhouette doubleEave={config.hall?.doubleEave ?? false} />
              )}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1d1812] via-[#1d1812]/70 to-transparent" />
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24 md:px-10">
        <div className="mb-6 flex items-center gap-4">
          <span className="seal h-14 w-14 text-2xl font-bold">{config.seal}</span>
          <div className="text-sm tracking-[0.4em] text-[#eacd7a]">
            {config.alias} · {config.location}
          </div>
        </div>

        <h1 className="font-serif-sc text-6xl font-black leading-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.5)] md:text-8xl">{config.name}</h1>
        <p className="font-serif-sc mt-6 max-w-xl text-lg leading-relaxed text-[#e6dcc4] drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] md:text-xl">
          {config.tagline}
        </p>

        <div className="mt-16 flex flex-wrap items-center gap-4">
          <a
            href="#explorer"
            className="rounded-full bg-[#a63d2a] px-7 py-3 text-sm font-medium tracking-widest text-[#f7f1e3] shadow-lg shadow-[#a63d2a]/30 transition hover:bg-[#bf4a35]"
          >
            亲手拆解{config.archetype === 'pagoda' || config.archetype === 'tower' ? '木塔' : '大殿'} →
          </a>
          <a
            href="#history"
            className="rounded-full border border-[#d8cdb4]/50 px-7 py-3 text-sm tracking-widest text-[#e6dcc4] backdrop-blur transition hover:border-[#c9a227] hover:text-[#c9a227]"
          >
            千年沿革
          </a>
        </div>

        {/* 玻璃数据条 */}
        <div className="mt-12 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md sm:grid-cols-3 md:grid-cols-5">
          {config.heroStats.map((s) => (
            <div key={s.label} className="bg-[#14100c]/35 px-4 py-4">
              <div className="font-serif-sc text-2xl font-bold text-[#eacd7a] md:text-3xl">
                {s.value}
                {s.unit && <span className="ml-1 text-xs font-normal text-[#cfc4a8]">{s.unit}</span>}
              </div>
              <div className="mt-1 text-[11px] leading-relaxed text-[#b3a88e]">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-[10px] tracking-widest text-[#8a7f6a]/70">主视觉为 AI 辅助艺术图 · 结构以三维模型与文献为准</div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-xs tracking-[0.5em] text-[#a89c80]">向下滚动</div>
    </section>
  )
}
