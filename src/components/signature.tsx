// 专属精读可视化组件库（每座古建一种镇馆之宝）
import { useState } from 'react'
import type { SignatureInfo } from '@/sites/types'
import { Slider } from '@/components/ui/slider'

const INK = '#2b2620'
const GOLD = '#c9a227'
const CIN = '#a63d2a'
const WOOD = '#7a4e2d'

// ---------- 悬空寺：悬臂横梁杠杆 ----------
export function BeamsLab() {
  const [load, setLoad] = useState(50)
  const pinch = Math.min(1, load / 100)
  return (
    <div>
      <svg viewBox="0 0 460 260" className="w-full h-auto">
        {/* 崖壁 */}
        <path d="M40 240 L40 40 Q100 30 130 60 Q160 40 180 60 L180 240 Z" fill="#6e6557" />
        {/* 石孔（内高外低） */}
        <rect x={120} y={118} width={60} height={16} fill="#2b2620" transform={`rotate(-6 150 126)`} />
        {/* 横梁 */}
        <g transform={`rotate(-6 150 126)`}>
          <rect x={110} y={121} width={230} height={11} fill={WOOD} stroke="#3d2716" />
        </g>
        {/* 荷载 */}
        <g>
          <rect x={300} y={132 - 40 * pinch * 0} width={60} height={26} fill={CIN} opacity={0.85} transform={`translate(0 ${0})`} />
          <path d={`M330 ${100} L330 ${120} M324 ${112} L330 ${122} L336 ${112}`} stroke={CIN} strokeWidth={3} fill="none" />
          <text x={330} y={92} textAnchor="middle" fontSize={12} fill={CIN} className="font-serif-sc">殿阁荷载 {load}%</text>
        </g>
        {/* 楔紧力 */}
        <g opacity={0.3 + pinch * 0.7}>
          <path d="M150 138 L150 158 M144 150 L150 160 L156 150" stroke={GOLD} strokeWidth={3} fill="none" />
          <text x={150} y={178} textAnchor="middle" fontSize={11} fill="#8a6d1d" className="font-serif-sc">
            岩体反作用力 {Math.round(load * 0.9)}%
          </text>
        </g>
        {/* 支点 */}
        <circle cx={182} cy={128} r={5} fill={INK} />
        <text x={182} y={150} fontSize={10} textAnchor="middle" fill={INK} className="font-serif-sc">石孔边缘 = 支点</text>
        <text x={230} y={240} fontSize={11} fill="#5c5142" className="font-serif-sc">梁尾被岩体压住 → 越压越紧 · 自锁</text>
      </svg>
      <div className="mt-3 px-2">
        <div className="mb-1.5 flex justify-between text-xs text-[#8a7f6a]">
          <span>拖动改变荷载</span>
          <span>看楔紧力如何同步增大</span>
        </div>
        <Slider value={[load]} max={100} step={1} onValueChange={([v]) => setLoad(v)} className="[&_[data-slot=slider-range]]:bg-[#a63d2a] [&_[data-slot=slider-thumb]]:border-[#a63d2a]" />
      </div>
    </div>
  )
}

// ---------- 飞虹塔：琉璃构件与釉色 ----------
export function GlazeLab() {
  const [sel, setSel] = useState<string | null>('lv')
  const glazes = [
    { id: 'lv', name: '孔雀绿', color: '#3a6a52', desc: '主调釉色，用于屋面与檐口，明代琉璃的标志性发色。' },
    { id: 'huang', name: '琥珀黄', color: '#c9973b', desc: '用于莲花、佛龛边框与点缀，与绿釉相间成辉。' },
    { id: 'lan', name: '霁蓝', color: '#2f4a6a', desc: '用于局部构件与刹顶，深邃沉静。' },
    { id: 'zhe', name: '赭石', color: '#7d4a30', desc: '仿木柱枋的底色，让琉璃远看仍有木构的温润。' },
  ]
  const cur = glazes.find((g) => g.id === sel)!
  return (
    <div>
      <svg viewBox="0 0 460 220" className="w-full h-auto">
        {/* 琉璃斗拱构件分解 */}
        <g transform="translate(120 30)">
          <rect x={-40} y={120} width={80} height={30} fill="#cbb59a" stroke="#8a7f6a" />
          <rect x={-30} y={88} width={60} height={26} fill={cur.color} stroke="#2b2620" strokeWidth={1} />
          <rect x={-52} y={62} width={104} height={20} fill={cur.color} opacity={0.85} stroke="#2b2620" strokeWidth={1} />
          <rect x={-24} y={34} width={48} height={22} fill={cur.color} opacity={0.7} stroke="#2b2620" strokeWidth={1} />
          <path d="M -14 34 Q 0 6 14 34" fill={cur.color} opacity={0.9} stroke="#2b2620" />
          <text x={0} y={180} textAnchor="middle" fontSize={11} fill="#5c5142" className="font-serif-sc">琉璃仿木斗拱 · 塔身构件</text>
        </g>
        {/* 釉色板 */}
        {glazes.map((g, i) => (
          <g key={g.id} transform={`translate(280 ${34 + i * 46})`} onClick={() => setSel(g.id)} style={{ cursor: 'pointer' }}>
            <rect x={0} y={0} width={44} height={34} rx={4} fill={g.color} stroke={sel === g.id ? '#a63d2a' : '#8a7f6a'} strokeWidth={sel === g.id ? 2.5 : 1} />
            <text x={56} y={22} fontSize={13} fill={INK} className="font-serif-sc" fontWeight={sel === g.id ? 700 : 400}>{g.name}</text>
          </g>
        ))}
      </svg>
      <p className="mt-2 rounded-lg bg-[#efe7d3] px-4 py-3 text-xs leading-relaxed text-[#5c5142]">{cur.desc}</p>
    </div>
  )
}

