import { SITES } from '../sites'
import { useState } from 'react'

// 朝代归属（以主体遗构年代为准）
const DYN: Record<string, string> = {
  yingxian: '辽', foguangsi: '唐', nanchansi: '唐', jinci: '宋', xuankongsi: '明',
  huayansi: '辽', shanhuasi: '辽', yonglegong: '元', feihongta: '明', shuanglinsi: '明',
  zhenguosi: '五代', chongfusi: '金', bianjinglou: '明', tiantaian: '五代', dayunyuan: '五代',
  longmensi: '宋', chongqingsi: '宋', faxingsi: '宋', qingliansi: '唐', yuhuangmiao: '元',
}
const DYNASTIES = ['全部', '唐', '五代', '辽', '宋', '金', '元', '明'] as const
import ShanxiMap from '../components/ShanxiMap'

export default function Gallery() {
  const [dynasty, setDynasty] = useState<(typeof DYNASTIES)[number]>('全部')
  const filtered = dynasty === '全部' ? SITES : SITES.filter((s) => DYN[s.id] === dynasty)
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

        <div className="mt-10 flex flex-wrap items-center gap-2">
          <span className="mr-2 text-xs tracking-widest text-[#8a7f6a]">按朝代筛选</span>
          {DYNASTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDynasty(d)}
              className={`rounded-full px-4 py-1.5 text-xs tracking-widest transition ${
                dynasty === d ? 'bg-[#c9a227] font-medium text-[#1d1812]' : 'border border-[#6b5f4c] text-[#a89c80] hover:border-[#c9a227] hover:text-[#c9a227]'
              }`}
            >
              {d}
            </button>
          ))}
          <span className="ml-auto text-xs text-[#8a7f6a]">{filtered.length} 处</span>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <div className="lg:sticky lg:top-20">
            <h2 className="font-serif-sc mb-4 text-2xl font-bold text-[#e8dcb8]">晋地二十遗珍分布图</h2>
            <ShanxiMap sites={filtered} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
          {filtered.map((s, i) => (
            <a
              key={s.id}
              href={`#/s/${s.id}`}
              className="group overflow-hidden rounded-2xl border border-[#4a4032] bg-[#262016] transition hover:-translate-y-1 hover:border-[#c9a227]"
            >
              <div className="relative h-36 w-full overflow-hidden bg-[#1d1812]">
                <img src={`/heroes/${s.id}.jpg`} alt={s.name} loading="lazy" className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#262016] to-transparent" />
              </div>
              <div className="flex items-center justify-between p-6 pb-0">
                <span className="seal h-10 w-10 text-base font-bold">{s.seal}</span>
                <span className="text-xs tracking-widest text-[#6b5f4c]">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h2 className="font-serif-sc mt-4 px-6 text-2xl font-bold group-hover:text-[#c9a227]">{s.name}</h2>
              <div className="mt-1 px-6 text-xs tracking-wider text-[#8a7f6a]">{s.alias}</div>
              <div className="mt-1 px-6 text-xs tracking-wider text-[#8a7f6a]">{s.location}</div>
              <div className="mt-4 flex flex-wrap gap-2 px-6">
                {s.heroStats.slice(0, 3).map((st) => (
                  <span key={st.label} className="rounded-full bg-[#1d1812] px-2.5 py-1 text-[10px] text-[#a89c80]">
                    {st.value}
                    {st.unit}
                  </span>
                ))}
              </div>
              <div className="mt-4 p-6 pt-0 text-xs text-[#c9a227] opacity-0 transition group-hover:opacity-100">进入站点 →</div>
            </a>
          ))}
          </div>
        </div>

        <footer className="mt-16 border-t border-[#4a4032] pt-8 text-center text-xs text-[#6b5f4c]">
          山西古建系列 · 每座古建一个可拆解的三维世界
        </footer>
      </div>
    </div>
  )
}
