'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, DollarSign, Wrench } from 'lucide-react'
import { Service } from '@/types/booking'
import { toast } from 'sonner'

interface ServiceSelectorProps {
  onServiceSelect: (serviceId: string) => void
  onClose: () => void
}

export function ServiceSelector({ onServiceSelect, onClose }: ServiceSelectorProps) {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services')
        if (response.ok) {
          const data = await response.json()
          setServices(data.services)

          const uniqueCategories = [...new Set(data.services.map((s: Service) => s.category))]
          setCategories(uniqueCategories)
        } else {
          toast.error('خطا در دریافت خدمات')
        }
      } catch (error) {
        toast.error('خطا در دریافت خدمات')
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [])

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(service => service.category === selectedCategory)

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      mechanical: '🔧',
      electrical: '⚡',
      tire: '🛞',
      wash: '🚿',
      brake: '🛑',
      maintenance: '🔩',
      body: '🎨',
    }
    return icons[category] || '🔧'
  }

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      mechanical: 'مکانیکی',
      electrical: 'برقی',
      tire: 'لاستیک',
      wash: 'شست‌وشو',
      brake: 'ترمز',
      maintenance: 'نگهداری',
      body: 'بدنه',
    }
    return names[category] || category
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">انتخاب سرویس</h2>
        <p className="text-gray-600">خدمات مورد نیاز خود را انتخاب کنید</p>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="whitespace-nowrap touch-target"
          >
            همه
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap touch-target"
            >
              <span className="ml-1">{getCategoryIcon(category)}</span>
              {getCategoryName(category)}
            </Button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="grid gap-4 pb-4">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className="cursor-pointer hover:shadow-md transition-shadow touch-target"
              onClick={() => onServiceSelect(service.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(service.category)}</span>
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {getCategoryName(service.category)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-right">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{service.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-primary">
                    <DollarSign className="h-4 w-4" />
                    <span>{service.basePrice.toLocaleString('fa-IR')} تومان</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}