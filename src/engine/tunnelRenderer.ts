import { interpolatePalette } from './colors'
import type { RenderState } from './types'

export function renderTunnel(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: RenderState,
): void {
  const { shapePath, settings, palette, phase } = state
  context.clearRect(0, 0, width, height)
  context.fillStyle = '#f3f2ee'
  context.fillRect(0, 0, width, height)

  const centerX = width / 2
  const centerY = height / 2
  const maxScale = Math.min(width, height) * 0.48
  const count = settings.layers
  const scaleRange = 1.45 + (settings.rippleWidth / 100) * 2.24
  const rotation = settings.rotation * (Math.PI / 180)
  const direction = settings.direction === 'inward' ? 1 : -1
  const outerFadeStart = -0.78
  const outerFadeEnd = -0.42
  const innerFadeStart = 0.96
  const innerFadeEnd = 1.32
  const layers = Array.from({ length: count }, (_, index) => {
    const position = ((index / count + phase * direction) % 1 + 1) % 1
    return [-2, -1, 0, 1, 2].map((cycle) => {
      const depth = position + cycle
      const fadeIn = Math.max(0, Math.min(1, (depth - outerFadeStart) / (outerFadeEnd - outerFadeStart)))
      const fadeOut = Math.max(0, Math.min(1, (innerFadeEnd - depth) / (innerFadeEnd - innerFadeStart)))
      const opacity = fadeIn * fadeIn * (3 - 2 * fadeIn)
        * fadeOut * fadeOut * (3 - 2 * fadeOut)
      return {
        depth,
        opacity,
        scale: maxScale * Math.exp(-depth * scaleRange),
      }
    })
  }).flat()
    .filter(({ depth }) => depth >= outerFadeStart && depth <= innerFadeEnd)
    .sort((left, right) => left.depth - right.depth)

  context.save()
  context.translate(centerX, centerY)
  context.rotate(rotation)
  context.translate(-centerX, -centerY)

  for (const layer of layers) {
    const { depth, opacity, scale } = layer
    const colorPosition = Math.min(0.985, Math.pow(Math.min(1, Math.max(0, depth)), 0.65) * 1.15)
    const color = interpolatePalette(palette, colorPosition)

    context.save()
    context.globalAlpha = opacity
    context.translate(centerX, centerY)
    context.scale(scale, scale)
    context.shadowColor = 'rgba(10, 25, 43, 0.21)'
    context.shadowBlur = Math.min(12, Math.max(1.5, scale * 0.035))
    context.shadowOffsetX = Math.min(4, scale * 0.009)
    context.shadowOffsetY = Math.min(5, scale * 0.018)
    context.fillStyle = color
    context.fill(shapePath)
    context.restore()

    context.save()
    context.globalAlpha = opacity
    context.translate(centerX, centerY)
    context.scale(scale, scale)
    context.clip(shapePath)
    context.lineWidth = Math.max(1.2, Math.min(4, scale * 0.018)) / scale
    context.strokeStyle = 'rgba(5, 17, 32, 0.20)'
    context.translate(0, Math.max(1, scale * 0.012) / scale)
    context.stroke(shapePath)
    context.restore()
  }

  context.restore()
}
