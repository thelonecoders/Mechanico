'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { MapPin, Clock, DollarSign, Car, User, Calendar, AlertCircle } from 'lucide-react'
import { Provider, Service, Vehicle, Location } from '@/types/booking'
import { toast } from 'sonner'

interface BookingConfirmationProps {
  service: Service
  provider: Provider
  location: Location
  onConfirm: (bookingData: {
    serviceId: string
    providerId: string
    vehicleId: string
    latitude: number
    longitude: number
    address: string
    notes?: string
  }) => void
  onClose: () => void
}

export function BookingConfirmation({
  service,
  provider,
  location,
  onConfirm,
  onClose,
}: BookingConfirmationProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingBooking, setIsCreatingBooking] = useState(false)

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/customer/vehicles')
        if (response.ok) {
          const data = await response.json()
          setVehicles(data.vehicles || [])
          if (data.vehicles && data.vehicles.length > 0) {
            setSelectedVehicle(data.vehicles[0].id)
          }
        } else {
          toast.error('خطا در دریافت لیست وسایل نقلیه')
        }
      } catch (error) {
        toast.error('خطا در دریافت لیست وسایل نقلیه')
        console.error('Error fetching vehicles:', error)
      } finally {
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    fetchVehicles()
  }, [])

  const handleConfirm = async () => {
    if (!selectedVehicle) {
      toast.error('لطفاً یک وسیله نقلیه انتخاب کنید')
      return
    }

    if (!agreedToTerms) {
      toast.error('لطفاً با شرایط موافقت کنید')
      return
    }

    setIsCreatingBooking(true)
    try {
      await onConfirm({
        serviceId: service.id,
        providerId: provider.id,
        vehicleId: selectedVehicle,
        latitude: location.lat,
        longitude: location.lng,
        address: location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
        notes: notes.trim() || undefined,
      })
    } catch (error) {
      toast.error('خطا در ایجاد درخواست')
      console.error('Error creating booking:', error)
    } finally {
      setIsCreatingBooking(false)
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR')
  }

  const estimatedDuration = parseInt(service.duration) || 30
  const estimatedArrival = 15 // minutes

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">وسیله نقلیه‌ای یافت نشد</h3>
          <p className="text-gray-600 mb-4">
            برای ثبت درخواست، ابتدا یک وسیله نقلیه به پروفایل خود اضافه کنید
          </p>
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="touch-target">
              بازگشت
            </Button>
            <Button onClick={() => window.location.href = '/customer/vehicles'} className="touch-target">
              افزودن وسیله نقلیه
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">تأیید درخواست سرویس</h2>
        <p className="text-gray-600">جزئیات درخواست خود را بررسی و تأیید کنید</p>
      </div>

      <div className="space-y-4">
        {/* Service Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🔧</span> {service.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">مدت زمان تخمینی:</span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{service.duration}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">هزینه سرویس:</span>
              <div className="flex items-center gap-1 font-semibold text-primary">
                <DollarSign className="h-4 w-4" />
                <span>{formatPrice(service.basePrice)} تومان</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {service.description}
            </div>
          </CardContent>
        </Card>

        {/* Provider Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              ارائه‌دهنده سرویس
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={provider.avatar} alt={provider.name} />
                <AvatarFallback>
                  {provider.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{provider.name}</div>
                {provider.businessName && (
                  <div className="text-sm text-gray-600">{provider.businessName}</div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    امتیاز: {provider.averageRating.toFixed(1)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {provider.distance.toFixed(1)} کیلومتر
                  </Badge>
                </div>
              </div>
            </div>
            {provider.specialization && (
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium">تخصص:</span> {provider.specialization}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              موقعیت ارائه سرویس
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="font-medium mb-1">
                {location.address || 'موقعیت انتخاب شده'}
              </div>
              <div className="text-gray-600">
                عرض: {location.lat.toFixed(6)}, طول: {location.lng.toFixed(6)}
              </div>
              <div className="text-sm text-blue-600 mt-2">
                زمان تقریبی رسیدن: {estimatedArrival} دقیقه
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="h-5 w-5" />
              وسیله نقلیه
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="vehicle-select" className="text-sm font-medium">
              وسیله نقلیه مورد نظر را انتخاب کنید:
            </Label>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger id="vehicle-select" className="mt-2">
                <SelectValue placeholder="انتخاب وسیله نقلیه" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} - {vehicle.year} ({vehicle.licensePlate})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">توضیحات额外</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="notes" className="text-sm font-medium">
              توضیحات额外 برای ارائه‌دهنده (اختیاری):
            </Label>
            <Textarea
              id="notes"
              placeholder="مثال: مشکل در روشن شدن خودرو، نیاز به کمک باتری‌گیری..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
              rows={3}
              dir="rtl"
            />
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <div className="text-sm">
              <Label htmlFor="terms" className="font-medium cursor-pointer">
                با شرایط و قوانین موافقت می‌کنم
              </Label>
              <ul className="text-gray-600 mt-2 space-y-1 text-xs">
                <li>• هزینه سرویس پس از انجام کار دریافت خواهد شد</li>
                <li>• در صورت نیاز به قطعات adicional، هزینه جداگانه محاسبه می‌شود</li>
                <li>• لغو درخواست کمتر از 15 دقیقه قبل از رسیدن ارائه‌دهنده مشمول جریمه است</li>
                <li>• مسئولیت امنیت وسیله نقلیه بر عهده مالک است</li>
              </ul>
            </div>
          </div>
        </div>

        <Separator />

        {/* Cost Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">خلاصه هزینه:</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>هزینه پایه سرویس:</span>
              <span>{formatPrice(service.basePrice)} تومان</span>
            </div>
            <div className="flex justify-between">
              <span>هزینه ایاب و ذهاب:</span>
              <span>رایگان</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold text-base">
              <span>مجموع قابل پرداخت:</span>
              <span className="text-primary">{formatPrice(service.basePrice)} تومان</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 touch-target"
          disabled={isCreatingBooking}
        >
          انصراف
        </Button>
        <Button
          onClick={handleConfirm}
          className="flex-1 touch-target"
          disabled={!selectedVehicle || !agreedToTerms || isCreatingBooking}
        >
          {isCreatingBooking ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
              در حال ثبت درخواست...
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4 ml-2" />
              ثبت نهایی درخواست
            </>
          )}
        </Button>
      </div>
    </div>
  )
}