'use client'

import { useQuery } from '@tanstack/react-query'
import { Provider } from '@/types/booking'

interface UseNearbyProvidersParams {
  serviceId: string
  lat: number
  lng: number
  radius?: number
}

export function useNearbyProviders(
  serviceId: string,
  lat: number,
  lng: number,
  radius = 10
) {
  return useQuery<Provider[]>({
    queryKey: ['nearby-providers', serviceId, lat, lng, radius],
    queryFn: async () => {
      if (!serviceId || !lat || !lng) return []

      const params = new URLSearchParams({
        serviceId,
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
      })

      const response = await fetch(`/api/providers/nearby?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch nearby providers')
      }

      const data = await response.json()
      return data.providers
    },
    enabled: !!serviceId && !!lat && !!lng,
    staleTime: 30 * 1000, // 30 seconds
  })
}