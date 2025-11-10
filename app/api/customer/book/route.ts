import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'

const createBookingSchema = z.object({
  serviceId: z.string(),
  vehicleId: z.string(),
  lat: z.number(),
  lng: z.number(),
  notes: z.string().optional(),
  locationAddress: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createBookingSchema.parse(body)

    // Verify service exists and is active
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    })

    if (!service || !service.isActive) {
      return NextResponse.json(
        { message: 'Service not available' },
        { status: 400 }
      )
    }

    // Verify vehicle belongs to customer
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: validatedData.vehicleId },
    })

    if (!vehicle || vehicle.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        serviceId: validatedData.serviceId,
        vehicleId: validatedData.vehicleId,
        customerId: session.user.id,
        providerId: service.providerId,
        status: 'PENDING',
        price: service.basePrice,
        date: new Date(),
        latitude: validatedData.lat,
        longitude: validatedData.lng,
        locationAddress: validatedData.locationAddress,
        notes: validatedData.notes,
      },
      include: {
        service: true,
        vehicle: true,
        provider: {
          include: {
            profile: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Booking created successfully',
      booking,
    })
  } catch (error) {
    console.error('Create booking error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}