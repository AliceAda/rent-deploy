// ===== 房源图片生成器 =====
// 后端没有真实房源照片前，用确定性室内插画 SVG 替代渐变占位：
// 同一房源每次展示一致；不同房源按 id 取不同配色与布局。
// 接真实图片后，把调用处换成 `house.coverImage` 即可整体替换。
import { HOUSE_GRADS } from './grads'

export type HouseScene = 'living' | 'bedroom' | 'kitchen' | 'bath' | 'foyer'

export const SCENE_NAMES: Record<HouseScene, string> = {
  living: '客厅',
  bedroom: '卧室',
  kitchen: '厨房',
  bath: '卫生间',
  foyer: '玄关'
}

interface Palette {
  wall: [string, string] // 墙竖渐变
  floor: [string, string] // 地板横渐变
  accent: string // 主家具色
  accent2: string // 次家具色
  wood: string // 深木色
  sun: string // 窗外天色
}

// 从现有 4 组品牌渐变派生语义色板（第一版配色）
const PALETTES: Palette[] = [
  { wall: ['#eaf1ff', '#d7e3ff'], floor: ['#c9a585', '#b08d6a'], accent: '#2DD4BF', accent2: '#8aa8ff', wood: '#8a6a4c', sun: '#bfe0ff' },
  { wall: ['#fff1e6', '#ffe3cf'], floor: ['#cbb094', '#b39272'], accent: '#ff8f52', accent2: '#ffb088', wood: '#93683f', sun: '#ffe9c4' },
  { wall: ['#e9f7ef', '#d7f0e2'], floor: ['#c3a98d', '#ab8f70'], accent: '#3fbf83', accent2: '#7cd4a8', wood: '#7d6142', sun: '#d8f0d8' },
  { wall: ['#f0ecff', '#e2daff'], floor: ['#c6ad95', '#ad9278'], accent: '#8f6ef2', accent2: '#b09af7', wood: '#7a6044', sun: '#e3d8ff' }
]

