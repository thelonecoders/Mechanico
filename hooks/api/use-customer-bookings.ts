'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Booking } from '@/types/booking'

interface UseCustomerBookingsParams {
  status?: string
  limit?: number
  offset?: number
}

export function useCustomerBookings({ status, limit = 10, offset = 0 }: UseCustomerBookingsParams = {}) {
  return useQuery<{
    bookings: Booking[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }>({
    queryKey: ['customer-bookings', status, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(status && { status }),
        limit: limit.toString(),
        offset: offset.toString(),
      })

      const response = await fetch(`/api/customer/bookings?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      return response.json()
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bookingData: {
      serviceId: string
      vehicleId: string
      lat: number
      lng: number
      notes?: string
      locationAddress?: string
    }) => {
      const response = await fetch('/api/customer/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create booking')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] })
    },
  })
}