export type Point = { x: number; y: number }

export type Palette = {
  name: string
  colors: string[]
}

export type ArtworkSettings = {
  speed: number
  rippleWidth: number
  layers: number
  rotation: number
  complexity: number
  direction: 'inward' | 'outward'
}

export type RenderState = {
  shapePath: Path2D
  palette: string[]
  settings: ArtworkSettings
  phase: number
}
