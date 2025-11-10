import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'

const confirmBookingSchema = z.object({
  bookingId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId } = confirmBookingSchema.parse(body)

    // Find and update booking
    const booking = await prisma.booking.update({
      where: {
        id: bookingId,
        providerId: session.user.id,
        status: 'PENDING',
      },
      data: {
        status: 'CONFIRMED',
      },
      include: {
        service: true,
        vehicle: true,
        customer: {
          include: {
            profile: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found or already confirmed' },
        { status: 404 }
      )
    }

    // TODO: Emit real-time notification to customer via Socket.IO

    return NextResponse.json({
      message: 'Booking confirmed successfully',
      booking,
    })
  } catch (error) {
    console.error('Confirm booking error:', error)

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