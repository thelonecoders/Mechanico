import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface MobileSafeAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const MobileSafeArea = forwardRef<HTMLDivElement, MobileSafeAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'safe-top safe-left safe-right safe-bottom min-h-screen',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

MobileSafeArea.displayName = 'MobileSafeArea'