// ---------- 玉皇庙：二十八星宿 ----------
const STARS = [
  ['角木蛟', '东', '木', '蛟'], ['亢金龙', '东', '金', '龙'], ['氐土貉', '东', '土', '貉'], ['房日兔', '东', '日', '兔'], ['心月狐', '东', '月', '狐'], ['尾火虎', '东', '火', '虎'], ['箕水豹', '东', '水', '豹'],
  ['斗木獬', '北', '木', '獬'], ['牛金牛', '北', '金', '牛'], ['女土蝠', '北', '土', '蝠'], ['虚日鼠', '北', '日', '鼠'], ['危月燕', '北', '月', '燕'], ['室火猪', '北', '火', '猪'], ['壁水貐', '北', '水', '貐'],
  ['奎木狼', '西', '木', '狼'], ['娄金狗', '西', '金', '狗'], ['胃土雉', '西', '土', '雉'], ['昴日鸡', '西', '日', '鸡'], ['毕月乌', '西', '月', '乌'], ['觜火猴', '西', '火', '猴'], ['参水猿', '西', '水', '猿'],
  ['井木犴', '南', '木', '犴'], ['鬼金羊', '南', '金', '羊'], ['柳土獐', '南', '土', '獐'], ['星日马', '南', '日', '马'], ['张月鹿', '南', '月', '鹿'], ['翼火蛇', '南', '火', '蛇'], ['轸水蚓', '南', '水', '蚓'],
] as const
const QUAD = { 东: '东方青龙七宿', 北: '北方玄武七宿', 西: '西方白虎七宿', 南: '南方朱雀七宿' }

export function StarsLab() {
  const [sel, setSel] = useState<(typeof STARS)[number] | null>(STARS[1])
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {STARS.map((s) => (
          <button
            key={s[0]}
            onClick={() => setSel(s)}
            className={`rounded-md px-1 py-1.5 text-[11px] transition ${sel?.[0] === s[0] ? 'bg-[#a63d2a] text-[#f7f1e3]' : 'bg-[#efe7d3] text-[#5c5142] hover:bg-[#e3d7bd]'}`}
          >
            {s[0]}
          </button>
        ))}
      </div>
      {sel && (
        <div className="mt-4 rounded-xl border border-[#d8cdb4] bg-[#faf6ec] p-4">
          <div className="flex items-baseline gap-3">
            <span className="font-serif-sc text-2xl font-bold text-[#a63d2a]">{sel[0]}</span>
            <span className="text-xs text-[#8a7f6a]">{QUAD[sel[1] as keyof typeof QUAD]}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#5c5142]">
            五行属{sel[2]}，兽形为{sel[3]}。元代刘銮把抽象的星宿塑成有性格的人——冠服、神态、持物各随星性，动物或置于肩头或伴于身侧。
          </p>
        </div>
      )}
    </div>
  )
}

