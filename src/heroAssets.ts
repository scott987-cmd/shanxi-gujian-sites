const HERO_BASES = [
  'https://gcore.jsdelivr.net/gh/scott987-cmd/shanxi-gujian-sites@6c9d465c03508120f9187d41d8a46fcb1c4f55b7/heroes',
  'https://fastly.jsdelivr.net/gh/scott987-cmd/shanxi-gujian-sites@6c9d465c03508120f9187d41d8a46fcb1c4f55b7/heroes',
]

export function heroUrl(path: string, node = 0): string {
  return `${HERO_BASES[node]}/${path}`
}
