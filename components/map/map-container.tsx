'use client'

import { useEffect, useState } from 'react'
import { Location } from '@/types/booking'
import { Booking } from '@/types/booking'
import { Card } from '@/components/ui/card'
import { MapPin, Navigation, Star } from 'lucide-react'

interface MapContainerProps {
  center: Location
  providers: any[]
  activeBooking?: Booking
  selectedLocation?: Location | null
  onMapClick: () => void
}

export function MapContainer({
  center,
  providers,
  activeBooking,
  selectedLocation,
  onMapClick
}: MapContainerProps) {
  const [isMapLoading, setIsMapLoading] = useState(true)

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsMapLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isMapLoading) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری نقشه...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Map Placeholder */}
      <div
        className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 cursor-pointer"
        onClick={onMapClick}
      >
        <div className="absolute inset-0 bg-opacity-50 bg-white">
          {/* Map Grid */}
          <div className="h-full w-full relative">
            {/* User Location */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
                  موقعیت شما
                </div>
              </div>
            </div>

            {/* Selected Location */}
            {selectedLocation && (
              <div
                className="absolute"
                style={{
                  top: `${50 + (selectedLocation.lat - center.lat) * 100}%`,
                  left: `${50 + (selectedLocation.lng - center.lng) * 100}%`,
                }}
              >
                <div className="relative">
                  <MapPin className="w-6 h-6 text-red-500 fill-red-500" />
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
                    {selectedLocation.address || 'مکان انتخاب شده'}
                  </div>
                </div>
              </div>
            )}

            {/* Provider Locations */}
            {providers.map((provider, index) => (
              <div
                key={provider.id}
                className="absolute"
                style={{
                  top: `${50 + (provider.service.latitude - center.lat) * 100}%`,
                  left: `${50 + (provider.service.longitude - center.lng) * 100}%`,
                }}
              >
                <div className="relative group">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {index + 1}
                  </div>
                  <Card className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-48 p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="text-sm font-medium">{provider.name}</div>
                    <div className="text-xs text-gray-600">{provider.businessName}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs">{provider.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({provider.totalRatings})</span>
                    </div>
                    <div className="text-xs text-primary font-semibold mt-1">
                      {provider.distance} km away
                    </div>
                  </Card>
                </div>
              </div>
            ))}

            {/* Active Booking Provider */}
            {activeBooking && (
              <div
                className="absolute"
                style={{
                  top: `${50 + (activeBooking.latitude - center.lat) * 100}%`,
                  left: `${50 + (activeBooking.longitude - center.lng) * 100}%`,
                }}
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
                    {activeBooking.provider.profile?.businessName || 'مکانیک در راه'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Map Overlay Info */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3 z-10">
            <div className="text-sm font-medium mb-1">نقشه زنده</div>
            <div className="text-xs text-gray-600">
              {providers.length} مکانیک در نزدیکی شما
            </div>
          </div>

          {/* Map Instructions */}
          {providers.length === 0 && !selectedLocation && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-white rounded-lg shadow-md p-4">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">برای شروع روی نقشه ضربه بزنید</p>
            </div>
          )}
        </div>
      </div>

      {/* Map Attribution */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-white px-2 py-1 rounded">
        Map Placeholder (Mapbox integration pending)
      </div>
    </div>
  )
}