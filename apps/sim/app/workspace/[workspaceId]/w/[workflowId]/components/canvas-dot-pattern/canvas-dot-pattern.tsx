'use client'

import { useEffect, useRef, useState } from 'react'
import { useReactFlow } from 'reactflow'

/**
 * Custom dot pattern background that reads colors from CSS variables.
 * Replaces ReactFlow's built-in Background component which doesn't support CSS variables.
 */
export function CanvasDotPattern() {
  const ref = useRef<HTMLDivElement>(null)
  const { getViewport } = useReactFlow()
  const [dotColor, setDotColor] = useState('rgba(255,255,255,0.06)')
  const [dotSize, setDotSize] = useState(1)

  useEffect(() => {
    if (!ref.current) return
    const styles = getComputedStyle(ref.current)
    setDotColor(styles.getPropertyValue('--canvas-dot-color').trim() || 'transparent')
    const size = Number.parseFloat(styles.getPropertyValue('--canvas-dot-size').trim()) || 1
    setDotSize(size)
  }, [])

  const viewport = getViewport()
  const gap = 20
  const scaledGap = gap * viewport.zoom

  return (
    <div ref={ref} className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
      <svg width='100%' height='100%'>
        <defs>
          <pattern
            id='canvas-dots'
            x={viewport.x % scaledGap}
            y={viewport.y % scaledGap}
            width={scaledGap}
            height={scaledGap}
            patternUnits='userSpaceOnUse'
          >
            <line
              x1={scaledGap / 2 - 3}
              y1={scaledGap / 2}
              x2={scaledGap / 2 + 3}
              y2={scaledGap / 2}
              stroke={dotColor}
              strokeWidth={1}
            />
            <line
              x1={scaledGap / 2}
              y1={scaledGap / 2 - 3}
              x2={scaledGap / 2}
              y2={scaledGap / 2 + 3}
              stroke={dotColor}
              strokeWidth={1}
            />
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill='url(#canvas-dots)' />
      </svg>
    </div>
  )
}
