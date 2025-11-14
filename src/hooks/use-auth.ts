"use client"

import { useSession } from "next-auth/react"
import { UserRole } from "@prisma/client"

interface UseAuthReturn {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: UserRole
  } | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isTutor: boolean
  isStudent: boolean
  isParent: boolean
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession()

  return {
    user: session?.user || null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: session?.user?.role === UserRole.ADMIN,
    isTutor: session?.user?.role === UserRole.TUTOR,
    isStudent: session?.user?.role === UserRole.STUDENT,
    isParent: session?.user?.role === UserRole.PARENT,
  }
}