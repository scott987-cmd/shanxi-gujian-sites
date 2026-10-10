import { useEffect, useRef, useState } from 'react'
import { JOINT_PARTS } from '@/data/pagoda'
import type { BuildingConfig } from '@/sites/types'
import PagodaCanvas from '@/components/PagodaCanvas'
import PlanView, { PLAN_INFO } from '@/components/PlanView'
import HallPlan from '@/components/HallPlan'
import { Slider } from '@/components/ui/slider'

type Mode = 'pagoda' | 'joint' | 'plan'

const MODE_TABS: { id: Mode; name: string; hint: string }[] = [
  { id: 'pagoda', name: '3D 拆解', hint: '拖拽旋转 · 滚轮缩放 · 点击构件或在右侧目录选择' },
  { id: 'joint', name: '节点工坊', hint: '放大到每一根木头：斗拱与叉柱造' },
  { id: 'plan', name: '柱网平面', hint: '俯瞰平面，认识柱网布局' },
]

const KIND_STYLE: Record<string, { label: string; color: string }> = {
  foundation: { label: '基座', color: '#9a8f7d' },
  platform: { label: '台基', color: '#9a8f7d' },
  veranda: { label: '副阶', color: '#a37a4f' },
  columns: { label: '柱架', color: '#7a4e2d' },
  brackets: { label: '斗拱层', color: '#c9a227' },
  beams: { label: '梁架层', color: '#8a5c36' },
  eave: { label: '屋檐', color: '#5d6b76' },
  roof: { label: '屋顶', color: '#46525c' },
  ridge: { label: '脊饰', color: '#4a6a5a' },
  mezzanine: { label: '暗层', color: '#a63d2a' },
  finial: { label: '塔刹', color: '#b99a5e' },
}

const HALL_PLAN_ZONES = [
  { id: 'eaveCols', title: '檐柱（外圈）', desc: '外圈檐柱承担屋檐荷载，多有「侧脚」——柱脚向外微撇，使建筑整体内敛稳固。' },
  { id: 'innerCols', title: '金柱（内槽）', desc: '内圈金柱支撑梁架核心，与檐柱以阑额、梁栿拉结成整体。' },
  { id: 'altar', title: '佛坛', desc: '殿内后部设佛坛，供奉主尊与胁侍造像。' },
  { id: 'door', title: '殿门（南）', desc: '建筑坐北朝南，明间开门（大殿常坐东朝西等特殊朝向以实物为准）。' },
]

