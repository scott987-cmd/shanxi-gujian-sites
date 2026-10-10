import { useEffect, useState } from 'react'
import type { BuildingConfig } from '../sites/types'
import Hero from '../sections/Hero'
import Timeline from '../sections/Timeline'
import Explorer from '../sections/Explorer'
import BracketLab from '../sections/BracketLab'
import AntiQuake from '../sections/AntiQuake'
import Legacy from '../sections/Legacy'

const NAV = [
  { id: 'history', label: '沿革' },
  { id: 'explorer', label: '拆解' },
  { id: 'dougong', label: '斗拱' },
  { id: 'quake', label: '结构' },
  { id: 'legacy', label: '保护' },
]

export default function Site({ config }: { config: BuildingConfig }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    document.title = `${config.name} · 山西古建系列`
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [config.id, config.name])

  return (
    <div className="min-h-screen">
      <nav className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? 'bg-[#1d1812]/90 shadow-lg backdrop-blur' : 'bg-transparent'}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <a href="#/" className="flex items-center gap-2.5">
              <span className="seal h-8 w-8 text-sm font-bold">{config.seal}</span>
              <span className="font-serif-sc text-lg font-bold tracking-widest text-[#efe7d6]">{config.name}</span>
            </a>
            <a href="#/" className="ml-3 hidden rounded-full border border-[#6b5f4c] px-3 py-1 text-xs text-[#a89c80] transition hover:border-[#c9a227] hover:text-[#c9a227] md:block">
              ← 全部古建
            </a>
          </div>
          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="rounded-full px-4 py-1.5 text-sm text-[#cfc4a8] transition hover:bg-[#c9a227]/15 hover:text-[#c9a227]"
              >
                {n.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <Hero config={config} />
      <Timeline config={config} />
      <Explorer config={config} />
      <BracketLab />
      <AntiQuake config={config} />
      <Legacy config={config} />

      <footer className="bg-[#14100c] py-12 text-center text-[#8a7f6a]">
        <div className="font-serif-sc text-2xl font-bold tracking-[0.3em] text-[#c9a227]">{config.alias}</div>
        <p className="mx-auto mt-4 max-w-xl px-6 text-xs leading-relaxed">
          本站为古建科普演示作品，数据与史实整理自公开学术资料与测绘文献。山西古建系列 ·「{config.name}」
        </p>
        <p className="mt-3 text-xs tracking-widest">{config.location}</p>
      </footer>
    </div>
  )
}
