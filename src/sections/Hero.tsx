import type { BuildingConfig } from '@/sites/types'
import PagodaSVG from '@/components/PagodaSVG'

// 殿堂剪影（庑殿/歇山/悬山通用示意）
function HallSilhouette({ doubleEave }: { doubleEave: boolean }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full">
      <g fill="#c9a227" opacity={0.85}>
        {/* 大屋顶 */}
        <path d="M30 108 Q60 92 200 84 Q340 92 370 108 L352 124 L48 124 Z" />
        <rect x="140" y="76" width="120" height="8" rx={2} />
        {doubleEave && <path d="M58 158 Q90 146 200 140 Q310 146 342 158 L330 172 L70 172 Z" />}
        {/* 柱网 */}
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={58 + i * 40.5} y={doubleEave ? 176 : 128} width={7} height={doubleEave ? 74 : 122} />
        ))}
        {/* 台基 */}
        <path d="M40 252 L360 252 L372 272 L28 272 Z" />
      </g>
    </svg>
  )
}

export default function Hero({ config }: { config: BuildingConfig }) {
  return (
    <section id="hero" className="night-texture relative min-h-screen overflow-hidden text-[#efe7d6]">
      {/* 背景剪影 */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] items-center justify-center opacity-45 md:flex">
        <div className="w-full max-w-[520px]">
          {config.archetype === 'pagoda' ? (
            <PagodaSVG explode={0} mode="explode" activeSystem={null} selectedId={null} onSelect={() => {}} />
          ) : (
            <HallSilhouette doubleEave={config.hall?.doubleEave ?? false} />
          )}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#1d1812] via-[#1d1812]/70 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24 md:px-10">
        <div className="mb-6 flex items-center gap-4">
          <span className="seal h-14 w-14 text-2xl font-bold">{config.seal}</span>
          <div className="text-sm tracking-[0.4em] text-[#c9a227]">
            {config.alias} · {config.location}
          </div>
        </div>

        <h1 className="font-serif-sc text-6xl font-black leading-tight md:text-8xl">{config.name}</h1>
        <p className="font-serif-sc mt-6 max-w-xl text-lg leading-relaxed text-[#d8cdb4] md:text-xl">{config.tagline}</p>

        <div className="mt-14 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 md:grid-cols-5">
          {config.heroStats.map((s) => (
            <div key={s.label}>
              <div className="font-serif-sc text-3xl font-bold text-[#c9a227] md:text-4xl">
                {s.value}
                {s.unit && <span className="ml-1 text-sm font-normal text-[#b3a88e]">{s.unit}</span>}
              </div>
              <div className="mt-1 text-xs leading-relaxed text-[#a89c80]">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-4">
          <a
            href="#explorer"
            className="rounded-full bg-[#a63d2a] px-7 py-3 text-sm font-medium tracking-widest text-[#f7f1e3] transition hover:bg-[#bf4a35]"
          >
            亲手拆解{config.archetype === 'pagoda' ? '木塔' : '大殿'} →
          </a>
          <a
            href="#history"
            className="rounded-full border border-[#8a7f6a] px-7 py-3 text-sm tracking-widest text-[#d8cdb4] transition hover:border-[#c9a227] hover:text-[#c9a227]"
          >
            千年沿革
          </a>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-xs tracking-[0.5em] text-[#8a7f6a]">向下滚动</div>
    </section>
  )
}
