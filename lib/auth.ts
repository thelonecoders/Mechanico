import { prisma } from '@/lib/db'
import bcrypt from 'bcrypt'

export async function authenticateUser(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    })

    if (!user || !user.password) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: `${user.profile?.firstName} ${user.profile?.lastName}`,
      image: user.image,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export async function createUser(userData: {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: 'CUSTOMER' | 'PROVIDER'
  phone?: string
}) {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'CUSTOMER',
        phone: userData.phone,
        profile: {
          create: {
            firstName: userData.firstName,
            lastName: userData.lastName,
          },
        },
      },
      include: {
        profile: true,
      },
    })

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: `${user.profile?.firstName} ${user.profile?.lastName}`,
    }
  } catch (error) {
    console.error('User creation error:', error)
    throw error
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: `${user.profile?.firstName} ${user.profile?.lastName}`,
      image: user.image,
      profile: user.profile,
    }
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}