import { SITES } from '../sites'

export default function Gallery() {
  return (
    <div className="night-texture min-h-screen text-[#efe7d6]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-4 flex items-center gap-4">
          <span className="seal h-14 w-14 text-2xl font-bold">晋</span>
          <div className="text-sm tracking-[0.4em] text-[#c9a227]">山西古建系列 · 地上文物看山西</div>
        </div>
        <h1 className="font-serif-sc text-5xl font-black leading-tight md:text-7xl">千年木构 · 二十遗珍</h1>
        <p className="font-serif-sc mt-6 max-w-2xl text-lg leading-relaxed text-[#d8cdb4]">
          山西保存了中国七成以上的元代以前木构建筑。这个系列为二十座（处）国之瑰宝各建一座可交互的网站：
          滚动穿越千年历史，亲手把建筑拆成每一根木头。
        </p>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SITES.map((s, i) => (
            <a
              key={s.id}
              href={`#/s/${s.id}`}
              className="group rounded-2xl border border-[#4a4032] bg-[#262016] p-6 transition hover:-translate-y-1 hover:border-[#c9a227]"
            >
              <div className="flex items-center justify-between">
                <span className="seal h-10 w-10 text-base font-bold">{s.seal}</span>
                <span className="text-xs tracking-widest text-[#6b5f4c]">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h2 className="font-serif-sc mt-4 text-2xl font-bold group-hover:text-[#c9a227]">{s.name}</h2>
              <div className="mt-1 text-xs tracking-wider text-[#8a7f6a]">{s.alias}</div>
              <div className="mt-1 text-xs tracking-wider text-[#8a7f6a]">{s.location}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {s.heroStats.slice(0, 3).map((st) => (
                  <span key={st.label} className="rounded-full bg-[#1d1812] px-2.5 py-1 text-[10px] text-[#a89c80]">
                    {st.value}
                    {st.unit}
                  </span>
                ))}
              </div>
              <div className="mt-4 text-xs text-[#c9a227] opacity-0 transition group-hover:opacity-100">进入站点 →</div>
            </a>
          ))}
        </div>

        <footer className="mt-16 border-t border-[#4a4032] pt-8 text-center text-xs text-[#6b5f4c]">
          山西古建系列 · 每座古建一个可拆解的三维世界
        </footer>
      </div>
    </div>
  )
}
