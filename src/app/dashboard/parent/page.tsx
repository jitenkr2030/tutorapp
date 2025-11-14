"use client"

import { useSession } from "next-auth/react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, Star, Clock, DollarSign, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function ParentDashboard() {
  const { data: session } = useSession()
  const { isParent } = useAuth()

  if (!isParent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const children = [
    {
      id: 1,
      name: "Emma Johnson",
      grade: "10th Grade",
      subjects: ["Mathematics", "Physics"],
      upcomingSessions: 2,
      totalSessions: 15,
      averageRating: 4.7,
    },
    {
      id: 2,
      name: "Lucas Johnson",
      grade: "8th Grade",
      subjects: ["English", "History"],
      upcomingSessions: 1,
      totalSessions: 8,
      averageRating: 4.9,
    },
  ]

  const stats = [
    {
      title: "Total Children",
      value: "2",
      description: "Active students",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Monthly Spending",
      value: "$680",
      description: "This month",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Sessions",
      value: "23",
      description: "All time",
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      title: "Average Rating",
      value: "4.8",
      description: "Across all tutors",
      icon: Star,
      color: "text-yellow-600",
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
            Monitor your children's learning progress and manage their tutoring sessions.
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
          {/* Children Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Your Children</CardTitle>
              <CardDescription>
                Learning progress and upcoming sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{child.name}</h4>
                      <p className="text-sm text-gray-600">{child.grade}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <BookOpen className="h-4 w-4" />
                        <span>{child.subjects.join(", ")}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{child.upcomingSessions} upcoming</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4" />
                          <span>{child.averageRating}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button asChild className="w-full">
                  <Link href="/dashboard/parent/children">Manage Children</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your family's tutoring needs
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
                <Link href="/dashboard/parent/schedule">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Schedule
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/parent/payments">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Payment History
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/parent/progress">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Progress Reports
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}