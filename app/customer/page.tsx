'use client'

import { useState, useEffect } from 'react'
import { MapContainer } from '@/components/map/map-container'
import { BookingDrawer } from '@/components/booking/booking-drawer'
import { ServiceSelector } from '@/components/booking/service-selector'
import { LocationPicker } from '@/components/booking/location-picker'
import { ProviderList } from '@/components/booking/provider-list'
import { BookingConfirmation } from '@/components/booking/booking-confirmation'
import { BookingTracker } from '@/components/booking/booking-tracker'
import { useGeolocation } from '@/hooks/use-geolocation'
import { useNearbyProviders } from '@/hooks/api/use-nearby-providers'
import { useCustomerBookings } from '@/hooks/api/use-customer-bookings'
import { BookingStep } from '@/types/booking'
import { toast } from 'sonner'

export default function CustomerHomePage() {
  const [bookingStep, setBookingStep] = useState<BookingStep>('service')
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const { location: userLocation, isLoading: locationLoading, error: locationError } = useGeolocation()

  const { bookings } = useCustomerBookings({ status: 'CONFIRMED,IN_PROGRESS' })
  const activeBooking = bookings?.find(b => b.status === 'IN_PROGRESS')

  const {
    providers,
    isLoading: providersLoading,
    refetch: refetchProviders,
  } = useNearbyProviders(
    selectedService || '',
    selectedLocation?.lat || userLocation?.lat || 35.6892,
    selectedLocation?.lng || userLocation?.lng || 51.3890
  )

  useEffect(() => {
    if (activeBooking) {
      setBookingStep('tracking')
      setIsDrawerOpen(true)
    }
  }, [activeBooking])

  useEffect(() => {
    if (selectedService && selectedLocation) {
      refetchProviders()
    }
  }, [selectedService, selectedLocation, refetchProviders])

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    setBookingStep('location')
    setIsDrawerOpen(true)
  }

  const handleLocationSelect = (location: { lat: number; lng: number; address?: string }) => {
    setSelectedLocation(location)
    setBookingStep('providers')
  }

  const handleProviderSelect = (provider: any) => {
    setSelectedProvider(provider)
    setBookingStep('confirmation')
  }

  const handleBookingConfirm = async (bookingData: any) => {
    try {
      const response = await fetch('/api/customer/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      if (response.ok) {
        toast.success('درخواست شما با موفقیت ارسال شد')
        setBookingStep('tracking')
        setIsDrawerOpen(true)
      } else {
        const error = await response.json()
        toast.error(error.message || 'خطا در ارسال درخواست')
      }
    } catch (error) {
      toast.error('خطا در ارسال درخواست')
    }
  }

  const handleNewBooking = () => {
    setBookingStep('service')
    setSelectedService(null)
    setSelectedLocation(null)
    setSelectedProvider(null)
    setSelectedVehicle(null)
    setIsDrawerOpen(false)
  }

  const drawerContent = () => {
    switch (bookingStep) {
      case 'service':
        return (
          <ServiceSelector
            onServiceSelect={handleServiceSelect}
            onClose={() => setIsDrawerOpen(false)}
          />
        )
      case 'location':
        return (
          <LocationPicker
            initialLocation={userLocation}
            onLocationSelect={handleLocationSelect}
            onBack={() => setBookingStep('service')}
          />
        )
      case 'providers':
        return (
          <ProviderList
            providers={providers}
            isLoading={providersLoading}
            onProviderSelect={handleProviderSelect}
            onBack={() => setBookingStep('location')}
            selectedLocation={selectedLocation}
          />
        )
      case 'confirmation':
        return (
          <BookingConfirmation
            service={selectedService}
            provider={selectedProvider}
            location={selectedLocation}
            onConfirm={handleBookingConfirm}
            onBack={() => setBookingStep('providers')}
          />
        )
      case 'tracking':
        return activeBooking ? (
          <BookingTracker
            booking={activeBooking}
            onNewBooking={handleNewBooking}
          />
        ) : null
      default:
        return null
    }
  }

  return (
    <div className="relative h-screen map-fullscreen">
      <MapContainer
        center={userLocation || { lat: 35.6892, lng: 51.3890 }}
        providers={providers}
        activeBooking={activeBooking}
        selectedLocation={selectedLocation}
        onMapClick={() => {
          if (bookingStep === 'service') {
            setIsDrawerOpen(true)
          }
        }}
      />

      {/* Floating Action Button */}
      {!activeBooking && (
        <button
          onClick={() => {
            setBookingStep('service')
            setIsDrawerOpen(true)
          }}
          className="absolute top-4 left-4 right-4 mx-auto max-w-sm bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg touch-target flex items-center justify-center space-x-2 space-x-reverse z-10"
        >
          <MapPin className="h-5 w-5" />
          <span className="font-medium">درخواست خدمات خودرو</span>
        </button>
      )}

      {/* User Location Status */}
      <div className="absolute top-20 right-4 bg-white rounded-lg shadow-md p-3 z-10">
        {locationLoading ? (
          <div className="text-sm text-gray-600">در حال دریافت موقعیت...</div>
        ) : locationError ? (
          <div className="text-sm text-red-600">خطا در دریافت موقعیت</div>
        ) : userLocation ? (
          <div className="text-sm text-green-600">موقعیت شما مشخص شد</div>
        ) : (
          <div className="text-sm text-gray-600">موقعیت نامشخص</div>
        )}
      </div>

      {/* Booking Drawer */}
      <BookingDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        step={bookingStep}
      >
        {drawerContent()}
      </BookingDrawer>
    </div>
  )
}