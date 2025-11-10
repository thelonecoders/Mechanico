'use client'

import { Drawer } from 'vaul'
import { cn } from '@/lib/utils'
import { BookingStep } from '@/types/booking'

interface BookingDrawerProps {
  isOpen: boolean
  onClose: () => void
  step: BookingStep
  children: React.ReactNode
}

export function BookingDrawer({ isOpen, onClose, step, children }: BookingDrawerProps) {
  const getDrawerHeight = () => {
    switch (step) {
      case 'service':
        return '75%'
      case 'location':
        return '85%'
      case 'providers':
        return '80%'
      case 'confirmation':
        return '70%'
      case 'tracking':
        return '60%'
      default:
        return '75%'
    }
  }

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onClose}
      shouldScaleBackground={true}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 rounded-t-[20px] bg-white',
            'focus:outline-none',
            'max-h-[90vh]'
          )}
          style={{ height: getDrawerHeight() }}
        >
          <div className="sticky top-0 z-10 bg-white rounded-t-[20px] border-b border-gray-200">
            <div className="flex h-8 items-center justify-center">
              <Drawer.Handle className="h-2 w-16 rounded-full bg-gray-300" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto safe-top safe-bottom">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}