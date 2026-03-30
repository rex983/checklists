'use client'

import { useState, useEffect } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('bbd-theme')
    if (stored === 'dark') {
      setDark(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('bbd-theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
      style={{ background: 'rgba(255,255,255,0.15)' }}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="text-base">{dark ? '☀️' : '🌙'}</span>
    </button>
  )
}
