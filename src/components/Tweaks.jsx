import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { isValidOrigin, isValidMessageSchema } from '../constants'

export function Tweaks() {
  const [editMode, setEditMode] = useState(false)
  const [open, setOpen] = useState(true)
  
  const {
    themeKey,
    setThemeKey,
    presets,
    motionEnabled,
    setMotionEnabled,
    starsVisible,
    setStarsVisible,
    grainVisible,
    setGrainVisible,
  } = useTheme()

  useEffect(() => {
    const onMsg = (e) => {
      // Validate origin
      if (!isValidOrigin(e.origin)) return
      // Validate schema
      if (!isValidMessageSchema(e.data)) return

      if (e.data.type === '__activate_edit_mode') setEditMode(true)
      else if (e.data.type === '__deactivate_edit_mode') setEditMode(false)
    }

    window.addEventListener('message', onMsg)
    
    // Broadcast availability only to valid parent if possible, but window.parent 
    // requires a targetOrigin. We will use the current location origin if we aren't sure,
    // or just omit if not running in iframe. For safety in postMessage, we check if we are in an iframe.
    if (window.parent !== window) {
      try {
        // Find the valid origin if possible, otherwise broadcast to '*' is risky. 
        // In this case, we broadcast to '*' only because the parent domain might not be known 
        // initially, but it's better to broadcast to the specific domain.
        // For security, we strictly broadcast only to our origin instead of '*'
        window.parent.postMessage({ type: '__edit_mode_available' }, window.location.origin)
      } catch(err) {}
    }

    return () => window.removeEventListener('message', onMsg)
  }, [])

  const update = (patch) => {
    if (patch.themeKey !== undefined) setThemeKey(patch.themeKey)
    if (patch.motion !== undefined) setMotionEnabled(patch.motion)
    if (patch.stars !== undefined) setStarsVisible(patch.stars)
    if (patch.grain !== undefined) setGrainVisible(patch.grain)

    if (window.parent !== window) {
      try {
        window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, window.location.origin)
      } catch (err) {}
    }
  }

  if (!editMode) return null

  const colors = Object.keys(presets).map((key) => ({
    key: key,
    name: presets[key].name,
    v: presets[key].accent,
  }))

  return (
    <div className="tweaks">
      <div className="tweaks-head">
        <span>
          Tweaks <span className="t">·</span> live
        </span>
        <button onClick={() => setOpen(!open)}>{open ? '−' : '+'}</button>
      </div>
      {open && (
        <div className="tweaks-body">
          <label>
            Paleta
            <div className="tweak-colors">
              {colors.map((c) => (
                <button
                  key={c.v}
                  title={c.name}
                  className={themeKey === c.key ? 'active' : ''}
                  style={{ background: c.v }}
                  onClick={() => update({ themeKey: c.key })}
                />
              ))}
            </div>
          </label>

          <div
            className={`tweak-toggle ${motionEnabled ? 'on' : ''}`}
            onClick={() => update({ motion: !motionEnabled })}
          >
            Blobs animados <span className="sw" />
          </div>
          <div
            className={`tweak-toggle ${starsVisible ? 'on' : ''}`}
            onClick={() => update({ stars: !starsVisible })}
          >
            Estrellas <span className="sw" />
          </div>
          <div
            className={`tweak-toggle ${grainVisible ? 'on' : ''}`}
            onClick={() => update({ grain: !grainVisible })}
          >
            Grano cinemático <span className="sw" />
          </div>
        </div>
      )}
    </div>
  )
}
