import { useState } from 'react'
import DougongSVG from '@/components/DougongSVG'
import { Slider } from '@/components/ui/slider'

const LAYER_DESCS: Record<string, { name: string; desc: string }> = {
  ludou: { name: '栌斗', desc: '最底层的大斗，直接坐在柱头上，承接整攒斗拱的全部荷载。' },
  huagong: { name: '华栱', desc: '垂直于墙面层层出跳的栱，是斗拱向外悬挑的主力构件。' },
  nidao: { name: '泥道栱', desc: '与华栱十字相扣的横栱，把出跳结构稳稳锁在柱头轴线上。' },
  ang: { name: '下昂', desc: '一根斜置的杠杆：前端挑着深远的屋檐，后端被梁架压住，用杠杆原理“举”起出檐。' },
  ling: { name: '令栱', desc: '最外一跳上的横栱，承托撩檐枋，把荷载分配到各攒斗拱。' },
  fang: { name: '撩檐枋', desc: '架在所有斗拱顶端的通长木枋，直接承托屋檐椽飞，并串联各攒斗拱成整体。' },
}

export default function BracketLab() {
  const [explode, setExplode] = useState(0.6)
  const [sel, setSel] = useState<string | null>('ang')
  const info = sel ? LAYER_DESCS[sel] : null

  return (
    <section id="dougong" className="paper-texture py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 flex items-end gap-5">
          <span className="seal h-12 w-12 text-xl font-bold">拱</span>
          <div>
            <h2 className="font-serif-sc text-4xl font-bold text-[#2b2620] md:text-5xl">斗拱博物馆</h2>
            <p className="mt-2 text-sm tracking-[0.3em] text-[#8a7f6a]">54 种 · 480 余朵 · 百尺莲开</p>
          </div>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#d8cdb4] bg-[#faf6ec] p-4 shadow-sm md:p-6">
            <DougongSVG explode={explode} selected={sel} onSelect={(id) => setSel(id === '' ? null : id)} />
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
          </div>

          <div>
            <div className="rounded-2xl border border-[#d8cdb4] bg-[#faf6ec] p-6 shadow-sm">
              {info ? (
                <>
                  <div className="text-xs tracking-[0.3em] text-[#a63d2a]">斗拱构件</div>
                  <h3 className="font-serif-sc mt-1 text-2xl font-bold text-[#2b2620]">{info.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#5c5142]">{info.desc}</p>
                </>
              ) : (
                <>
                  <h3 className="font-serif-sc text-2xl font-bold text-[#2b2620]">什么是斗拱？</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#5c5142]">
                    斗是方形垫木，拱是弓形短梁。二者层层相扣、出跳悬挑，把深远的屋檐荷载一步步传回柱头。
                    点击左侧任一构件，看看它叫什么、做什么。
                  </p>
                </>
              )}
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[
                  ['54 种', '形制各异'],
                  ['480+', '全塔朵数'],
                  ['榆木', '斗拱用材'],
                ].map(([v, k]) => (
                  <div key={k} className="rounded-lg bg-[#efe7d3] p-3">
                    <div className="font-serif-sc text-xl font-bold text-[#a63d2a]">{v}</div>
                    <div className="mt-1 text-xs text-[#8a7f6a]">{k}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#2b2620] p-6 text-[#e8dcb8]">
              <h4 className="font-serif-sc text-lg font-semibold text-[#c9a227]">为什么斗拱能减震？</h4>
              <p className="mt-3 text-sm leading-relaxed text-[#cfc4a8]">
                每朵斗拱由数十个小木块以榫卯叠合，构件之间留有微小缝隙。地震来袭时，木块相互摩擦、滑移、挤压再回弹，
                像遍布塔身的数百个微型减震器，把冲击能量层层耗散——“松动而不散，摇晃而不塌”。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
