import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Eraser, Pencil, X } from 'lucide-react'
import { createSmoothShapePath, defaultShape, normalizePoints, simplifyPoints } from '../engine/shapeGeometry'
import { renderTunnel } from '../engine/tunnelRenderer'
import type { ArtworkSettings, Point } from '../engine/types'
import type { PointerEvent } from 'react'

type ArtworkCanvasProps = {
  points: Point[]
  palette: string[]
  settings: ArtworkSettings
  playing: boolean
  onShapeChange: (points: Point[]) => void
}

export default function ArtworkCanvas({
  points,
  palette,
  settings,
  playing,
  onShapeChange,
}: ArtworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phaseRef = useRef(0)
  const frameRef = useRef(0)
  const previousTimeRef = useRef<number | null>(null)
  const drawingRef = useRef<Point[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [stroke, setStroke] = useState<Point[]>([])
  const shapePath = useMemo(
    () => createSmoothShapePath(points, settings.complexity / 100),
    [points, settings.complexity],
  )

  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    if (previousTimeRef.current !== null && playing) {
      const elapsed = Math.min(timestamp - previousTimeRef.current, 50)
      phaseRef.current = (phaseRef.current + (elapsed / 1000) * (0.025 + settings.speed / 220)) % 1
    }
    previousTimeRef.current = timestamp

    const bounds = canvas.getBoundingClientRect()
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    const pixelWidth = Math.round(bounds.width * pixelRatio)
    const pixelHeight = Math.round(bounds.height * pixelRatio)
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth
      canvas.height = pixelHeight
    }
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    renderTunnel(context, bounds.width, bounds.height, {
      shapePath,
      palette,
      settings,
      phase: phaseRef.current,
    })

    if (isDrawing && stroke.length > 1) {
      context.save()
      context.beginPath()
      context.moveTo(stroke[0].x * bounds.width, stroke[0].y * bounds.height)
      for (const point of stroke.slice(1)) context.lineTo(point.x * bounds.width, point.y * bounds.height)
      context.closePath()
      context.strokeStyle = '#182b41'
      context.lineWidth = 2
      context.setLineDash([6, 5])
      context.stroke()
      context.restore()
    }
    if (playing) frameRef.current = requestAnimationFrame(draw)
  }, [isDrawing, palette, playing, settings, shapePath, stroke])

  useEffect(() => {
    previousTimeRef.current = null
    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [draw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => {
      if (playing) return
      cancelAnimationFrame(frameRef.current)
      frameRef.current = requestAnimationFrame(draw)
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [draw, playing])

  const pointerPoint = (event: PointerEvent<HTMLCanvasElement>): Point => {
    const bounds = event.currentTarget.getBoundingClientRect()
    return { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height }
  }

  const collectPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const point = pointerPoint(event)
    drawingRef.current.push({
      x: (point.x * bounds.width - bounds.width / 2) / Math.min(bounds.width, bounds.height),
      y: (point.y * bounds.height - bounds.height / 2) / Math.min(bounds.width, bounds.height),
    })
    setStroke([...drawingRef.current].map((item) => ({
      x: 0.5 + item.x * Math.min(bounds.width, bounds.height) / bounds.width,
      y: 0.5 + item.y * Math.min(bounds.width, bounds.height) / bounds.height,
    })))
  }

  const finishDrawing = () => {
    if (!isDrawing || drawingRef.current.length < 3) {
      drawingRef.current = []
      setStroke([])
      return
    }
    const simplified = simplifyPoints(drawingRef.current, 0.012)
    onShapeChange(normalizePoints(simplified))
    drawingRef.current = []
    setStroke([])
    setIsDrawing(false)
  }

  const cancelDrawing = () => {
    drawingRef.current = []
    setStroke([])
  }

  const toggleDrawing = () => {
    drawingRef.current = []
    setStroke([])
    setIsDrawing(!isDrawing)
  }

  return (
    <div className={`artwork-frame${isDrawing ? ' drawing' : ''}`}>
      <canvas
        ref={canvasRef}
        aria-label="Animated layered paper tunnel. Use Draw shape to create a custom silhouette."
        className="artwork-canvas"
        onPointerDown={(event) => {
          if (!isDrawing) return
          event.currentTarget.setPointerCapture(event.pointerId)
          drawingRef.current = []
          collectPoint(event)
        }}
        onPointerMove={(event) => {
          if (isDrawing && event.buttons !== 0) collectPoint(event)
        }}
        onPointerUp={finishDrawing}
        onPointerCancel={cancelDrawing}
      />
      <div className="canvas-actions">
        <button className={`canvas-tool${isDrawing ? ' active' : ''}`} onClick={toggleDrawing} type="button">
          {isDrawing ? <X size={15} strokeWidth={1.8} /> : <Pencil size={15} strokeWidth={1.8} />}
          {isDrawing ? 'Cancel drawing' : 'Draw shape'}
        </button>
        {isDrawing && <span className="draw-hint">Trace a closed outline on the artwork</span>}
        {!isDrawing && (
          <button className="canvas-tool secondary" onClick={() => onShapeChange(defaultShape)} type="button" aria-label="Reset shape">
            <Eraser size={14} strokeWidth={1.8} />
            Reset shape
          </button>
        )}
      </div>
      <div className="canvas-caption">
        <span>FIG. 01</span>
        <span>ORGANIC STUDY — 001</span>
      </div>
    </div>
  )
}
