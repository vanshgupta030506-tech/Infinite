export const palettes = [
  { name: 'Abyss', colors: ['#b9d9f2', '#3989d5', '#071426'] },
  { name: 'Glacier', colors: ['#d5edf2', '#63b9ca', '#123b69'] },
  { name: 'Ultraviolet', colors: ['#e4d9f3', '#9273d1', '#21143f'] },
  { name: 'Ember', colors: ['#f5dfc7', '#d97548', '#421d2a'] },
  { name: 'Monochrome', colors: ['#e5e5e5', '#858b93', '#17191c'] },
  { name: 'Moss', colors: ['#d5e0c8', '#6f986b', '#263823'] },
]

function parseHex(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '')
  const value = normalized.length === 3
    ? normalized.split('').map((character) => character + character).join('')
    : normalized
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ]
}

type LabColor = [number, number, number]

function toLinear(channel: number): number {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function toLab(color: [number, number, number]): LabColor {
  const [red, green, blue] = color.map(toLinear)
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue)
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue)
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function fromLab([lightness, a, b]: LabColor): [number, number, number] {
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  const toSrgb = (channel: number) => {
    const linear = Math.max(0, Math.min(1, channel))
    return Math.round((linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055) * 255)
  }
  return [
    toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}

function toHex(value: number): string {
  return value.toString(16).padStart(2, '0')
}

export function interpolatePalette(colors: string[], amount: number): string {
  if (colors.length === 0) return '#000000'
  if (colors.length === 1) return colors[0]
  const position = Math.max(0, Math.min(1, amount)) * (colors.length - 1)
  const start = Math.min(Math.floor(position), colors.length - 2)
  const local = position - start
  const left = toLab(parseHex(colors[start]))
  const right = toLab(parseHex(colors[start + 1]))
  const blended: LabColor = [
    left[0] + (right[0] - left[0]) * local,
    left[1] + (right[1] - left[1]) * local,
    left[2] + (right[2] - left[2]) * local,
  ]
  return `#${fromLab(blended).map(toHex).join('')}`
}
