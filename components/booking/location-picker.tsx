'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, Search } from 'lucide-react'
import { Location } from '@/types/booking'
import { toast } from 'sonner'

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void
  onClose: () => void
  initialLocation?: Location
}

export function LocationPicker({ onLocationSelect, onClose, initialLocation }: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location>(
    initialLocation || { lat: 35.6892, lng: 51.3890 } // Default: Tehran
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [address, setAddress] = useState(initialLocation?.address || '')

  // Get current location using browser geolocation
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند')
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const newLocation = { lat: latitude, lng: longitude }
        setSelectedLocation(newLocation)

        // Try to get address from coordinates (reverse geocoding)
        try {
          // For now, use a simple placeholder - in production, integrate with a geocoding service
          setAddress(`موقعیت فعلی (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`)
        } catch (error) {
          console.error('Error getting address:', error)
        }

        setIsGettingLocation(false)
        toast.success('موقعیت شما با موفقیت دریافت شد')
      },
      (error) => {
        setIsGettingLocation(false)
        toast.error('خطا در دریافت موقعیت شما')
        console.error('Geolocation error:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    )
  }, [])

  // Search for location (placeholder implementation)
  const searchLocation = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast.error('لطفاً یک آدرس وارد کنید')
      return
    }

    try {
      // In production, integrate with a geocoding service like Mapbox, Google Places, etc.
      // For now, simulate finding a location
      const mockResults = [
        { name: 'میدان آزادی', lat: 35.6995, lng: 51.3381 },
        { name: 'برج میلاد', lat: 35.7448, lng: 51.3759 },
        { name: 'خیابان ولیعصر', lat: 35.7176, lng: 51.4252 },
      ]

      const found = mockResults.find(result =>
        result.name.toLowerCase().includes(searchQuery.toLowerCase())
      )

      if (found) {
        const newLocation = { lat: found.lat, lng: found.lng, address: found.name }
        setSelectedLocation(newLocation)
        setAddress(found.name)
        toast.success(`موقعیت "${found.name}" انتخاب شد`)
      } else {
        toast.error('موقعیتی یافت نشد. لطفاً آدرس دقیق‌تری وارد کنید')
      }
    } catch (error) {
      toast.error('خطا در جستجوی موقعیت')
      console.error('Search error:', error)
    }
  }, [searchQuery])

  const handleConfirm = () => {
    const locationWithAddress = {
      ...selectedLocation,
      address: address || `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`
    }
    onLocationSelect(locationWithAddress)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLocation()
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">انتخاب موقعیت</h2>
        <p className="text-gray-600">مکان دقیق ارائه سرویس را مشخص کنید</p>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="جستجوی آدرس..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-10 text-right"
              dir="rtl"
            />
          </div>
          <Button
            onClick={searchLocation}
            variant="outline"
            className="touch-target"
          >
            جستجو
          </Button>
        </div>
      </div>

      {/* Current Location Button */}
      <div className="mb-6">
        <Button
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          variant="outline"
          className="w-full touch-target"
        >
          <Navigation className="ml-2 h-4 w-4" />
          {isGettingLocation ? 'در حال دریافت موقعیت...' : 'استفاده از موقعیت فعلی'}
        </Button>
      </div>

      {/* Selected Location Display */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-right">
              <div className="font-medium mb-1">موقعیت انتخاب شده</div>
              <div className="text-sm text-gray-600 mb-2">
                {address || `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`}
              </div>
              <div className="text-xs text-gray-500">
                عرض جغرافیایی: {selectedLocation.lat.toFixed(6)}
              </div>
              <div className="text-xs text-gray-500">
                طول جغرافیایی: {selectedLocation.lng.toFixed(6)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Locations */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">مکان‌های پرتکرار</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'منزل', lat: 35.6892, lng: 51.3890 },
            { name: 'محل کار', lat: 35.7448, lng: 51.3759 },
            { name: 'میدان اصلی', lat: 35.6995, lng: 51.3381 },
          ].map((location) => (
            <Badge
              key={location.name}
              variant="outline"
              className="cursor-pointer touch-target hover:bg-primary hover:text-primary-foreground"
              onClick={() => {
                setSelectedLocation({ lat: location.lat, lng: location.lng })
                setAddress(location.name)
              }}
            >
              {location.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="mb-6">
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">نقشه اینجا نمایش داده خواهد شد</p>
          <p className="text-sm text-gray-500 mt-1">
            {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 touch-target"
        >
          بازگشت
        </Button>
        <Button
          onClick={handleConfirm}
          className="flex-1 touch-target"
        >
          تأیید موقعیت
        </Button>
      </div>
    </div>
  )
}