// ---------- 彩塑群像（双林寺/崇庆寺/法兴寺/青莲寺/善化寺/崇福寺） ----------
export function SculpturesLab({ sig }: { sig: SignatureInfo }) {
  const [sel, setSel] = useState(0)
  const items = sig.items ?? []
  const n = items.length
  return (
    <div>
      <svg viewBox="0 0 460 210" className="w-full h-auto">
        <rect x={20} y={150} width={420} height={18} fill="#9a8f7d" />
        {items.map((it, i) => {
          const x = 45 + (370 / Math.max(n - 1, 1)) * i
          const active = i === sel
          return (
            <g key={it.name} onClick={() => setSel(i)} style={{ cursor: 'pointer' }} opacity={active ? 1 : 0.45}>
              <ellipse cx={x} cy={150} rx={16} ry={6} fill={active ? CIN : '#b99a5e'} />
              <path d={`M ${x - 11} ${148} Q ${x - 9} ${122} ${x} ${122} Q ${x + 9} ${122} ${x + 11} ${148} Z`} fill={active ? CIN : '#b99a5e'} />
              <circle cx={x} cy={112} r={8} fill={active ? CIN : '#b99a5e'} />
              {active && <circle cx={x} cy={112} r={13} fill="none" stroke={GOLD} strokeWidth={1.6} />}
              <text x={x} y={182} textAnchor="middle" fontSize={10} fill={active ? CIN : '#5c5142'} className="font-serif-sc" fontWeight={active ? 700 : 400}>
                {it.name}
              </text>
            </g>
          )
        })}
        <text x={230} y={30} textAnchor="middle" fontSize={11} fill="#8a7f6a" className="font-serif-sc">点击造像查看</text>
      </svg>
      {items[sel] && (
        <div className="mt-3 rounded-xl border border-[#d8cdb4] bg-[#faf6ec] p-4">
          <div className="font-serif-sc text-lg font-bold text-[#2b2620]">{items[sel].name}</div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#5c5142]">{items[sel].desc}</p>
        </div>
      )}
    </div>
  )
}

// ---------- 永乐宫：朝元图长卷 ----------
export function MuralLab({ sig }: { sig: SignatureInfo }) {
  const [sel, setSel] = useState(0)
  const items = sig.items ?? []
  const n = items.length
  return (
    <div>
      <svg viewBox="0 0 460 190" className="w-full h-auto">
        <rect x={10} y={30} width={440} height={110} fill="#2b2620" rx={6} />
        {items.map((it, i) => {
          const x = 45 + (380 / Math.max(n - 1, 1)) * i
          const active = i === sel
          return (
            <g key={it.name} onClick={() => setSel(i)} style={{ cursor: 'pointer' }} opacity={active ? 1 : 0.5}>
              <circle cx={x} cy={70} r={9} fill={active ? '#eacd7a' : '#a89c80'} />
              <path d={`M ${x - 10} ${128} Q ${x - 12} ${88} ${x} ${86} Q ${x + 12} ${88} ${x + 10} ${128} Z`} fill={active ? '#eacd7a' : '#a89c80'} />
              <text x={x} y={158} textAnchor="middle" fontSize={9.5} fill={active ? '#eacd7a' : '#8a7f6a'} className="font-serif-sc">
                {it.name}
              </text>
            </g>
          )
        })}
        <text x={230} y={20} textAnchor="middle" fontSize={10} fill="#8a7f6a" className="font-serif-sc">《朝元图》朝谒队列 · 点击主神查看</text>
      </svg>
      {items[sel] && (
        <div className="mt-3 rounded-xl border border-[#d8cdb4] bg-[#faf6ec] p-4">
          <div className="font-serif-sc text-lg font-bold text-[#2b2620]">{items[sel].name}</div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#5c5142]">{items[sel].desc}</p>
        </div>
      )}
    </div>
  )
}

// ---------- 晋祠：鱼沼飞梁 ----------
export function BridgeLab() {
  const [sel, setSel] = useState<string | null>('deck')
  const info: Record<string, { t: string; d: string }> = {
    deck: { t: '十字桥面', d: '东西向连接圣母殿月台，南北向横跨水池——一座十字形的“水上立交”，北宋原构。' },
    pier: { t: '石柱桥墩', d: '34 根石柱立于水中，上架木梁与桥面。石柱不怕水浸，千年不倾。' },
    wing: { t: '翼桥与栏杆', d: '四翼微坡下伸，如鸟振翅——“飞梁”之名由此而来。' },
  }
  return (
    <div>
      <svg viewBox="0 0 460 300" className="w-full h-auto">
        <rect x={30} y={30} width={400} height={240} rx={8} fill="#3d5a66" opacity={0.9} />
        <text x={50} y={252} fontSize={11} fill="#cfe0e8" className="font-serif-sc">鱼沼（水池）</text>
        {/* 桥墩 */}
        <g onClick={() => setSel('pier')} style={{ cursor: 'pointer' }} opacity={dimOp(sel, 'pier')}>
          {[-2, -1, 0, 1, 2].map((i) => (
            <g key={i}>
              <circle cx={230 + i * 34} cy={130} r={7} fill={sel === 'pier' ? '#eacd7a' : '#9a8f7d'} />
              <circle cx={230 + i * 34} cy={170} r={7} fill={sel === 'pier' ? '#eacd7a' : '#9a8f7d'} />
            </g>
          ))}
        </g>
        {/* 十字桥面 */}
        <g onClick={() => setSel('deck')} style={{ cursor: 'pointer' }} opacity={dimOp(sel, 'deck')}>
          <rect x={60} y={132} width={340} height={36} fill={sel === 'deck' ? '#c9973b' : '#a37a4f'} stroke="#5c3a21" />
          <rect x={212} y={50} width={36} height={200} fill={sel === 'deck' ? '#c9973b' : '#a37a4f'} stroke="#5c3a21" />
        </g>
        {/* 翼桥 */}
        <g onClick={() => setSel('wing')} style={{ cursor: 'pointer' }} opacity={dimOp(sel, 'wing')}>
          <path d="M60 132 L40 110 L60 100 L80 132 Z" fill={sel === 'wing' ? '#eacd7a' : '#8a5c36'} />
          <path d="M400 132 L420 110 L400 100 L380 132 Z" fill={sel === 'wing' ? '#eacd7a' : '#8a5c36'} />
          <path d="M212 50 L190 30 L212 20 L232 50 Z" fill={sel === 'wing' ? '#eacd7a' : '#8a5c36'} />
        </g>
        <text x={230} y={155} textAnchor="middle" fontSize={12} fill="#241c14" className="font-serif-sc" fontWeight={700}>十字飞梁</text>
      </svg>
      {sel && (
        <div className="mt-3 rounded-xl border border-[#d8cdb4] bg-[#faf6ec] p-4">
          <div className="font-serif-sc text-lg font-bold text-[#2b2620]">{info[sel].t}</div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#5c5142]">{info[sel].d}</p>
        </div>
      )}
    </div>
  )
}
function dimOp(sel: string | null, id: string) {
  return sel === null || sel === id ? 1 : 0.4
}

