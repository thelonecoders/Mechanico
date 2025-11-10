'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  MapPin,
  Calendar,
  Car,
  User,
  Bell
} from 'lucide-react'

const navigation = [
  {
    name: 'نقشه',
    href: '/customer',
    icon: MapPin,
  },
  {
    name: 'سفرها',
    href: '/customer/bookings',
    icon: Calendar,
  },
  {
    name: 'خودروها',
    href: '/customer/vehicles',
    icon: Car,
  },
  {
    name: 'پروفایل',
    href: '/customer/profile',
    icon: User,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="safe-bottom">
        <div className="grid grid-cols-4 h-16">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center space-y-1 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}