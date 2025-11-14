"use client"

import { useSession } from "next-auth/react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const { data: session } = useSession()
  const { isAdmin } = useAuth()

  if (!isAdmin) {
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
      title: "Total Users",
      value: "1,247",
      description: "+12% from last month",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Tutors",
      value: "342",
      description: "89% approval rate",
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      title: "Monthly Revenue",
      value: "$24,500",
      description: "+18% from last month",
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "Total Sessions",
      value: "1,856",
      description: "This month",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  const pendingApprovals = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      type: "Tutor Application",
      submitted: "2024-01-10",
      status: "Pending",
    },
    {
      id: 2,
      name: "Prof. Michael Chen",
      type: "Background Check",
      submitted: "2024-01-09",
      status: "Pending",
    },
    {
      id: 3,
      name: "Ms. Emily Rodriguez",
      type: "Document Verification",
      submitted: "2024-01-08",
      status: "Pending",
    },
  ]

  const recentActivity = [
    {
      id: 1,
      action: "New tutor registration",
      user: "John Smith",
      time: "2 minutes ago",
      status: "success",
    },
    {
      id: 2,
      action: "Payment processed",
      user: "Emma Wilson",
      time: "15 minutes ago",
      status: "success",
    },
    {
      id: 3,
      action: "Session completed",
      user: "Michael Brown",
      time: "1 hour ago",
      status: "success",
    },
    {
      id: 4,
      action: "Failed payment",
      user: "Sarah Davis",
      time: "2 hours ago",
      status: "error",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Platform overview and system management.
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Approvals */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Items requiring your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.type}</p>
                      <p className="text-xs text-gray-500">Submitted: {item.submitted}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        {item.status}
                      </span>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button asChild className="w-full">
                  <Link href="/admin/approvals">View All Approvals</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {activity.status === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/activity">View All Activity</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild className="justify-start">
                <Link href="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/admin/tutors">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Tutors
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/admin/revenue">
                  <DollarSign className="mr-2 h-4 w-4" />
                  View Revenue
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/admin/settings">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  System Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}