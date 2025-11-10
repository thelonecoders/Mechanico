import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const radius = parseFloat(searchParams.get('radius') || '10') // Default 10km radius

    if (!serviceId || !lat || !lng) {
      return NextResponse.json(
        { message: 'Missing required parameters: serviceId, lat, lng' },
        { status: 400 }
      )
    }

    // Find providers who offer the service and are available
    const providers = await prisma.user.findMany({
      where: {
        role: 'PROVIDER',
        services: {
          some: {
            id: serviceId,
            isActive: true,
          },
        },
        profile: {
          isAvailable: true,
          latitude: { not: null },
          longitude: { not: null },
        },
      },
      include: {
        profile: true,
        services: {
          where: {
            id: serviceId,
            isActive: true,
          },
        },
        ratings: {
          select: {
            score: true,
          },
        },
      },
    })

    // Calculate distance and filter by radius
    const nearbyProviders = providers
      .map((provider) => {
        if (!provider.profile?.latitude || !provider.profile?.longitude) {
          return null
        }

        const distance = calculateDistance(
          lat,
          lng,
          provider.profile.latitude,
          provider.profile.longitude
        )

        const averageRating =
          provider.ratings.length > 0
            ? provider.ratings.reduce((sum, rating) => sum + rating.score, 0) /
              provider.ratings.length
            : 0

        return {
          id: provider.id,
          name: `${provider.profile?.firstName} ${provider.profile?.lastName}`,
          businessName: provider.profile?.businessName,
          avatar: provider.profile?.avatar,
          specialization: provider.profile?.specialization,
          trustScore: provider.profile?.trustScore || 0,
          averageRating,
          totalRatings: provider.ratings.length,
          distance,
          service: provider.services[0],
        }
      })
      .filter((provider) => provider !== null && provider.distance <= radius)
      .sort((a, b) => a.distance - b.distance)

    return NextResponse.json({
      providers: nearbyProviders,
      total: nearbyProviders.length,
    })
  } catch (error) {
    console.error('Get nearby providers error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}