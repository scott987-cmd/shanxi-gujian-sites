import type { BuildingConfig } from '@/sites/types'

const ICONS: Record<string, string> = {
  mortise: 'M4 12h6v-4h4v4h6v4h-6v4h-4v-4H4z',
  sleeve: 'M12 3a9 9 0 100 18 9 9 0 000-18zm0 5a4 4 0 110 8 4 4 0 010-8z',
  rigid: 'M4 6h16M4 12h16M4 18h16M6 4l12 16M18 4L6 20',
  dougong: 'M12 4v16M6 8h12M8 12h8M10 16h4',
  chazhu: 'M6 20L18 4M6 4v16h16',
}
const FALLBACK_ICON = 'M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13'

export default function AntiQuake({ config }: { config: BuildingConfig }) {
  const FEATURES = config.features
  return (
    <section id="quake" className="night-texture py-24 text-[#efe7d6]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 flex items-end gap-5">
          <span className="seal h-12 w-12 text-xl font-bold">构</span>
          <div>
            <h2 className="font-serif-sc text-4xl font-bold md:text-5xl">{config.featureTitle}</h2>
            <p className="mt-2 text-sm tracking-[0.3em] text-[#a89c80]">{config.featureSub}</p>
          </div>
        </div>

        <div className={`grid gap-5 sm:grid-cols-2 ${FEATURES.length >= 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          {FEATURES.map((f, i) => (
            <div
              key={f.id}
              className="group rounded-2xl border border-[#4a4032] bg-[#262016] p-5 transition hover:-translate-y-1 hover:border-[#c9a227]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#c9a227]/10 text-[#c9a227] transition group-hover:bg-[#c9a227]/20">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d={ICONS[f.id] ?? FALLBACK_ICON} />
                </svg>
              </div>
              <div className="text-xs text-[#8a7f6a]">{String(i + 1).padStart(2, '0')}</div>
              <h3 className="font-serif-sc mt-1 text-xl font-bold">{f.title}</h3>
              <div className="mt-1 text-xs tracking-widest text-[#c9a227]">{f.subtitle}</div>
              <p className="mt-3 text-xs leading-relaxed text-[#a89c80]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
