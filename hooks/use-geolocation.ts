'use client'

import { useState, useEffect } from 'react'

interface Location {
  lat: number
  lng: number
}

export function useGeolocation() {
  const [location, setLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند')
      setIsLoading(false)
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setIsLoading(false)
        setError(null)
      },
      (error) => {
        setError('خطا در دریافت موقعیت: ' + error.message)
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  return { location, isLoading, error }
}