'use client'

import { useEffect, useState } from 'react'

interface EnduriaBranding {
  identity?: {
    companyName?: string
    tagline?: string
  }
  colors?: {
    primary?: { h: number; s: number; l: number }
    secondary?: { h: number; s: number; l: number }
    accent?: { h: number; s: number; l: number }
    background?: { h: number; s: number; l: number }
    surface?: { h: number; s: number; l: number }
  }
  typography?: {
    fontFamily?: string
  }
  logos?: {
    primaryLight?: string
    primaryDark?: string
    favicon?: string
  }
}

const CACHE_KEY = 'enduria-branding'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100
  const lNorm = l / 100
  const a = sNorm * Math.min(lNorm, 1 - lNorm)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function getCachedBranding(): EnduriaBranding | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > CACHE_TTL) return null
    return data
  } catch {
    return null
  }
}

function setCachedBranding(data: EnduriaBranding): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {
    // localStorage full or unavailable
  }
}

function applyBranding(branding: EnduriaBranding): void {
  const root = document.documentElement

  // When served behind Enduria proxy, account for the 64px header
  root.style.setProperty('--enduria-header-height', '64px')

  if (branding.colors?.primary) {
    const { h, s, l } = branding.colors.primary
    root.style.setProperty('--brand-primary-hex', hslToHex(h, s, l))
    root.style.setProperty('--brand-primary-hover-hex', hslToHex(h, s, Math.min(l + 10, 100)))
  }

  if (branding.colors?.accent) {
    const { h, s, l } = branding.colors.accent
    root.style.setProperty('--brand-accent-hex', hslToHex(h, s, l))
    root.style.setProperty('--brand-accent-hover-hex', hslToHex(h, s, Math.min(l + 10, 100)))
  }

  if (branding.colors?.background) {
    const { h, s, l } = branding.colors.background
    const hex = hslToHex(h, s, l)
    root.style.setProperty('--brand-background-hex', hex)
    if (l < 50) {
      root.style.setProperty('--brand-is-dark', '1')
    }
  }

  if (branding.identity?.companyName) {
    document.title = document.title.replace(/Sim/g, branding.identity.companyName)
  }

  if (branding.logos?.favicon) {
    const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement
    if (faviconLink) {
      faviconLink.href = branding.logos.favicon
    }
  }
}

/**
 * BrandingLoader fetches tenant branding from Enduria's /api/branding endpoint
 * and applies it as CSS custom properties. Uses localStorage cache with 5-min TTL.
 */
export function BrandingLoader() {
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    const cached = getCachedBranding()
    if (cached) {
      applyBranding(cached)
      setApplied(true)
    }

    const enduriaOrigin = window.location.origin
    fetch(`${enduriaOrigin}/api/branding`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`Branding API returned ${res.status}`)
        return res.json()
      })
      .then((json) => {
        const branding = json.data as EnduriaBranding
        if (branding) {
          setCachedBranding(branding)
          applyBranding(branding)
          setApplied(true)
        }
      })
      .catch(() => {
        setApplied(true)
      })
  }, [])

  return null
}
