import { useEffect, useState } from 'react'
import { AudioLines, Command, Expand, Pause, Play, RotateCcw } from 'lucide-react'
import ArtworkCanvas from './components/ArtworkCanvas'
import ControlPanel from './components/ControlPanel'
import { defaultShape } from './engine/shapeGeometry'
import { palettes } from './engine/colors'
import type { ArtworkSettings, Point } from './engine/types'

const initialSettings: ArtworkSettings = {
  speed: 36,
  rippleWidth: 42,
  layers: 28,
  rotation: 0,
  complexity: 22,
  direction: 'inward',
}

export default function App() {
  const [points, setPoints] = useState<Point[]>(defaultShape)
  const [palette, setPalette] = useState<string[]>(palettes[0].colors)
  const [paletteName, setPaletteName] = useState(palettes[0].name)
  const [settings, setSettings] = useState<ArtworkSettings>(initialSettings)
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [resetVersion, setResetVersion] = useState(0)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      if (event.matches) setPlaying(false)
    }
    preference.addEventListener('change', handlePreferenceChange)
    return () => preference.removeEventListener('change', handlePreferenceChange)
  }, [])

  const updatePalette = (colors: string[], name = 'Custom') => {
    setPalette(colors)
    setPaletteName(name)
  }

  const reset = () => {
    setPoints(defaultShape)
    updatePalette(palettes[0].colors, palettes[0].name)
    setSettings(initialSettings)
    setPlaying(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    setResetVersion((version) => version + 1)
  }

  return (
    <main className="studio-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Infinite home">
          <span className="brand-mark"><AudioLines size={19} strokeWidth={1.8} /></span>
          <span className="brand-name">INFINITE</span>
          <span className="brand-divider" />
          <span className="brand-descriptor">GENERATIVE ART STUDIO</span>
        </a>
        <div className="topbar-meta">
          <span><span className="top-live" /> PROCEDURAL / 001</span>
          <button className="topbar-control" type="button" onClick={() => setPlaying(!playing)}>
            {playing ? <Pause size={13} /> : <Play size={13} />}
            <span>{playing ? 'Pause' : 'Play'}</span>
          </button>
          <button className="topbar-control reset-control" type="button" onClick={reset} aria-label="Reset artwork" title="Reset artwork">
            <RotateCcw size={13} /><span>Reset</span>
          </button>
          <button className="export-button" type="button" onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Enter fullscreen">
            <Expand size={14} /> <span>Focus</span>
          </button>
        </div>
      </header>

      <div className="studio-content">
        <section className="artwork-column" aria-label="Artwork preview">
          <div className="canvas-toolbar">
            <div className="canvas-title">
              <span className="eyebrow">GENERATIVE STUDY</span>
              <h2>Into the blue</h2>
            </div>
            <div className="artwork-meta"><span>01 / 01</span><span className="meta-divider">·</span><span>LIVE CANVAS</span></div>
          </div>
          <ArtworkCanvas
            key={resetVersion}
            points={points}
            palette={palette}
            settings={settings}
            playing={playing}
            onShapeChange={setPoints}
          />
          <div className="artwork-note">
            <span><Command size={12} /> DESIGNED TO DISSOLVE</span>
            <span>Infinite forms, in continuous motion.</span>
          </div>
        </section>
        <ControlPanel
          settings={settings}
          palette={palette}
          paletteName={paletteName}
          playing={playing}
          onSettingsChange={setSettings}
          onPaletteChange={updatePalette}
        />
      </div>
      <footer className="page-footer">
        <span>INFINITE <span className="footer-separator">/</span> DIGITAL PAPER STUDIES</span>
        <span>MADE OF LIGHT, LAYER BY LAYER</span>
      </footer>
    </main>
  )
}
