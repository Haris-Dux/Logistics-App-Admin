import { Trip } from '@/api/trips'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getTripColor } from '@/lib/trip-colors'
import { Check } from 'lucide-react'

type TripPickerProps = {
    trips: Trip[]
    trip: Trip | null
    selectedTripId?: string
    onSelectTrip: (tripId: string) => void
    isTripEnabled?: (trip: Trip) => boolean
  }
  
  export function TripPicker({
    trips,
    trip,
    selectedTripId,
    onSelectTrip,
    isTripEnabled = () => true,
  }: TripPickerProps) {
    const allTrips = selectedTripId === 'all'
    const tripColor =
      allTrips || !trip ? 'var(--foreground)' : getTripColor(trip.tripNumber)
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            className='inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring'
            style={{
              color: tripColor,
              backgroundColor: allTrips ? 'var(--muted)' : `${tripColor}15`,
            }}
          >
            <span
              className='size-1.5 rounded-full'
              style={{ backgroundColor: tripColor }}
            />
            {allTrips
              ? 'All trips'
              : `Trip ${trip?.tripNumber} of ${trips.length}`}
          </button>
        </DropdownMenuTrigger>
  
        <DropdownMenuContent align='start' className='min-w-40'>
          <DropdownMenuItem onClick={() => onSelectTrip('all')} className='gap-2'>
            <span className='size-2 rounded-full bg-foreground' />
            <span className='flex-1'>All trips</span>
            {allTrips && <Check className='size-4' />}
          </DropdownMenuItem>
  
          {trips.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onClick={() => onSelectTrip(item.id)}
              disabled={!isTripEnabled(item)}
              className='gap-2'
            >
              <span
                className='size-2 rounded-full'
                style={{ backgroundColor: getTripColor(item.tripNumber) }}
              />
              <span className='flex-1'>Trip {item.tripNumber}</span>
              {selectedTripId === item.id && <Check className='size-4' />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  