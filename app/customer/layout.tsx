import { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { MobileSafeArea } from '@/components/ui/mobile-safe-area'

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'CUSTOMER') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileSafeArea>
        <main className="pb-20">
          {children}
        </main>
        <BottomNav />
      </MobileSafeArea>
    </div>
  )
}