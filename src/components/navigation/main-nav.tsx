"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Settings, LogOut, BookOpen, GraduationCap, Users, Shield, FileCheck, MessageSquare, Users2, BarChart3, Target, Brain, Video, Mic } from "lucide-react"

export function MainNav() {
  const { data: session } = useSession()
  const { isAuthenticated, isAdmin, isTutor, isStudent, isParent } = useAuth()

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  if (!isAuthenticated) {
    return (
      <nav className="flex items-center space-x-4">
        <Button asChild variant="ghost">
          <Link href="/auth/signin">Sign In</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/signup">Sign Up</Link>
        </Button>
      </nav>
    )
  }

  const getDashboardLink = () => {
    if (isAdmin) return "/admin"
    if (isTutor) return "/dashboard/tutor"
    if (isStudent) return "/dashboard/student"
    if (isParent) return "/dashboard/parent"
    return "/dashboard"
  }

  const getDashboardIcon = () => {
    if (isAdmin) return <Shield className="h-4 w-4" />
    if (isTutor) return <GraduationCap className="h-4 w-4" />
    if (isStudent) return <BookOpen className="h-4 w-4" />
    if (isParent) return <Users className="h-4 w-4" />
    return <User className="h-4 w-4" />
  }

  const getDashboardLabel = () => {
    if (isAdmin) return "Admin Dashboard"
    if (isTutor) return "Tutor Dashboard"
    if (isStudent) return "Student Dashboard"
    if (isParent) return "Parent Dashboard"
    return "Dashboard"
  }

  return (
    <nav className="flex items-center space-x-4">
      <Button asChild variant="ghost" className="flex items-center space-x-2">
        <Link href={getDashboardLink()}>
          {getDashboardIcon()}
          <span>{getDashboardLabel()}</span>
        </Link>
      </Button>
      
      {isTutor && (
        <Button asChild variant="ghost" className="flex items-center space-x-2">
          <Link href="/verification">
            <FileCheck className="h-4 w-4" />
            <span>Verification</span>
          </Link>
        </Button>
      )}
      
      {isAdmin && (
        <Button asChild variant="ghost" className="flex items-center space-x-2">
          <Link href="/analytics">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </Link>
        </Button>
      )}
      
      {isAdmin && (
        <Button asChild variant="ghost" className="flex items-center space-x-2">
          <Link href="/admin/verification">
            <FileCheck className="h-4 w-4" />
            <span>Review Verifications</span>
          </Link>
        </Button>
      )}
      
      {isParent && (
        <Button asChild variant="ghost" className="flex items-center space-x-2">
          <Link href="/communication">
            <MessageSquare className="h-4 w-4" />
            <span>Communication</span>
          </Link>
        </Button>
      )}
      
      {isParent && (
        <Button asChild variant="ghost" className="flex items-center space-x-2">
          <Link href="/family">
            <Users2 className="h-4 w-4" />
            <span>Family</span>
          </Link>
        </Button>
      )}
      
      {(isTutor || isStudent) && (
        <Button asChild variant="ghost" className="flex items-center space-x-2">
          <Link href="/learning-tools">
            <Target className="h-4 w-4" />
            <span>Learning Tools</span>
          </Link>
        </Button>
      )}
      
      {(isTutor || isStudent) && (
        <Button asChild variant="ghost" className="flex items-center space-x-2">
          <Link href="/media-processing">
            <Video className="h-4 w-4" />
            <span>Media Processing</span>
          </Link>
        </Button>
      )}
      
      <Button asChild variant="ghost" className="flex items-center space-x-2">
        <Link href="/ai-tutor">
          <Brain className="h-4 w-4" />
          <span>AI Tutor</span>
        </Link>
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
              <AvatarFallback>
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {session?.user?.name && (
                <p className="font-medium">{session.user.name}</p>
              )}
              {session?.user?.email && (
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  {session.user.email}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}