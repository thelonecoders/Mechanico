'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Star, MapPin, Clock, Phone, Check, X } from 'lucide-react'
import { Provider, Service } from '@/types/booking'
import { toast } from 'sonner'

interface ProviderListProps {
  serviceId: string
  location: { lat: number; lng: number }
  onProviderSelect: (provider: Provider) => void
  onClose: () => void
}

export function ProviderList({ serviceId, location, onProviderSelect, onClose }: ProviderListProps) {
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch(
          `/api/providers/nearby?serviceId=${serviceId}&lat=${location.lat}&lng=${location.lng}&radius=10`
        )
        if (response.ok) {
          const data = await response.json()
          setProviders(data.providers || [])
        } else {
          toast.error('خطا در دریافت لیست ارائه‌دهندگان')
        }
      } catch (error) {
        toast.error('خطا در دریافت لیست ارائه‌دهندگان')
        console.error('Error fetching providers:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProviders()
  }, [serviceId, location])

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} متر`
    }
    return `${distance.toFixed(1)} کیلومتر`
  }

  const formatRating = (rating: number) => {
    return rating.toFixed(1)
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar && fullStars < 5) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-200 text-yellow-400" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return stars
  }

  const getStatusBadge = (isAvailable: boolean) => {
    return (
      <Badge variant={isAvailable ? 'default' : 'secondary'} className="text-xs">
        {isAvailable ? 'آماده خدمت' : 'مشغول'}
      </Badge>
    )
  }

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider)
  }

  const handleConfirmProvider = async () => {
    if (!selectedProvider) return

    setIsAccepting(true)
    try {
      // In a real app, you might want to send a request to reserve the provider
      // or notify them before confirming
      onProviderSelect(selectedProvider)
    } catch (error) {
      toast.error('خطا در انتخاب ارائه‌دهنده')
      console.error('Error selecting provider:', error)
    } finally {
      setIsAccepting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (providers.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">هیچ ارائه‌دهنده‌ای در نزدیکی شما یافت نشد</div>
          <Button onClick={onClose} variant="outline" className="touch-target">
            بازگشت
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">انتخاب ارائه‌دهنده</h2>
        <p className="text-gray-600">
          {providers.length} ارائه‌دهنده نزدیک شما پیدا شد
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-4 pb-4">
          {providers.map((provider) => (
            <Card
              key={provider.id}
              className={`cursor-pointer transition-all touch-target ${
                selectedProvider?.id === provider.id
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleProviderSelect(provider)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={provider.avatar} alt={provider.name} />
                      <AvatarFallback>
                        {provider.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-right">
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      {provider.businessName && (
                        <p className="text-sm text-gray-600">{provider.businessName}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(true)} {/* Assuming all fetched providers are available */}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{formatDistance(provider.distance)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {renderStars(provider.averageRating)}
                      <span className="text-sm font-medium mr-1">
                        {formatRating(provider.averageRating)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({provider.totalRatings} امتیاز)
                      </span>
                    </div>
                    {provider.trustScore > 0 && (
                      <Badge variant="outline" className="text-xs">
                        امتیاز اطمینان: {provider.trustScore}
                      </Badge>
                    )}
                  </div>

                  {/* Specialization */}
                  {provider.specialization && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">تخصص: </span>
                      {provider.specialization}
                    </div>
                  )}

                  {/* Service Info */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{provider.service.name}</span>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>{provider.service.duration}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {provider.service.description}
                    </div>
                    <div className="text-lg font-semibold text-primary mt-2">
                      {provider.service.basePrice.toLocaleString('fa-IR')} تومان
                    </div>
                  </div>

                  {/* Contact (if selected) */}
                  {selectedProvider?.id === provider.id && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 touch-target"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`tel:${provider.phone || ''}`)
                        }}
                      >
                        <Phone className="h-4 w-4 ml-1" />
                        تماس
                      </Button>
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-600">انتخاب شد</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 sticky bottom-0 bg-white pt-4 border-t">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 touch-target"
        >
          <X className="h-4 w-4 ml-1" />
          انصراف
        </Button>
        <Button
          onClick={handleConfirmProvider}
          disabled={!selectedProvider || isAccepting}
          className="flex-1 touch-target"
        >
          <Check className="h-4 w-4 ml-1" />
          {isAccepting ? 'در حال تأیید...' : 'تأیید ارائه‌دهنده'}
        </Button>
      </div>
    </div>
  )
}