export default function Explorer({ config }: { config: BuildingConfig }) {
  const [mode, setMode] = useState<Mode>('pagoda')
  const [explode, setExplode] = useState(0)
  const [spread, setSpread] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [seeThrough, setSeeThrough] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [planSel, setPlanSel] = useState<string | null>(null)
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    if (selectedId && rowRefs.current[selectedId]) {
      rowRefs.current[selectedId]!.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedId])

  const switchMode = (m: Mode) => {
    setMode(m)
    setSelectedId(null)
    setExplode(0)
    setSpread(0)
  }

  const rows = [...config.parts].reverse()
  const jointGroups = [
    { name: '斗拱（左）', items: JOINT_PARTS.filter((j) => j.group === '斗拱（左）') },
    { name: '叉柱造（右）', items: JOINT_PARTS.filter((j) => j.group === '叉柱造（右）') },
  ]

  const planZones = config.archetype === 'pagoda' ? PLAN_INFO : HALL_PLAN_ZONES
  const planInfo = planZones.find((p) => p.id === planSel) ?? null

  const renderRow = (id: string, name: string, tag: string, color: string, desc: string, facts?: string[]) => {
    const sel = selectedId === id
    return (
      <div
        key={id}
        ref={(el) => {
          rowRefs.current[id] = el
        }}
        className={`border-l-2 transition-colors ${sel ? 'border-[#a63d2a] bg-[#a63d2a]/10' : 'border-transparent hover:bg-[#f2ecdf]/5'}`}
      >
        <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left" onClick={() => setSelectedId(sel ? null : id)}>
          <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: color }} />
          <span className={`text-sm ${sel ? 'font-semibold text-[#f2e9d2]' : 'text-[#cfc4a8]'}`}>{name}</span>
          <span className="ml-auto shrink-0 text-[10px] tracking-wider text-[#8a7f6a]">{tag}</span>
          <span className={`shrink-0 text-xs ${sel ? 'text-[#c9a227]' : 'text-[#6b5f4c]'}`}>{sel ? '−' : '+'}</span>
        </button>
        {sel && (
          <div className="px-4 pb-4 pl-9">
            <p className="text-xs leading-relaxed text-[#cfc4a8]">{desc}</p>
            {facts && facts.length > 0 && (
              <ul className="mt-2 space-y-1">
                {facts.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-[11px] text-[#a89c80]">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#c9a227]" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <section id="explorer" className="night-texture py-24 text-[#efe7d6]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex items-end gap-5">
          <span className="seal h-12 w-12 text-xl font-bold">构</span>
          <div>
            <h2 className="font-serif-sc text-4xl font-bold md:text-5xl">亲手拆解{config.archetype === 'pagoda' ? '木塔' : '大殿'}</h2>
            <p className="mt-2 text-sm tracking-[0.3em] text-[#a89c80]">360° 旋转 · 逐层拆解 · 看清每块木头的咬合</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          {MODE_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => switchMode(t.id)}
              className={`rounded-full px-5 py-2 text-sm tracking-widest transition ${
                mode === t.id
                  ? 'bg-[#c9a227] font-medium text-[#1d1812]'
                  : 'border border-[#6b5f4c] text-[#c9bfa4] hover:border-[#c9a227] hover:text-[#c9a227]'
              }`}
            >
              {t.name}
            </button>
          ))}
          <span className="ml-auto hidden self-center text-xs text-[#8a7f6a] md:block">
            {MODE_TABS.find((t) => t.id === mode)?.hint}
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-[#4a4032] bg-[#272d36]">
              {mode === 'plan' ? (
                <div className="bg-[#f2ecdf] p-2">
                  {config.archetype === 'pagoda' ? (
                    <PlanView selected={planSel} onSelect={(id) => setPlanSel(id === planSel ? null : id)} />
                  ) : (
                    <HallPlan params={config.hall!} selected={planSel} onSelect={(id) => setPlanSel(id === planSel ? null : id)} />
                  )}
                </div>
              ) : (
                <div className="h-[62vh] min-h-[420px]">
                  <PagodaCanvas
                    config={config}
                    mode={mode}
                    explode={explode}
                    spread={spread}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    seeThrough={seeThrough}
                    autoRotate={autoRotate}
                  />
                </div>
              )}
            </div>

            {mode !== 'plan' && (
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-4 rounded-2xl border border-[#4a4032] bg-[#262016] px-5 py-4">
                <div className="grid min-w-[240px] flex-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-[#a89c80]">
                      <span>{mode === 'pagoda' ? '逐层拆解（纵向）' : '构件分解'}</span>
                      <span>{explode === 0 ? '合拢' : explode < 1 ? '分离中' : '完全拆解'}</span>
                    </div>
                    <Slider
                      value={[explode * 100]}
                      max={100}
                      step={1}
                      onValueChange={([v]) => setExplode(v / 100)}
                      className="[&_[data-slot=slider-range]]:bg-[#c9a227] [&_[data-slot=slider-thumb]]:border-[#c9a227]"
                    />
                  </div>
                  {mode === 'pagoda' && (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs text-[#a89c80]">
                        <span>构件散开（横向）</span>
                        <span>{spread === 0 ? '合拢' : spread < 1 ? '散开中' : '完全散开'}</span>
                      </div>
                      <Slider
                        value={[spread * 100]}
                        max={100}
                        step={1}
                        onValueChange={([v]) => setSpread(v / 100)}
                        className="[&_[data-slot=slider-range]]:bg-[#a63d2a] [&_[data-slot=slider-thumb]]:border-[#a63d2a]"
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`rounded-full border px-4 py-1.5 text-xs transition ${
                    autoRotate ? 'border-[#c9a227] bg-[#c9a227]/15 text-[#e8dcb8]' : 'border-[#6b5f4c] text-[#a89c80] hover:border-[#c9a227]'
                  }`}
                >
                  {autoRotate ? '⏸ 停止旋转' : '▶ 自动旋转'}
                </button>
                {mode === 'pagoda' && (
                  <button
                    onClick={() => setSeeThrough(!seeThrough)}
                    className={`rounded-full border px-4 py-1.5 text-xs transition ${
                      seeThrough ? 'border-[#c9a227] bg-[#c9a227]/15 text-[#e8dcb8]' : 'border-[#6b5f4c] text-[#a89c80] hover:border-[#c9a227]'
                    }`}
                  >
                    {seeThrough ? '✓ 透视墙体中' : '透视墙体看内部'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 右：构件目录 / 平面说明 */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-[#4a4032] bg-[#262016] lg:max-h-[calc(62vh+92px)]">
            {mode === 'pagoda' && (
              <>
                <div className="flex items-center justify-between border-b border-[#4a4032] px-4 py-3">
                  <span className="font-serif-sc text-sm font-semibold text-[#e8dcb8]">构件目录 · 自上而下</span>
                  <span className="text-[10px] tracking-wider text-[#8a7f6a]">共 {config.parts.length} 层</span>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {!selectedId && (
                    <div className="border-b border-[#4a4032]/60 px-4 py-3 text-xs leading-relaxed text-[#a89c80]">
                      双滑杆玩法：<span className="text-[#c9a227]">「逐层拆解」</span>纵向分层，
                      <span className="text-[#c9a227]">「构件散开」</span>让构件沿四周炸开，墙体随之淡出可见内部。点击 3D 构件或本目录任一行查看详解。
                    </div>
                  )}
                  {rows.map((p) => {
                    const ks = KIND_STYLE[p.kind] ?? { label: p.kind, color: '#a37a4f' }
                    return renderRow(p.id, p.short, ks.label, ks.color, p.desc, p.facts)
                  })}
                </div>
              </>
            )}

            {mode === 'joint' && (
              <>
                <div className="flex items-center justify-between border-b border-[#4a4032] px-4 py-3">
                  <span className="font-serif-sc text-sm font-semibold text-[#e8dcb8]">节点构件 · 每块木头</span>
                  <span className="text-[10px] tracking-wider text-[#8a7f6a]">{JOINT_PARTS.length} 件</span>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {!selectedId && (
                    <div className="border-b border-[#4a4032]/60 px-4 py-3 text-xs leading-relaxed text-[#a89c80]">
                      左侧是一攒放大的斗拱，右侧是叉柱造。拖动滑杆逐块拆开，点击木头看它的名称与作用。
                    </div>
                  )}
                  {jointGroups.map((grp) => (
                    <div key={grp.name}>
                      <div className="sticky top-0 border-b border-[#4a4032]/60 bg-[#262016] px-4 py-2 text-[10px] tracking-[0.3em] text-[#c9a227]">
                        {grp.name}
                      </div>
                      {grp.items.map((j) => renderRow(j.id, j.name, '', '#a37a4f', j.desc))}
                    </div>
                  ))}
                </div>
              </>
            )}

            {mode === 'plan' && (
              <div className="overflow-y-auto p-6">
                <div className="mb-1 text-xs tracking-[0.3em] text-[#c9a227]">俯视 · 平面</div>
                <h3 className="font-serif-sc text-2xl font-bold">{planInfo ? planInfo.title : config.planTitle}</h3>
                <p className="mt-4 text-sm leading-relaxed text-[#cfc4a8]">{planInfo ? planInfo.desc : '点击平面图上的构件查看说明。'}</p>
                <div className="mt-6 grid grid-cols-2 gap-3 text-center">
                  {(config.archetype === 'pagoda'
                    ? [
                        ['24', '外槽柱'],
                        ['8', '内槽柱'],
                        ['八角', '平面形制'],
                        ['30.27m', '底层直径'],
                      ]
                    : [
                        [`${config.hall!.bays} 间`, '面阔'],
                        [`${config.hall!.depthBays} 间`, '进深'],
                        [config.hall!.roof === 'wudian' ? '庑殿' : config.hall!.roof === 'xieshan' ? '歇山' : '悬山', '屋顶形制'],
                        [config.hall!.doubleEave ? '重檐' : '单檐', '屋檐'],
                      ]
                  ).map(([v, k]) => (
                    <div key={k} className="rounded-lg border border-[#4a4032] p-3">
                      <div className="font-serif-sc text-xl font-bold text-[#c9a227]">{v}</div>
                      <div className="mt-1 text-xs text-[#a89c80]">{k}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
