import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import { cn } from '@/lib/utils'
import { applyMapStyle, map, mapElement, mapReadyStore } from './map-instance'
import { MapStyleToggle } from './map-style-toggle'
import { useMapStyleStore } from './map-styles'

type MapViewProps = {
  className?: string
  /** Show the Map / Satellite switch. */
  styleToggle?: boolean
  /** Map layers and overlays; rendered once the style is ready. */
  children?: React.ReactNode
}

export function MapView({ className, styleToggle, children }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapReady = useSyncExternalStore(
    mapReadyStore.subscribe,
    mapReadyStore.getSnapshot
  )
  const styleId = useMapStyleStore((state) => state.styleId)

  useLayoutEffect(() => {
    const container = containerRef.current!
    container.appendChild(mapElement)
    map.resize()
    // The sidebar and side panels resize the map without a window resize
    const observer = new ResizeObserver(() => map.resize())
    observer.observe(container)
    return () => {
      observer.disconnect()
      container.removeChild(mapElement)
    }
  }, [])

  useEffect(() => applyMapStyle(styleId), [styleId])

  return (
    <div className={cn('relative size-full overflow-hidden', className)}>
      <div ref={containerRef} className='absolute inset-0' />
      {styleToggle && <MapStyleToggle />}
      {mapReady && children}
    </div>
  )
}