// ---------- 华严寺：天宫楼阁壁藏 ----------
export function ShelfLab() {
  const [sel, setSel] = useState<string | null>('ge')
  const info: Record<string, { t: string; d: string }> = {
    ge: { t: '壁藏楼阁 38 间', d: '沿大殿三面墙壁而建的微缩藏经楼阁，上下两层，斗拱栏杆一应俱全——辽代小木作的“建筑的建筑”。' },
    qiao: { t: '飞桥凌空', d: '壁藏中部以飞桥跨越佛坛上空，桥上有天宫楼阁——梁思成称其为“海内孤品”。' },
    jing: { t: '藏经函', d: '楼阁内曾藏辽代大藏经五千余卷，“薄伽教藏”即“佛的经藏”之意。' },
  }
  return (
    <div>
      <svg viewBox="0 0 460 260" className="w-full h-auto">
        <rect x={20} y={20} width={420} height={220} rx={6} fill="#e8dfc9" stroke="#8a7f6a" />
        {/* 壁藏楼阁（上下两层重复） */}
        {[0, 1].map((row) => (
          <g key={row} onClick={() => setSel('ge')} style={{ cursor: 'pointer' }} opacity={dimOp(sel, 'ge')}>
            {Array.from({ length: 9 }).map((_, i) => {
              const x = 45 + i * 42
              const y = 60 + row * 70
              return (
                <g key={i}>
                  <rect x={x} y={y} width={30} height={26} fill={sel === 'ge' ? '#a37a4f' : '#b9a88e'} stroke="#5c3a21" strokeWidth={0.8} />
                  <path d={`M ${x - 4} ${y} L ${x + 15} ${y - 14} L ${x + 34} ${y} Z`} fill={sel === 'ge' ? '#46525c' : '#5d6b76'} />
                  <rect x={x + 11} y={y + 10} width={8} height={16} fill="#2b2620" />
                </g>
              )
            })}
          </g>
        ))}
        {/* 飞桥 */}
        <g onClick={() => setSel('qiao')} style={{ cursor: 'pointer' }} opacity={dimOp(sel, 'qiao')}>
          <path d="M170 210 Q230 165 290 210" fill="none" stroke={sel === 'qiao' ? CIN : WOOD} strokeWidth={5} />
          <path d="M170 210 L170 218 M290 210 L290 218" stroke={sel === 'qiao' ? CIN : WOOD} strokeWidth={3} />
          <text x={230} y={238} textAnchor="middle" fontSize={11} fill={sel === 'qiao' ? CIN : '#5c5142'} className="font-serif-sc">飞桥凌空跨越</text>
        </g>
        {/* 藏经函 */}
        <g onClick={() => setSel('jing')} style={{ cursor: 'pointer' }} opacity={dimOp(sel, 'jing')}>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={60 + i * 26} y={196} width={20} height={14} fill={sel === 'jing' ? '#c9a227' : '#8a6d1d'} rx={2} />
          ))}
          <text x={62} y={228} fontSize={11} fill="#8a6d1d" className="font-serif-sc">藏经函</text>
        </g>
      </svg>
      {sel && (
        <div className="mt-3 rounded-xl border border-[#d8cdb4] bg-[#faf6ec] p-4">
          <div className="font-serif-sc text-lg font-bold text-[#2b2620]">{info[sel].t}</div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#5c5142]">{info[sel].d}</p>
        </div>
      )}
    </div>
  )
}
