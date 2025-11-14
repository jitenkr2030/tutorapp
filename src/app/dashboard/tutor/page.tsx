"use client"

import { useSession } from "next-auth/react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, Star, Clock, DollarSign, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function TutorDashboard() {
  const { data: session } = useSession()
  const { isTutor } = useAuth()

  if (!isTutor) {
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
      title: "Total Students",
      value: "24",
      description: "Active students",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Sessions This Month",
      value: "38",
      description: "+12% from last month",
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Average Rating",
      value: "4.9",
      description: "Based on 156 reviews",
      icon: Star,
      color: "text-yellow-600",
    },
    {
      title: "Monthly Earnings",
      value: "$1,850",
      description: "This month",
      icon: DollarSign,
      color: "text-purple-600",
    },
  ]

  const upcomingSessions = [
    {
      id: 1,
      student: "John Smith",
      subject: "Mathematics",
      date: "2024-01-15",
      time: "14:00",
      duration: 60,
      type: "Online",
    },
    {
      id: 2,
      student: "Emma Wilson",
      subject: "Physics",
      date: "2024-01-15",
      time: "16:00",
      duration: 90,
      type: "In-person",
    },
    {
      id: 3,
      student: "Michael Brown",
      subject: "Mathematics",
      date: "2024-01-16",
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
            Here's your teaching schedule and performance overview.
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
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                Your upcoming tutoring sessions
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
                      <h4 className="font-medium">{session.student}</h4>
                      <p className="text-sm text-gray-600">{session.subject}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{session.time}</span>
                        <span>• {session.duration} min</span>
                        <span>• {session.type}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Start
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button asChild className="w-full">
                  <Link href="/dashboard/tutor/schedule">View Full Schedule</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your tutoring business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start">
                <Link href="/dashboard/tutor/schedule">
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Schedule
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/tutor/students">
                  <Users className="mr-2 h-4 w-4" />
                  View Students
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/tutor/earnings">
                  <DollarSign className="mr-2 h-4 w-4" />
                  View Earnings
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/tutor/profile">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Update Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}