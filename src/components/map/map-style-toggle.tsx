import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type MapStyleId, mapStyles, useMapStyleStore } from './map-styles'

/** Map / Satellite switch shown over the map. */
export function MapStyleToggle() {
  const styleId = useMapStyleStore((state) => state.styleId)
  const setStyleId = useMapStyleStore((state) => state.setStyleId)

  return (
    <Tabs
      value={styleId}
      onValueChange={(value) => setStyleId(value as MapStyleId)}
      className='absolute start-3 top-3 z-10'
    >
      <TabsList className='shadow-md'>
        {Object.entries(mapStyles).map(([id, { label }]) => (
          <TabsTrigger key={id} value={id}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
