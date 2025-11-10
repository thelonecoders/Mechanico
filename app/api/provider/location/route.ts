import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'

const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  isAvailable: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateLocationSchema.parse(body)

    // Update provider profile
    const profile = await prisma.profile.update({
      where: {
        userId: session.user.id,
      },
      data: {
        latitude: validatedData.lat,
        longitude: validatedData.lng,
        isAvailable: validatedData.isAvailable,
      },
    })

    // TODO: Emit real-time location update to customers via Socket.IO

    return NextResponse.json({
      message: 'Location updated successfully',
      profile,
    })
  } catch (error) {
    console.error('Update location error:', error)

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