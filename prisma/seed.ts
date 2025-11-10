import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.rating.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.service.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleared existing data')

  // Create users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mechanico.ir',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    },
  })

  await prisma.profile.create({
    data: {
      userId: adminUser.id,
      firstName: 'مدیر',
      lastName: 'سیستم',
    },
  })

  const providerUser = await prisma.user.create({
    data: {
      email: 'mechanic@mechanico.ir',
      password: await bcrypt.hash('mechanic123', 10),
      role: 'PROVIDER',
    },
  })

  await prisma.profile.create({
    data: {
      userId: providerUser.id,
      firstName: 'علی',
      lastName: 'محمدی',
      businessName: 'مکانیک خودرو علی',
      isAvailable: true,
      latitude: 35.6892,
      longitude: 51.3890,
      specialization: 'تعمیرات موتور,برق خودرو,سیستم تعلیق',
      trustScore: 95,
    },
  })

  const providerUser2 = await prisma.user.create({
    data: {
      email: 'mechanic2@mechanico.ir',
      password: await bcrypt.hash('mechanic123', 10),
      role: 'PROVIDER',
    },
  })

  await prisma.profile.create({
    data: {
      userId: providerUser2.id,
      firstName: 'حسین',
      lastName: 'رضایی',
      businessName: 'خدمات خودرو حسین',
      isAvailable: false,
      latitude: 35.6961,
      longitude: 51.4231,
      specialization: 'تعویض روغن,بالانس چرخ,شست‌وشو',
      trustScore: 78,
    },
  })

  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@mechanico.ir',
      password: await bcrypt.hash('customer123', 10),
      role: 'CUSTOMER',
    },
  })

  await prisma.profile.create({
    data: {
      userId: customerUser.id,
      firstName: 'زهرا',
      lastName: 'احمدی',
    },
  })

  console.log('👥 Created users')

  // Create services
  const services = [
    {
      name: 'تعویض روغن موتور',
      category: 'mechanical',
      description: 'تعویض روغن و فیلتر موتور با قطعات اصلی',
      basePrice: 850000,
      duration: '45 minutes',
      providerId: providerUser.id,
    },
    {
      name: 'بالانس و رگلاژ چرخ',
      category: 'tire',
      description: 'بالانس و رگلاژ چهار چرخ خودرو',
      basePrice: 450000,
      duration: '30 minutes',
      providerId: providerUser.id,
    },
    {
      name: 'سرویس کامل خودرو',
      category: 'maintenance',
      description: 'سرویس دوره‌ای شامل تعویض روغن، فیلترها و بررسی کامل',
      basePrice: 1500000,
      duration: '120 minutes',
      providerId: providerUser.id,
    },
    {
      name: 'شست‌وشوی کامل',
      category: 'wash',
      description: 'شست‌وشوی داخل و خارج با واکس و پولیش',
      basePrice: 350000,
      duration: '60 minutes',
      providerId: providerUser.id,
    },
    {
      name: 'تعمیر سیستم ترمز',
      category: 'brake',
      description: 'بررسی و تعویض لنت و دیسک ترمز',
      basePrice: 1200000,
      duration: '90 minutes',
      providerId: providerUser.id,
    },
    {
      name: 'باتری‌سازی و شارژ',
      category: 'electrical',
      description: 'تست و تعویض باتری خودرو',
      basePrice: 650000,
      duration: '30 minutes',
      providerId: providerUser.id,
    },
  ]

  for (const service of services) {
    await prisma.service.create({ data: service })
  }

  console.log('🔧 Created services')

  // Create vehicles
  const vehicles = [
    {
      make: 'ایران خودرو',
      model: 'پژو ۲۰۶',
      year: 2020,
      licensePlate: '۱۲ ب ۳۴۵ ایران ۶۷',
      color: 'سفید',
      mileage: 45000,
      ownerId: customerUser.id,
    },
    {
      make: 'سایپا',
      model: 'تیبا',
      year: 2021,
      licensePlate: '۲۳ د ۴۵۶ ایران ۸۹',
      color: 'نقره‌ای',
      mileage: 28000,
      ownerId: customerUser.id,
    },
  ]

  const createdVehicles = []
  for (const vehicle of vehicles) {
    createdVehicles.push(await prisma.vehicle.create({ data: vehicle }))
  }

  console.log('🚗 Created vehicles')

  // Create bookings
  const now = new Date()
  const bookings = [
    {
      status: 'CONFIRMED' as const,
      price: 850000,
      date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      notes: 'لطفاً از روغن موبیل ۱ استفاده شود',
      latitude: 35.6892,
      longitude: 51.3890,
      locationAddress: 'تهران، میدان آزادی',
      customerId: customerUser.id,
      providerId: providerUser.id,
      vehicleId: createdVehicles[0].id,
      serviceId: '1', // Oil change service
    },
    {
      status: 'COMPLETED' as const,
      price: 1500000,
      date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      latitude: 35.6892,
      longitude: 51.3890,
      locationAddress: 'تهران، سعادت آباد',
      customerId: customerUser.id,
      providerId: providerUser.id,
      vehicleId: createdVehicles[0].id,
      serviceId: '3', // Full service
    },
    {
      status: 'COMPLETED' as const,
      price: 350000,
      date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      latitude: 35.6961,
      longitude: 51.4231,
      locationAddress: 'تهران، ونک',
      customerId: customerUser.id,
      providerId: providerUser.id,
      vehicleId: createdVehicles[1].id,
      serviceId: '4', // Car wash
    },
    {
      status: 'PENDING' as const,
      price: 450000,
      date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      latitude: 35.6961,
      longitude: 51.4231,
      locationAddress: 'تهران، پارک وی',
      customerId: customerUser.id,
      providerId: providerUser2.id,
      vehicleId: createdVehicles[0].id,
      serviceId: '2', // Wheel balance
    },
  ]

  const createdBookings = []
  for (const booking of bookings) {
    createdBookings.push(await prisma.booking.create({ data: booking }))
  }

  console.log('📅 Created bookings')

  // Create ratings
  const ratings = [
    {
      score: 5,
      comment: 'سرویس عالی و دقیق. کاملاً راضی هستم.',
      date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      bookingId: createdBookings[1].id,
      customerId: customerUser.id,
      providerId: providerUser.id,
    },
    {
      score: 4,
      comment: 'خوب بود اما زمان انتظار کمی طولانی شد.',
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      bookingId: createdBookings[2].id,
      customerId: customerUser.id,
      providerId: providerUser.id,
    },
  ]

  for (const rating of ratings) {
    await prisma.rating.create({ data: rating })
  }

  console.log('⭐ Created ratings')

  console.log('✅ Database seeding completed!')
  console.log('')
  console.log('📧 Login credentials:')
  console.log('   Admin: admin@mechanico.ir / admin123')
  console.log('   Provider: mechanic@mechanico.ir / mechanic123')
  console.log('   Customer: customer@mechanico.ir / customer123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })