import type { BuildingConfig } from './types'
import { yingxian } from './yingxian'
import { foguangsi } from './foguangsi'

export const SITES: BuildingConfig[] = [yingxian, foguangsi]

export function getSite(id: string | undefined): BuildingConfig {
  return SITES.find((s) => s.id === id) ?? yingxian
}
