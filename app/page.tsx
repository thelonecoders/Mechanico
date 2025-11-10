import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to login page if not authenticated
  // Later this will be handled by middleware
  redirect('/login')
}