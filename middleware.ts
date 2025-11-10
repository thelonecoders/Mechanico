import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // You can add additional middleware logic here
    // For example, role-based redirects
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect these routes
        if (
          req.nextUrl.pathname.startsWith('/admin') ||
          req.nextUrl.pathname.startsWith('/customer') ||
          req.nextUrl.pathname.startsWith('/provider')
        ) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/customer/:path*',
    '/provider/:path*',
    '/api/admin/:path*',
    '/api/customer/:path*',
    '/api/provider/:path*',
  ],
}