// 简单确定性 hash：id + salt → 0..1
function hash(id: number, salt: number): number {
  const x = Math.sin(id * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

function paletteOf(id: number): Palette {
  return PALETTES[Math.abs(id) % PALETTES.length]
}

function grain(): string {
  return '<filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.06"/></feComponentTransfer><feComposite operator="over" in2="SourceGraphic"/></filter>'
}

// 窗（含天空与城市剪影）
function windowBlock(x: number, y: number, w: number, h: number, p: Palette, seed: number): string {
  const sky = ['#bfe0ff', '#d8ecff', '#ffe9c4'][Math.floor(hash(seed, 7) * 3)]
  const bld = ['#c7d3e6', '#b9c8e0', '#d3c9b8'][Math.floor(hash(seed, 8) * 3)]
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#fff"/>
  <rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" rx="3" fill="${sky}"/>
  <rect x="${x + 6}" y="${y + h - 46}" width="${w - 12}" height="40" fill="${bld}" opacity="0.75"/>
  <rect x="${x + 6 + w * 0.28}" y="${y + h - 66}" width="30" height="60" fill="${bld}" opacity="0.55"/>
  <rect x="${x + w * 0.36}" y="${y + 8}" width="8" height="${h - 20}" fill="#fff" opacity="0.9"/>
  <rect x="${x + w * 0.68}" y="${y + 8}" width="8" height="${h - 20}" fill="#fff" opacity="0.9"/>
  <rect x="${x + 10}" y="${y + h / 2 - 4}" width="${w - 20}" height="8" fill="#fff" opacity="0.9"/>
  <line x1="${x + 6}" y1="${y + h - 6}" x2="${x + w - 6}" y2="${y + h - 6}" stroke="#fff" stroke-width="5"/>
  <rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" rx="3" fill="none" stroke="#fff" stroke-width="2" opacity="0.55"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" stroke="#e8ecf2" stroke-width="3"/>
  <rect x="${x}" y="${y + h}" width="${w}" height="14" fill="#fff"/>
  <rect x="${x}" y="${y + h}" width="${w}" height="14" fill="${p.floor[0]}" opacity="0.35"/>`
}

// 地板
function floor(y: number, p: Palette, seed: number): string {
  let lines = ''
  const gap = 90 + Math.floor(hash(seed, 3) * 40)
  for (let x = 20; x < 600; x += gap) {
    lines += `<line x1="${x}" y1="${y}" x2="${x}" y2="400" stroke="#000" stroke-opacity="0.08" stroke-width="2"/>`
  }
  return `
  <rect y="${y}" width="600" height="${400 - y}" fill="${p.floor[0]}"/>
  <rect y="${y}" width="600" height="${400 - y}" fill="url(#fl)" opacity="0.5"/>
  ${lines}
  <rect y="${y}" width="600" height="6" fill="#000" fill-opacity="0.12"/>
  <defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.25"/><stop offset="1" stop-color="#000" stop-opacity="0.18"/></linearGradient></defs>`
}

// 植物
function plant(x: number, y: number, p: Palette, seed: number): string {
  const pot = ['#b9855f', '#a9744f', '#c98f5f'][Math.floor(hash(seed, 11) * 3)]
  const leaf = ['#4caf7d', '#3f9c6d', '#5cbb88'][Math.floor(hash(seed, 12) * 3)]
  return `
  <path d="M${x + 14} ${y} Q${x + 4} ${y - 34} ${x - 6} ${y - 46} Q${x + 6} ${y - 42} ${x + 12} ${y - 26} Q${x + 22} ${y - 48} ${x + 34} ${y - 50} Q${x + 30} ${y - 34} ${x + 22} ${y - 22} Z" fill="${leaf}"/>
  <path d="M${x + 14} ${y} Q${x + 12} ${y - 30} ${x + 2} ${y - 40} Q${x + 16} ${y - 26} ${x + 22} ${y - 18} Z" fill="${leaf}" opacity="0.85"/>
  <rect x="${x}" y="${y}" width="28" height="26" rx="4" fill="${pot}"/>
  <rect x="${x + 2}" y="${y + 4}" width="24" height="3" rx="1.5" fill="#000" opacity="0.15"/>
  <rect x="${x + 8}" y="${y + 26}" width="12" height="8" fill="#000" opacity="0.18"/>`
}

function living(id: number): string {
  const p = paletteOf(id)
  const s = hash(id, 1)
  const sofaX = 40 + s * 30
  const sofa = ['#2DD4BF', '#ff8f52', '#3fbf83', '#8f6ef2'][Math.abs(id) % 4]
  return `
  <rect width="600" height="400" fill="#fff"/>
  <defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.wall[0]}"/><stop offset="1" stop-color="${p.wall[1]}"/></linearGradient></defs>
  <rect width="600" height="272" fill="url(#w)"/>
  <rect width="600" height="272" fill="#fff" opacity="0.05"/>
  <rect x="0" y="272" width="600" height="128" fill="${p.floor[0]}"/>
  <rect x="0" y="272" width="600" height="128" fill="url(#fl)" opacity="0.5"/>
  <defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.25"/><stop offset="1" stop-color="#000" stop-opacity="0.18"/></linearGradient></defs>
  <line x1="150" y1="272" x2="150" y2="400" stroke="#000" stroke-opacity="0.07" stroke-width="2"/>
  <line x1="290" y1="272" x2="290" y2="400" stroke="#000" stroke-opacity="0.07" stroke-width="2"/>
  <line x1="440" y1="272" x2="440" y2="400" stroke="#000" stroke-opacity="0.07" stroke-width="2"/>
  <rect y="272" width="600" height="6" fill="#000" fill-opacity="0.12"/>
  ${windowBlock(380, 56, 160, 196, p, id)}
  <rect x="${sofaX + 20}" y="120" width="120" height="8" rx="4" fill="${p.wood}"/>
  <rect x="${sofaX}" y="128" width="150" height="104" rx="14" fill="${sofa}"/>
  <rect x="${sofaX}" y="128" width="150" height="44" rx="14" fill="#fff" opacity="0.14"/>
  <rect x="${sofaX + 6}" y="172" width="138" height="60" rx="10" fill="${sofa}" opacity="0.88"/>
  <rect x="${sofaX + 6}" y="172" width="138" height="12" rx="6" fill="#fff" opacity="0.18"/>
  <rect x="${sofaX - 10}" y="142" width="16" height="90" rx="7" fill="${sofa}" opacity="0.9"/>
  <rect x="${sofaX + 144}" y="142" width="16" height="90" rx="7" fill="${sofa}" opacity="0.9"/>
  <rect x="${sofaX + 46}" y="160" width="58" height="14" rx="7" fill="#fff" opacity="0.3"/>
  <rect x="${sofaX + 70}" y="232" width="14" height="10" fill="#000" opacity="0.14"/>
  <rect x="${sofaX + 120}" y="232" width="14" height="10" fill="#000" opacity="0.14"/>
  <rect x="${sofaX + 40}" y="198" width="46" height="34" rx="3" fill="#fff" opacity="0.85"/>
  <rect x="${sofaX + 42}" y="200" width="20" height="30" fill="#c8d8f0"/>
  <rect x="${sofaX + 64}" y="200" width="20" height="30" fill="#f2c4c4"/>
  <ellipse cx="${sofaX + 88}" cy="206" rx="26" ry="6" fill="#000" opacity="0.1"/>
  <rect x="${sofaX + 166}" y="238" width="6" height="26" fill="${p.wood}"/>
  <rect x="${sofaX + 178}" y="264" width="40" height="8" rx="4" fill="${p.wood}"/>
  ${plant(sofaX + 196, 236, p, id)}
  <rect x="220" y="86" width="70" height="6" rx="3" fill="${p.wood}"/>
  <path d="M220 92 Q220 74 234 68 Q248 62 262 68 Q276 74 276 92 Z" fill="#fff" opacity="0.85"/>
  <rect x="226" y="92" width="6" height="4" fill="#f2c9a0"/>
  <rect x="240" y="92" width="6" height="4" fill="#cfe3f2"/>
  <rect x="254" y="92" width="6" height="4" fill="#f2c9a0"/>
  <rect x="30" y="120" width="96" height="64" rx="4" fill="#fff" opacity="0.6"/>
  <rect x="36" y="126" width="84" height="52" rx="2" fill="${p.accent2}" opacity="0.55"/>
  <rect x="36" y="126" width="34" height="52" fill="#fff" opacity="0.25"/>
  <rect x="18" y="300" width="10" height="72" fill="${p.wood}"/>
  <rect x="8" y="294" width="30" height="10" rx="5" fill="${p.accent}"/>
  <rect x="4" y="300" width="38" height="72" fill="${p.accent}" opacity="0.35"/>
  <rect x="96" y="300" width="10" height="72" fill="${p.wood}"/>
  <rect x="86" y="294" width="30" height="10" rx="5" fill="${p.accent}"/>
  <rect x="82" y="300" width="38" height="72" fill="${p.accent}" opacity="0.35"/>
  <rect x="560" y="200" width="22" height="80" rx="6" fill="#e8ecf2"/>
  <rect x="552" y="192" width="38" height="12" rx="6" fill="#d3d9e2"/>
  <rect x="552" y="204" width="38" height="8" rx="4" fill="#fff" opacity="0.5"/>
  ${grain()}
  <rect width="600" height="400" filter="url(#g)"/>`
}

function bedroom(id: number): string {
  const p = paletteOf(id)
  const bed = ['#8fb6f5', '#ffb088', '#7cd4a8', '#b09af7'][Math.abs(id) % 4]
  const s = hash(id, 2)
  const bedX = 40 + s * 20
  return `
  <rect width="600" height="400" fill="#fff"/>
  <defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.wall[0]}"/><stop offset="1" stop-color="${p.wall[1]}"/></linearGradient></defs>
  <rect width="600" height="286" fill="url(#w)"/>
  <rect y="286" width="600" height="114" fill="${p.floor[0]}"/>
  <rect y="286" width="600" height="114" fill="url(#fl)" opacity="0.5"/>
  <defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.25"/><stop offset="1" stop-color="#000" stop-opacity="0.18"/></linearGradient></defs>
  <line x1="180" y1="286" x2="180" y2="400" stroke="#000" stroke-opacity="0.07" stroke-width="2"/>
  <line x1="360" y1="286" x2="360" y2="400" stroke="#000" stroke-opacity="0.07" stroke-width="2"/>
  <line x1="520" y1="286" x2="520" y2="400" stroke="#000" stroke-opacity="0.07" stroke-width="2"/>
  <rect y="286" width="600" height="6" fill="#000" fill-opacity="0.12"/>
  ${windowBlock(390, 64, 150, 176, p, id)}
  <rect x="200" y="76" width="18" height="210" rx="4" fill="${p.wood}"/>
  <rect x="210" y="96" width="110" height="190" rx="6" fill="${p.wood}"/>
  <rect x="300" y="76" width="18" height="210" rx="4" fill="${p.wood}"/>
  <rect x="212" y="100" width="106" height="186" rx="4" fill="${bed}"/>
  <rect x="212" y="100" width="106" height="60" rx="4" fill="#fff" opacity="0.22"/>
  <rect x="${bedX}" y="150" width="140" height="52" rx="8" fill="#fff"/>
  <rect x="${bedX + 6}" y="156" width="46" height="46" rx="6" fill="#f4f7fb"/>
  <rect x="${bedX + 58}" y="156" width="46" height="46" rx="6" fill="#e9eef5"/>
  <rect x="${bedX + 8}" y="160" width="18" height="18" rx="3" fill="#fff"/>
  <rect x="${bedX + 60}" y="160" width="18" height="18" rx="3" fill="#fff"/>
  <rect x="${bedX + 6}" y="202" width="128" height="16" rx="6" fill="${bed}" opacity="0.85"/>
  <rect x="${bedX}" y="202" width="140" height="40" rx="6" fill="${p.accent2}" opacity="0.8"/>
  <rect x="${bedX}" y="202" width="140" height="12" rx="6" fill="#fff" opacity="0.25"/>
  <rect x="${bedX + 6}" y="242" width="12" height="14" fill="#000" opacity="0.16"/>
  <rect x="${bedX + 122}" y="242" width="12" height="14" fill="#000" opacity="0.16"/>
  <rect x="${bedX + 150}" y="204" width="40" height="52" rx="4" fill="${p.wood}"/>
  <rect x="${bedX + 156}" y="194" width="16" height="30" rx="8" fill="${p.accent}"/>
  <rect x="${bedX + 160}" y="196" width="8" height="8" rx="4" fill="#ffe9b8"/>
  <ellipse cx="${bedX + 164}" cy="198" rx="16" ry="12" fill="#ffe9b8" opacity="0.35"/>
  <rect x="${bedX + 132}" y="256" width="6" height="18" fill="#000" opacity="0.14"/>
  <rect x="${bedX + 192}" y="264" width="7" height="10" fill="#000" opacity="0.14"/>
  <rect x="536" y="150" width="50" height="136" rx="4" fill="${p.wood}"/>
  <rect x="540" y="156" width="42" height="124" rx="2" fill="#c9b48f"/>
  <rect x="540" y="156" width="42" height="124" rx="2" fill="#fff" opacity="0.1"/>
  <rect x="544" y="160" width="34" height="60" rx="2" fill="#b6a17c" opacity="0.7"/>
  <rect x="544" y="224" width="34" height="52" rx="2" fill="#b6a17c" opacity="0.5"/>
  <rect x="552" y="160" width="8" height="116" rx="2" fill="${p.accent}"/>
  ${plant(36, 268, p, id)}
  ${grain()}
  <rect width="600" height="400" filter="url(#g)"/>`
}

function kitchen(id: number): string {
  const p = paletteOf(id)
  const cab = ['#5f7ea8', '#a8775a', '#5f9c7a', '#7d6ba8'][Math.abs(id) % 4]
  return `
  <rect width="600" height="400" fill="#fff"/>
  <defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.wall[0]}"/><stop offset="1" stop-color="${p.wall[1]}"/></linearGradient></defs>
  <rect width="600" height="262" fill="url(#w)"/>
  <rect y="262" width="600" height="138" fill="${p.floor[0]}"/>
  <rect y="262" width="600" height="138" fill="url(#fl)" opacity="0.5"/>
  <defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.25"/><stop offset="1" stop-color="#000" stop-opacity="0.18"/></linearGradient></defs>
  <line x1="200" y1="262" x2="200" y2="400" stroke="#000" stroke-opacity="0.07" stroke-width="2"/>
  <line x1="400" y1="262" x2="400" y2="400" stroke="#000" stroke-opacity="0.07" stroke-width="2"/>
  <rect y="262" width="600" height="6" fill="#000" fill-opacity="0.12"/>
  <rect x="40" y="172" width="180" height="90" rx="6" fill="${cab}"/>
  <rect x="40" y="172" width="180" height="10" rx="5" fill="#fff" opacity="0.16"/>
  <rect x="52" y="186" width="52" height="62" rx="4" fill="#fff" opacity="0.12"/>
  <rect x="112" y="186" width="52" height="62" rx="4" fill="#fff" opacity="0.12"/>
  <rect x="172" y="186" width="36" height="62" rx="4" fill="#fff" opacity="0.1"/>
  <rect x="40" y="92" width="180" height="64" rx="6" fill="${cab}" opacity="0.92"/>
  <rect x="40" y="92" width="180" height="8" rx="4" fill="#fff" opacity="0.14"/>
  <rect x="52" y="104" width="52" height="40" rx="4" fill="#fff" opacity="0.12"/>
  <rect x="112" y="104" width="52" height="40" rx="4" fill="#fff" opacity="0.12"/>
  <rect x="172" y="104" width="36" height="40" rx="4" fill="#fff" opacity="0.1"/>
  <rect x="40" y="262" width="520" height="20" rx="4" fill="#d8dde4"/>
  <rect x="40" y="262" width="520" height="4" fill="#fff" opacity="0.6"/>
  <rect x="60" y="282" width="120" height="78" rx="4" fill="${p.wood}"/>
  <rect x="60" y="282" width="120" height="10" rx="5" fill="#fff" opacity="0.14"/>
  <rect x="70" y="296" width="44" height="50" rx="3" fill="#fff" opacity="0.1"/>
  <rect x="120" y="296" width="44" height="50" rx="3" fill="#fff" opacity="0.1"/>
  <rect x="200" y="282" width="120" height="78" rx="4" fill="${p.wood}"/>
  <rect x="200" y="282" width="120" height="10" rx="5" fill="#fff" opacity="0.14"/>
  <rect x="210" y="296" width="44" height="50" rx="3" fill="#fff" opacity="0.1"/>
  <rect x="260" y="296" width="44" height="50" rx="3" fill="#fff" opacity="0.1"/>
  <rect x="340" y="282" width="100" height="14" rx="4" fill="#c3c9d2"/>
  <rect x="356" y="296" width="70" height="8" rx="4" fill="#aab2bd"/>
  <ellipse cx="392" cy="300" rx="20" ry="6" fill="#2f3540"/>
  <ellipse cx="392" cy="298" rx="16" ry="4" fill="#4a515e"/>
  <rect x="360" y="306" width="60" height="6" rx="3" fill="#8d939d"/>
  <rect x="460" y="282" width="100" height="78" rx="4" fill="${cab}" opacity="0.9"/>
  <rect x="460" y="282" width="100" height="10" rx="5" fill="#fff" opacity="0.14"/>
  <rect x="470" y="298" width="80" height="46" rx="3" fill="#fff" opacity="0.1"/>
  <rect x="470" y="300" width="80" height="4" fill="#fff" opacity="0.12"/>
  <rect x="470" y="310" width="80" height="4" fill="#fff" opacity="0.12"/>
  <rect x="470" y="320" width="80" height="4" fill="#fff" opacity="0.12"/>
  ${windowBlock(300, 60, 120, 150, p, id)}
  <rect x="470" y="60" width="90" height="200" rx="8" fill="#dfe4ea"/>
  <rect x="480" y="66" width="70" height="188" rx="4" fill="#f2f4f7"/>
  <line x1="480" y1="120" x2="550" y2="120" stroke="#dfe4ea" stroke-width="3"/>
  <line x1="480" y1="190" x2="550" y2="190" stroke="#dfe4ea" stroke-width="3"/>
  <rect x="476" y="60" width="8" height="200" fill="#c9cfd8"/>
  ${grain()}
  <rect width="600" height="400" filter="url(#g)"/>`
}

function bath(id: number): string {
  const p = paletteOf(id)
  const tile = ['#bcd7ef', '#efd3c2', '#bfe3cf', '#d5ccf2'][Math.abs(id) % 4]
  return `
  <rect width="600" height="400" fill="#fff"/>
  <defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.wall[0]}"/><stop offset="1" stop-color="${p.wall[1]}"/></linearGradient></defs>
  <rect width="600" height="300" fill="url(#w)"/>
  <rect width="600" height="300" fill="${tile}" opacity="0.28"/>
  <line x1="0" y1="75" x2="600" y2="75" stroke="#fff" stroke-opacity="0.6" stroke-width="2"/>
  <line x1="0" y1="150" x2="600" y2="150" stroke="#fff" stroke-opacity="0.6" stroke-width="2"/>
  <line x1="0" y1="225" x2="600" y2="225" stroke="#fff" stroke-opacity="0.6" stroke-width="2"/>
  <line x1="100" y1="0" x2="100" y2="300" stroke="#fff" stroke-opacity="0.6" stroke-width="2"/>
  <line x1="200" y1="0" x2="200" y2="300" stroke="#fff" stroke-opacity="0.6" stroke-width="2"/>
  <line x1="300" y1="0" x2="300" y2="300" stroke="#fff" stroke-opacity="0.6" stroke-width="2"/>
  <line x1="400" y1="0" x2="400" y2="300" stroke="#fff" stroke-opacity="0.6" stroke-width="2"/>
  <line x1="500" y1="0" x2="500" y2="300" stroke="#fff" stroke-opacity="0.6" stroke-width="2"/>
  <rect y="300" width="600" height="100" fill="${p.floor[0]}"/>
  <rect y="300" width="600" height="100" fill="url(#fl)" opacity="0.5"/>
  <defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.25"/><stop offset="1" stop-color="#000" stop-opacity="0.18"/></linearGradient></defs>
  <line x1="200" y1="300" x2="200" y2="400" stroke="#000" stroke-opacity="0.07" stroke-width="2"/>
  <line x1="400" y1="300" x2="400" y2="400" stroke="#000" stroke-opacity="0.07" stroke-width="2"/>
  <rect y="300" width="600" height="6" fill="#000" fill-opacity="0.12"/>
  <rect x="60" y="200" width="220" height="100" rx="18" fill="#fff"/>
  <rect x="60" y="200" width="220" height="100" rx="18" fill="#e8eef5" opacity="0.5"/>
  <rect x="72" y="212" width="196" height="76" rx="14" fill="#dfe7f0" opacity="0.8"/>
  <rect x="72" y="212" width="196" height="16" rx="8" fill="#cfe0f0"/>
  <ellipse cx="170" cy="270" rx="70" ry="8" fill="#b8d8ef" opacity="0.7"/>
  <rect x="66" y="300" width="14" height="12" fill="#000" opacity="0.12"/>
  <rect x="260" y="300" width="14" height="12" fill="#000" opacity="0.12"/>
  <rect x="330" y="150" width="130" height="150" rx="8" fill="#fff"/>
  <rect x="330" y="150" width="130" height="150" rx="8" fill="#eef2f6" opacity="0.6"/>
  <rect x="352" y="170" width="86" height="110" rx="4" fill="#f7fafc"/>
  <ellipse cx="395" cy="186" rx="30" ry="8" fill="#d8e4f0"/>
  <rect x="360" y="200" width="70" height="8" rx="4" fill="#c6d2de"/>
  <rect x="368" y="216" width="54" height="6" rx="3" fill="#d3dce4"/>
  <rect x="352" y="162" width="10" height="150" rx="3" fill="#dfe6ec"/>
  <rect x="336" y="150" width="24" height="10" rx="4" fill="#f0e7c9"/>
  <rect x="336" y="150" width="24" height="10" rx="4" fill="#ffe9b8" opacity="0.7"/>
  <rect x="500" y="220" width="56" height="80" rx="10" fill="#fff"/>
  <rect x="500" y="220" width="56" height="80" rx="10" fill="#eef2f6" opacity="0.7"/>
  <rect x="512" y="236" width="32" height="44" rx="8" fill="#dfe6ec"/>
  <rect x="518" y="236" width="20" height="6" rx="3" fill="#fff"/>
  <rect x="496" y="214" width="64" height="10" rx="5" fill="#e3e8ee"/>
  <rect x="504" y="300" width="12" height="12" fill="#000" opacity="0.12"/>
  <rect x="540" y="300" width="12" height="12" fill="#000" opacity="0.12"/>
  <rect x="50" y="320" width="120" height="16" rx="6" fill="${p.accent2}" opacity="0.65"/>
  ${grain()}
  <rect width="600" height="400" filter="url(#g)"/>`
}

function foyer(id: number): string {
  const p = paletteOf(id)
  const shoe = ['#8a6a4c', '#a8775a', '#7d6142', '#6f5a68'][Math.abs(id) % 4]
  return `
  <rect width="600" height="400" fill="#fff"/>
  <defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.wall[0]}"/><stop offset="1" stop-color="${p.wall[1]}"/></linearGradient></defs>
  <rect width="600" height="290" fill="url(#w)"/>
  <rect y="290" width="600" height="110" fill="${p.floor[0]}"/>
  <rect y="290" width="600" height="110" fill="url(#fl)" opacity="0.5"/>
  <defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.25"/><stop offset="1" stop-color="#000" stop-opacity="0.18"/></linearGradient></defs>
  <line x1="200" y1="290" x2="200" y2="400" stroke="#000" stroke-opacity="0.07" stroke-width="2"/>
  <line x1="400" y1="290" x2="400" y2="400" stroke="#000" stroke-opacity="0.07" stroke-width="2"/>
  <rect y="290" width="600" height="6" fill="#000" fill-opacity="0.12"/>
  <rect x="150" y="140" width="60" height="150" rx="4" fill="${p.wood}"/>
  <rect x="150" y="140" width="60" height="150" rx="4" fill="#fff" opacity="0.1"/>
  <rect x="160" y="150" width="12" height="48" rx="4" fill="#c9d6e8"/>
  <rect x="186" y="150" width="12" height="48" rx="4" fill="#d8c8b8"/>
  <rect x="160" y="206" width="12" height="48" rx="4" fill="#c9d6e8"/>
  <rect x="186" y="206" width="12" height="48" rx="4" fill="#d8c8b8"/>
  <rect x="160" y="262" width="12" height="24" rx="3" fill="#b9c4d4"/>
  <rect x="186" y="262" width="12" height="24" rx="3" fill="#c9b8a8"/>
  <rect x="160" y="152" width="4" height="112" rx="2" fill="#fff" opacity="0.4"/>
  <rect x="240" y="120" width="40" height="170" rx="4" fill="${p.wood}"/>
  <rect x="240" y="120" width="40" height="170" rx="4" fill="#fff" opacity="0.08"/>
  <rect x="248" y="128" width="24" height="34" rx="3" fill="#d8c8b8"/>
  <rect x="248" y="170" width="24" height="34" rx="3" fill="#c9d6e8"/>
  <rect x="248" y="212" width="24" height="30" rx="3" fill="#d8c8b8"/>
  <rect x="248" y="250" width="24" height="32" rx="3" fill="#c9d6e8"/>
  <rect x="320" y="240" width="70" height="50" rx="6" fill="${shoe}"/>
  <rect x="320" y="240" width="70" height="14" rx="6" fill="#fff" opacity="0.16"/>
  <rect x="330" y="256" width="18" height="30" rx="3" fill="#fff" opacity="0.1"/>
  <rect x="356" y="256" width="18" height="30" rx="3" fill="#fff" opacity="0.1"/>
  <rect x="330" y="290" width="8" height="10" fill="#000" opacity="0.16"/>
  <rect x="366" y="290" width="8" height="10" fill="#000" opacity="0.16"/>
  <rect x="414" y="252" width="120" height="20" rx="5" fill="${p.accent2}" opacity="0.8"/>
  <rect x="414" y="252" width="120" height="8" rx="4" fill="#fff" opacity="0.3"/>
  <rect x="430" y="204" width="88" height="48" rx="6" fill="#f7f9fc"/>
  <rect x="430" y="204" width="88" height="48" rx="6" fill="#eef2f6" opacity="0.7"/>
  <rect x="436" y="210" width="76" height="10" rx="4" fill="#dfe6ec"/>
  <rect x="436" y="226" width="76" height="10" rx="4" fill="#dfe6ec"/>
  <rect x="436" y="242" width="50" height="6" rx="3" fill="#e6ebf0"/>
  <circle cx="452" cy="190" r="10" fill="#f0e7c9"/>
  <circle cx="452" cy="190" r="10" fill="#ffe9b8" opacity="0.8"/>
  <rect x="432" y="170" width="40" height="8" rx="4" fill="#e8ecf2"/>
  <rect x="448" y="170" width="6" height="14" rx="3" fill="#e8ecf2"/>
  <rect x="40" y="330" width="140" height="26" rx="8" fill="${p.accent}" opacity="0.7"/>
  <rect x="48" y="322" width="10" height="16" rx="4" fill="#d9dee6"/>
  <rect x="70" y="322" width="10" height="16" rx="4" fill="#d9dee6"/>
  <rect x="150" y="330" width="140" height="26" rx="8" fill="${p.accent2}" opacity="0.55"/>
  <rect x="430" y="90" width="120" height="90" rx="8" fill="${p.accent2}" opacity="0.35"/>
  <rect x="440" y="100" width="100" height="70" rx="4" fill="#fff" opacity="0.3"/>
  <circle cx="490" cy="135" r="22" fill="${p.accent}" opacity="0.7"/>
  <rect x="486" y="120" width="8" height="8" rx="4" fill="#fff" opacity="0.4"/>
  ${grain()}
  <rect width="600" height="400" filter="url(#g)"/>`
}

const SCENES: Record<HouseScene, (id: number) => string> = {
  living,
  bedroom,
  kitchen,
  bath,
  foyer
}

/** 生成房源某场景的 SVG data-URI 背景（确定性：同一房源永远同图） */
export function houseImg(id: number, scene: HouseScene = 'living'): string {
  const svg = SCENES[scene](id)
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

/** 房源封面主图（列表卡片）：客厅 + 按 id 微调 */
export function houseCover(id: number): string {
  return houseImg(id, 'living')
}

/** 详情页画廊场景顺序（主图在前） */
export const GALLERY_SCENES: HouseScene[] = ['living', 'bedroom', 'kitchen', 'bath']
