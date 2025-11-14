"use client"

import { useSession } from "next-auth/react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, Star, Clock, DollarSign, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function StudentDashboard() {
  const { data: session } = useSession()
  const { isStudent } = useAuth()

  if (!isStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: "Upcoming Sessions",
      value: "3",
      description: "Next session in 2 days",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Completed Sessions",
      value: "12",
      description: "This month",
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      title: "Average Rating",
      value: "4.8",
      description: "Based on 8 reviews",
      icon: Star,
      color: "text-yellow-600",
    },
    {
      title: "Total Spent",
      value: "$540",
      description: "This month",
      icon: DollarSign,
      color: "text-purple-600",
    },
  ]

  const upcomingSessions = [
    {
      id: 1,
      tutor: "Dr. Sarah Johnson",
      subject: "Mathematics",
      date: "2024-01-15",
      time: "14:00",
      duration: 60,
      type: "Online",
    },
    {
      id: 2,
      tutor: "Prof. Michael Chen",
      subject: "Physics",
      date: "2024-01-17",
      time: "16:00",
      duration: 90,
      type: "In-person",
    },
    {
      id: 3,
      tutor: "Ms. Emily Rodriguez",
      subject: "English",
      date: "2024-01-20",
      time: "10:00",
      duration: 60,
      type: "Online",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your learning progress and upcoming sessions.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>
                Your scheduled tutoring sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{session.tutor}</h4>
                      <p className="text-sm text-gray-600">{session.subject}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{session.date} at {session.time}</span>
                        <span>• {session.duration} min</span>
                        <span>• {session.type}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Join
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button asChild className="w-full">
                  <Link href="/search">Find More Tutors</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks you might want to do
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start">
                <Link href="/search">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Find New Tutors
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/student/sessions">
                  <Calendar className="mr-2 h-4 w-4" />
                  View All Sessions
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/student/progress">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Track Progress
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/student/payments">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Payment History
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}