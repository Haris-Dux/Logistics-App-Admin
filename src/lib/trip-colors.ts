const TRIP_COLORS = [
    '#2563eb',
    '#800000',
    '#dc2626',
    '#9333ea',
    '#ea580c',
    '#0891b2',
    '#db2777',
    '#65a30d',
  ]
  
  export function getTripColor(tripNumber: number) {
    return TRIP_COLORS[(tripNumber - 1) % TRIP_COLORS.length]
  }
  