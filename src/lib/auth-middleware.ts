import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === "ADMIN"
    const isTutor = token?.role === "TUTOR"
    const isStudent = token?.role === "STUDENT"
    const isParent = token?.role === "PARENT"

    const { pathname } = req.nextUrl

    // Admin routes
    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Tutor routes
    if (pathname.startsWith("/dashboard/tutor") && !isTutor) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Student routes
    if (pathname.startsWith("/dashboard/student") && !isStudent) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Parent routes
    if (pathname.startsWith("/dashboard/parent") && !isParent) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // General dashboard routes
    if (pathname.startsWith("/dashboard") && !token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/protected/:path*",
  ],
}