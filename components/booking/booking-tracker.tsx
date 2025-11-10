'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Navigation,
  CheckCircle,
  Circle,
  AlertCircle,
  MessageCircle,
  X
} from 'lucide-react'
import { Booking, Provider } from '@/types/booking'
import { toast } from 'sonner'
import { useSocket } from '@/hooks/use-socket'

interface BookingTrackerProps {
  booking: Booking
  onComplete?: () => void
  onCancel?: () => void
}

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

interface StatusStep {
  id: BookingStatus
  label: string
  description: string
  icon: React.ReactNode
  isActive: boolean
  isCompleted: boolean
}

export function BookingTracker({ booking, onComplete, onCancel }: BookingTrackerProps) {
  const [currentStatus, setCurrentStatus] = useState<BookingStatus>(booking.status as BookingStatus)
  const [providerLocation, setProviderLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [estimatedArrival, setEstimatedArrival] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isCancelling, setIsCancelling] = useState(false)

  // Socket.IO connection for real-time updates
  const socket = useSocket()

  useEffect(() => {
    if (!socket) return

    // Listen for booking status updates
    socket.on('booking-status-update', (data: { bookingId: string; status: BookingStatus }) => {
      if (data.bookingId === booking.id) {
        setCurrentStatus(data.status)

        // Show appropriate toast for status change
        switch (data.status) {
          case 'CONFIRMED':
            toast.success('درخواست شما توسط ارائه‌دهنده تأیید شد')
            break
          case 'IN_PROGRESS':
            toast.success('ارائه‌دهنده در حال انجام سرویس است')
            break
          case 'COMPLETED':
            toast.success('سرویس با موفقیت انجام شد')
            onComplete?.()
            break
          case 'CANCELLED':
            toast.error('درخواست شما لغو شد')
            onCancel?.()
            break
        }
      }
    })

    // Listen for provider location updates
    socket.on('provider-location-update', (data: { providerId: string; lat: number; lng: number }) => {
      if (booking.provider?.id === data.providerId) {
        setProviderLocation({ lat: data.lat, lng: data.lng })

        // Calculate estimated arrival time (mock calculation)
        if (providerLocation) {
          const distance = calculateDistance(
            booking.latitude,
            booking.longitude,
            data.lat,
            data.lng
          )
          setEstimatedArrival(Math.round(distance * 2)) // Assume 30 km/h average speed
        }
      }
    })

    return () => {
      socket.off('booking-status-update')
      socket.off('provider-location-update')
    }
  }, [socket, booking.id, booking.provider?.id, providerLocation])

  // Timer for elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusSteps = (): StatusStep[] => {
    const baseSteps: StatusStep[] = [
      {
        id: 'PENDING',
        label: 'در جستجوی ارائه‌دهنده',
        description: 'در حال پیدا کردن بهترین ارائه‌دهنده برای شما',
        icon: <Circle className="h-5 w-5" />,
        isActive: currentStatus === 'PENDING',
        isCompleted: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(currentStatus),
      },
      {
        id: 'CONFIRMED',
        label: 'تأیید درخواست',
        description: 'ارائه‌دهنده در راه شماست',
        icon: <CheckCircle className="h-5 w-5" />,
        isActive: currentStatus === 'CONFIRMED',
        isCompleted: ['IN_PROGRESS', 'COMPLETED'].includes(currentStatus),
      },
      {
        id: 'IN_PROGRESS',
        label: 'در حال انجام سرویس',
        description: 'ارائه‌دهنده در حال انجام سرویس است',
        icon: <AlertCircle className="h-5 w-5" />,
        isActive: currentStatus === 'IN_PROGRESS',
        isCompleted: currentStatus === 'COMPLETED',
      },
      {
        id: 'COMPLETED',
        label: 'تکمیل سرویس',
        description: 'سرویس با موفقیت انجام شد',
        icon: <CheckCircle className="h-5 w-5" />,
        isActive: currentStatus === 'COMPLETED',
        isCompleted: currentStatus === 'COMPLETED',
      },
    ]

    // Add CANCELLED status if applicable
    if (currentStatus === 'CANCELLED') {
      return [...baseSteps, {
        id: 'CANCELLED',
        label: 'لغو شد',
        description: 'درخواست شما لغو شد',
        icon: <X className="h-5 w-5" />,
        isActive: true,
        isCompleted: false,
      }]
    }

    return baseSteps
  }

  const handleCancel = async () => {
    if (!confirm('آیا از لغو درخواست خود اطمینان دارید؟')) return

    setIsCancelling(true)
    try {
      const response = await fetch(`/api/customer/bookings/${booking.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Customer cancellation'
        })
      })

      if (response.ok) {
        toast.success('درخواست با موفقیت لغو شد')
        onCancel?.()
      } else {
        toast.error('خطا در لغو درخواست')
      }
    } catch (error) {
      toast.error('خطا در لغو درخواست')
      console.error('Error cancelling booking:', error)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleContactProvider = () => {
    if (booking.provider?.phone) {
      window.open(`tel:${booking.provider.phone}`)
    } else {
      toast.error('شماره تماس ارائه‌دهنده موجود نیست')
    }
  }

  const statusSteps = getStatusSteps()
  const progressPercentage = (statusSteps.filter(step => step.isCompleted).length / statusSteps.length) * 100

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">پیگیری درخواست</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>زمان سپری شده: {formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Status Progress */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">وضعیت درخواست</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="mb-4" />
          <div className="space-y-4">
            {statusSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start gap-3 ${
                  step.isActive ? 'text-primary' : step.isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div className="mt-1">
                  {step.isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : step.isActive ? (
                    <div className="relative">
                      {step.icon}
                      <div className="absolute inset-0 animate-ping">
                        <Circle className="h-5 w-5" />
                      </div>
                    </div>
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{step.label}</div>
                  <div className="text-sm text-gray-600">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Provider Info */}
      {booking.provider && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              اطلاعات ارائه‌دهنده
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={booking.provider.avatar} alt={booking.provider.name} />
                <AvatarFallback>
                  {booking.provider.name?.slice(0, 2).toUpperCase() || 'PR'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{booking.provider.name}</div>
                {booking.provider.businessName && (
                  <div className="text-sm text-gray-600">{booking.provider.businessName}</div>
                )}
              </div>
            </div>

            {providerLocation && currentStatus === 'CONFIRMED' && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <MapPin className="h-4 w-4" />
                  <span>
                    ارائه‌دهنده در {estimatedArrival || 'چند'} دقیقه دیگر می‌رسد
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleContactProvider}
                variant="outline"
                size="sm"
                className="flex-1 touch-target"
              >
                <Phone className="h-4 w-4 ml-1" />
                تماس با ارائه‌دهنده
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="touch-target"
                onClick={() => toast.info('امکان چت در نسخه بعدی اضافه خواهد شد')}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">جزئیات سرویس</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">نوع سرویس:</span>
            <span className="font-medium">{booking.service?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">هزینه:</span>
            <span className="font-medium">
              {booking.price?.toLocaleString('fa-IR')} تومان
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">موقعیت:</span>
            <span className="font-medium text-sm">
              {booking.locationAddress || 'موقعیت انتخاب شده'}
            </span>
          </div>
          {booking.notes && (
            <div className="flex justify-between">
              <span className="text-gray-600">توضیحات:</span>
              <span className="font-medium text-sm">{booking.notes}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">نقعه ردیابی زنده اینجا نمایش داده خواهد شد</p>
            <p className="text-sm text-gray-500 mt-1">
              موقعیت فعلی: {booking.latitude.toFixed(4)}, {booking.longitude.toFixed(4)}
            </p>
            {providerLocation && (
              <p className="text-sm text-blue-600 mt-1">
                موقعیت ارائه‌دهنده: {providerLocation.lat.toFixed(4)}, {providerLocation.lng.toFixed(4)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {currentStatus !== 'COMPLETED' && currentStatus !== 'CANCELLED' && (
        <div className="flex gap-3">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 touch-target"
            disabled={isCancelling || currentStatus === 'IN_PROGRESS'}
          >
            {isCancelling ? 'در حال لغو...' : 'لغو درخواست'}
          </Button>
          {currentStatus === 'COMPLETED' && (
            <Button className="flex-1 touch-target">
              <Star className="h-4 w-4 ml-1" />
              ثبت امتیاز
            </Button>
          )}
        </div>
      )}

      {currentStatus === 'COMPLETED' && (
        <div className="text-center py-4">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold mb-1">سرویس با موفقیت انجام شد</h3>
          <p className="text-gray-600 text-sm mb-4">
            لطفاً برای ارائه‌دهنده امتیاز ثبت کنید
          </p>
          <Button className="touch-target">
            <Star className="h-4 w-4 ml-1" />
            ثبت امتیاز و نظر
          </Button>
        </div>
      )}
    </div>
  )
}