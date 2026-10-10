import type { BuildingConfig } from './types'
import { yingxian } from './yingxian'
import { foguangsi } from './foguangsi'
import { nanchansi, jinci, xuankongsi, huayansi, shanhuasi } from './batch1'
import { yonglegong, feihongta, shuanglinsi, zhenguosi, chongfusi } from './batch2'
import { bianjinglou, tiantaian, dayunyuan, longmensi, chongqingsi, faxingsi, qingliansi, yuhuangmiao } from './batch3'

export const SITES: BuildingConfig[] = [
  yingxian,
  foguangsi,
  nanchansi,
  jinci,
  xuankongsi,
  huayansi,
  shanhuasi,
  yonglegong,
  feihongta,
  shuanglinsi,
  zhenguosi,
  chongfusi,
  bianjinglou,
  tiantaian,
  dayunyuan,
  longmensi,
  chongqingsi,
  faxingsi,
  qingliansi,
  yuhuangmiao,
]

export function getSite(id: string | undefined): BuildingConfig {
  return SITES.find((s) => s.id === id) ?? yingxian
}
