export type BookingStep =
  | 'service'
  | 'location'
  | 'providers'
  | 'confirmation'
  | 'tracking'

export interface Location {
  lat: number
  lng: number
  address?: string
}

export interface Service {
  id: string
  name: string
  category: string
  description: string
  basePrice: number
  duration: string
  icon?: string
}

export interface Provider {
  id: string
  name: string
  businessName?: string
  avatar?: string
  specialization?: string
  trustScore: number
  averageRating: number
  totalRatings: number
  distance: number
  service: Service
}

export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  color?: string
  mileage?: number
}

export interface Booking {
  id: string
  status: string
  price: number
  date: string
  notes?: string
  latitude: number
  longitude: number
  locationAddress?: string
  service: Service
  provider: any
  vehicle: Vehicle
  customer: any
  rating?: any
}