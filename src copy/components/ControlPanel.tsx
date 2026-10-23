import { Plus, Minus } from 'lucide-react'
import { palettes } from '../engine/colors'
import type { ArtworkSettings } from '../engine/types'

type ControlPanelProps = {
  settings: ArtworkSettings
  palette: string[]
  paletteName: string
  playing: boolean
  onSettingsChange: (settings: ArtworkSettings) => void
  onPaletteChange: (colors: string[], name?: string) => void
}

type SliderProps = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
}

function Slider({ label, value, min, max, step = 1, suffix = '', onChange }: SliderProps) {
  return (
    <label className="slider-control">
      <span className="control-label">{label}<output>{value}{suffix}</output></span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
      />
    </label>
  )
}

export default function ControlPanel({
  settings,
  palette,
  paletteName,
  playing,
  onSettingsChange,
  onPaletteChange,
}: ControlPanelProps) {
  const update = <Key extends keyof ArtworkSettings,>(key: Key, value: ArtworkSettings[Key]) => {
    onSettingsChange({ ...settings, [key]: value })
  }
  const setColor = (index: number, color: string) => {
    onPaletteChange(palette.map((current, colorIndex) => colorIndex === index ? color : current), 'Custom')
  }

  return (
    <aside className="control-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">COMPOSITION</span>
          <h1>Shape &amp; motion</h1>
        </div>
        <span className={`status-dot${playing ? '' : ' paused'}`} aria-label={playing ? 'Animation playing' : 'Animation paused'} />
      </div>

      <section className="control-section">
        <div className="section-heading"><span>01</span><h2>Palette</h2></div>
        <label className="select-control">
          <span className="sr-only">Color palette presets</span>
          <select
            value={paletteName}
            onChange={(event) => {
              const selected = palettes.find((item) => item.name === event.target.value)
              if (selected) onPaletteChange(selected.colors, selected.name)
            }}
          >
            {palettes.map((item) => <option key={item.name} value={item.name}>{item.name} palette</option>)}
            {paletteName === 'Custom' && <option value="Custom">Custom palette</option>}
          </select>
          <span className="select-chevron">⌄</span>
        </label>
        <div className="color-list">
          {palette.map((color, index) => (
            <label className="color-row" key={index}>
              <span>{['Light tone', 'Mid tone', 'Deep tone'][index]}</span>
              <input type="color" value={color} onChange={(event) => setColor(index, event.target.value)} aria-label={`${['Light', 'Middle', 'Deep'][index]} color`} />
            </label>
          ))}
          {palette.length < 3 ? (
            <button className="text-button" onClick={() => onPaletteChange([...palette.slice(0, 1), palette[1] ?? '#3989d5', '#071426'], 'Custom')} type="button">
              <Plus size={13} /> Add third color
            </button>
          ) : (
            <button className="text-button" onClick={() => onPaletteChange(palette.slice(0, 2), 'Custom')} type="button">
              <Minus size={13} /> Remove third color
            </button>
          )}
        </div>
      </section>

      <section className="control-section">
        <div className="section-heading"><span>02</span><h2>Movement</h2></div>
        <Slider label="Speed" value={settings.speed} min={1} max={100} suffix="%" onChange={(value) => update('speed', value)} />
        <Slider label="Ripple width" value={settings.rippleWidth} min={10} max={100} suffix="%" onChange={(value) => update('rippleWidth', value)} />
        <div className="direction-control">
          <span className="control-label">Direction</span>
          <div className="segmented">
            <button className={settings.direction === 'inward' ? 'selected' : ''} onClick={() => update('direction', 'inward')} type="button">Inward</button>
            <button className={settings.direction === 'outward' ? 'selected' : ''} onClick={() => update('direction', 'outward')} type="button">Outward</button>
          </div>
        </div>
      </section>

      <section className="control-section">
        <div className="section-heading"><span>03</span><h2>Structure</h2></div>
        <Slider label="Layers" value={settings.layers} min={8} max={48} onChange={(value) => update('layers', value)} />
        <Slider label="Rotation" value={settings.rotation} min={-30} max={30} suffix="°" onChange={(value) => update('rotation', value)} />
        <Slider label="Shape complexity" value={settings.complexity} min={0} max={100} suffix="%" onChange={(value) => update('complexity', value)} />
      </section>

      <div className="panel-footer">
        <span className="live-indicator"><span />{playing ? 'LIVE GENERATION' : 'PAUSED'}</span>
        <span className="live-note">CANVAS 2D</span>
      </div>
    </aside>
  )
}
