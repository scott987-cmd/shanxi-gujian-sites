import type { BuildingConfig } from '@/sites/types'

export default function Legacy({ config }: { config: BuildingConfig }) {
  const { legacy } = config
  return (
    <section id="legacy" className="paper-texture py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 flex items-end gap-5">
          <span className="seal h-12 w-12 text-xl font-bold">护</span>
          <div>
            <h2 className="font-serif-sc text-4xl font-bold text-[#2b2620] md:text-5xl">伤痕与守望</h2>
            <p className="mt-2 text-sm tracking-[0.3em] text-[#8a7f6a]">一座古建的现代命运</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#d8cdb4] bg-[#faf6ec] p-6 shadow-sm">
              <h3 className="font-serif-sc text-2xl font-bold text-[#2b2620]">保存现状</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#5c5142]">{legacy.status}</p>
            </div>

            {legacy.lesson && (
              <div className="rounded-2xl border-l-4 border-[#a63d2a] bg-[#faf6ec] p-6 shadow-sm">
                <h3 className="font-serif-sc text-xl font-bold text-[#a63d2a]">{legacy.lesson.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5c5142]">{legacy.lesson.desc}</p>
              </div>
            )}

            <div className="rounded-2xl border border-[#d8cdb4] bg-[#faf6ec] p-6 shadow-sm">
              <h3 className="font-serif-sc text-xl font-bold text-[#2b2620]">数字重生</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#5c5142]">{legacy.digital}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#2b2620] p-8 text-[#e8dcb8]">
            <h3 className="font-serif-sc text-2xl font-bold text-[#c9a227]">{config.plaquesTitle}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#a89c80]">{config.plaquesIntro}</p>
            <div className="mt-8 space-y-6">
              {config.plaques.map((p) => (
                <div key={p.text} className="rounded-xl border border-[#4a4032] bg-[#221c15] p-6 text-center transition hover:border-[#c9a227]">
                  <div className={`font-serif-sc font-black tracking-[0.2em] text-[#e8dcb8] ${p.big ? 'text-4xl' : 'text-3xl'}`}>{p.text}</div>
                  <div className="mt-3 text-xs tracking-widest text-[#8a7f6a]">{p.by}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
