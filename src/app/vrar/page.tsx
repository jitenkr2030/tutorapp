"use client";

import { VRARDashboard } from "@/components/vrar/vrar-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Headset, Smartphone, Globe, BookOpen, Target, Zap } from "lucide-react";

export default function VRARPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">VR/AR Learning Experiences</h1>
        <p className="text-xl text-muted-foreground">
          Immerse yourself in cutting-edge virtual and augmented reality learning environments
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <CardHeader>
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Headset className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Virtual Reality</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Step into fully immersive 3D learning environments. Explore virtual classrooms, 
              conduct experiments in virtual labs, and interact with 3D models.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Augmented Reality</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Bring learning to life with AR overlays. Scan markers to reveal interactive content, 
              explore spatial concepts, and learn through real-world interaction.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle>Interactive Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Engage with content through hands-on interaction. Track your progress, earn achievements, 
              and master concepts through immersive experiences.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Supported Devices */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Supported Devices</CardTitle>
          <CardDescription>
            Access VR/AR experiences on a wide range of devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <Headset className="h-5 w-5 mr-2" />
                Virtual Reality Devices
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Web VR (Browser-based)</li>
                <li>• Oculus Quest / Meta Quest</li>
                <li>• HTC Vive</li>
                <li>• Valve Index</li>
                <li>• PlayStation VR</li>
                <li>• Mobile VR (Google Cardboard, etc.)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <Smartphone className="h-5 w-5 mr-2" />
                Augmented Reality Devices
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Smartphones (iOS & Android)</li>
                <li>• Tablets (iPad & Android tablets)</li>
                <li>• AR Glasses (Meta Ray-Ban, etc.)</li>
                <li>• Smart Watches with AR capabilities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience Types */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Experience Types</CardTitle>
          <CardDescription>
            Discover different types of VR/AR learning experiences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Virtual Classrooms
              </h4>
              <p className="text-sm text-muted-foreground">
                Attend classes in immersive 3D environments with interactive whiteboards and real-time collaboration.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                3D Model Viewer
              </h4>
              <p className="text-sm text-muted-foreground">
                Explore complex 3D models from all angles. Perfect for biology, chemistry, and engineering subjects.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Virtual Labs
              </h4>
              <p className="text-sm text-muted-foreground">
                Conduct experiments safely in virtual laboratories. No equipment costs, no safety concerns.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                AR Overlays
              </h4>
              <p className="text-sm text-muted-foreground">
                View digital information overlaid on real-world objects through your device camera.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Interactive Tours
              </h4>
              <p className="text-sm text-muted-foreground">
                Take virtual field trips to historical sites, museums, and locations around the world.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                VR Gaming
              </h4>
              <p className="text-sm text-muted-foreground">
                Learn through gamified experiences that make education fun and engaging.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <VRARDashboard />
    </div>
  );
}