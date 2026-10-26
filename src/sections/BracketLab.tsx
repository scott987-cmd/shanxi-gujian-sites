import { useState } from 'react'
import type { BuildingConfig } from '@/sites/types'
import DougongSVG from '@/components/DougongSVG'
import { BeamsLab, GlazeLab, StarsLab, SculpturesLab, MuralLab, BridgeLab, ShelfLab } from '@/components/signature'
import { Slider } from '@/components/ui/slider'

const LAYER_DESCS: Record<string, { name: string; desc: string }> = {
  ludou: { name: '栌斗', desc: '最底层的大斗，坐于柱头，承接整攒斗拱的全部荷载。' },
  huagong: { name: '华栱', desc: '垂直于墙面出跳的栱，斗拱悬挑的主力构件。' },
  nidao: { name: '泥道栱', desc: '与华栱十字相扣的横栱，把出跳结构稳稳锁在柱头轴线上。' },
  ang: { name: '下昂', desc: '一根斜置的杠杆：前端挑着深远的屋檐，后端被梁架压住，用杠杆原理“举”起出檐。' },
  ling: { name: '令栱', desc: '最外一跳的横栱，托住撩檐枋。' },
  ang2: { name: '下昂 · 第二跳', desc: '七铺作的第二重斜昂，把出檐再挑远一步。' },
  fang: { name: '撩檐枋', desc: '架在斗拱顶端的通长木枋，直接承托屋檐，并串联各攒斗拱成整体。' },
}

export default function SignatureLab({ config }: { config: BuildingConfig }) {
  const sig = config.signature
  const [explode, setExplode] = useState(0.6)
  const [sel, setSel] = useState<string | null>(null)
  const info = sel ? LAYER_DESCS[sel] : null

  return (
    <section id="dougong" className="paper-texture py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 flex items-end gap-5">
          <span className="seal h-12 w-12 text-xl font-bold">珍</span>
          <div>
            <h2 className="font-serif-sc text-4xl font-bold text-[#2b2620] md:text-5xl">{sig.title}</h2>
            <p className="mt-2 text-sm tracking-[0.3em] text-[#8a7f6a]">{sig.sub}</p>
          </div>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#d8cdb4] bg-[#faf6ec] p-4 shadow-sm md:p-6">
            {sig.visual === 'dougong' && (
              <>
                <DougongSVG explode={explode} selected={sel} onSelect={(id) => setSel(id === '' ? null : id)} jumps={sig.jumps ?? 5} />
                <div className="mt-4 px-2">
                  <div className="mb-2 flex justify-between text-xs text-[#8a7f6a]">
                    <span>分解斗拱</span>
                    <span>{explode < 0.1 ? '合拢' : '逐层拆开'}</span>
                  </div>
                  <Slider
                    value={[explode * 100]}
                    max={100}
                    step={1}
                    onValueChange={([v]) => setExplode(v / 100)}
                    className="[&_[data-slot=slider-range]]:bg-[#a63d2a] [&_[data-slot=slider-thumb]]:border-[#a63d2a]"
                  />
                </div>
              </>
            )}
            {sig.visual === 'beams' && <BeamsLab />}
            {sig.visual === 'glaze' && <GlazeLab />}
            {sig.visual === 'stars' && <StarsLab />}
            {sig.visual === 'sculptures' && <SculpturesLab sig={sig} />}
            {sig.visual === 'mural' && <MuralLab sig={sig} />}
            {sig.visual === 'bridge' && <BridgeLab />}
            {sig.visual === 'shelf' && <ShelfLab />}
          </div>

          <div>
            <div className="rounded-2xl border border-[#d8cdb4] bg-[#faf6ec] p-6 shadow-sm">
              {sig.visual === 'dougong' && info ? (
                <>
                  <div className="text-xs tracking-[0.3em] text-[#a63d2a]">斗拱构件</div>
                  <h3 className="font-serif-sc mt-1 text-2xl font-bold text-[#2b2620]">{info.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#5c5142]">{info.desc}</p>
                </>
              ) : (
                <p className="text-sm leading-relaxed text-[#5c5142]">{sig.desc}</p>
              )}
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {sig.stats.map(([v, k]) => (
                  <div key={k} className="rounded-lg bg-[#efe7d3] p-3">
                    <div className="font-serif-sc text-xl font-bold text-[#a63d2a]">{v}</div>
                    <div className="mt-1 text-xs text-[#8a7f6a]">{k}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#2b2620] p-6 text-[#e8dcb8]">
              <h4 className="font-serif-sc text-lg font-semibold text-[#c9a227]">为什么是它？</h4>
              <p className="mt-3 text-sm leading-relaxed text-[#cfc4a8]">
                {config.name}最值得细看的不是整体轮廓，而是这个部位——它决定了这座建筑在中国建筑史上的坐标。左侧的交互图可以亲手拆开、点亮、把玩。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
