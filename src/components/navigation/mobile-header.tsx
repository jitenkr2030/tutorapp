"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import MobileSearch from "@/components/search/mobile-search";
import { 
  Menu, 
  Search, 
  Home, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Shield, 
  FileCheck, 
  MessageSquare, 
  Users2, 
  User, 
  Settings, 
  LogOut,
  Bell,
  X,
  ChevronDown
} from "lucide-react";

interface MobileHeaderProps {
  notificationCount?: number;
}

export default function MobileHeader({ notificationCount = 0 }: MobileHeaderProps) {
  const { data: session } = useSession();
  const { isAuthenticated, isAdmin, isTutor, isStudent, isParent } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
    setIsOpen(false);
  };

  const getDashboardLink = () => {
    if (isAdmin) return "/admin";
    if (isTutor) return "/dashboard/tutor";
    if (isStudent) return "/dashboard/student";
    if (isParent) return "/dashboard/parent";
    return "/dashboard";
  };

  const getDashboardIcon = () => {
    if (isAdmin) return <Shield className="h-5 w-5" />;
    if (isTutor) return <GraduationCap className="h-5 w-5" />;
    if (isStudent) return <BookOpen className="h-5 w-5" />;
    if (isParent) return <Users className="h-5 w-5" />;
    return <User className="h-5 w-5" />;
  };

  const getDashboardLabel = () => {
    if (isAdmin) return "Admin";
    if (isTutor) return "Tutor";
    if (isStudent) return "Student";
    if (isParent) return "Parent";
    return "Dashboard";
  };

  const navigationItems = [
    {
      href: "/search",
      icon: <Search className="h-5 w-5" />,
      label: "Find Tutors",
      show: true
    },
    {
      href: getDashboardLink(),
      icon: getDashboardIcon(),
      label: `${getDashboardLabel()} Dashboard`,
      show: isAuthenticated
    },
    {
      href: "/verification",
      icon: <FileCheck className="h-5 w-5" />,
      label: "Verification",
      show: isTutor
    },
    {
      href: "/admin/verification",
      icon: <FileCheck className="h-5 w-5" />,
      label: "Review Verifications",
      show: isAdmin
    },
    {
      href: "/communication",
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Communication",
      show: isParent
    },
    {
      href: "/family",
      icon: <Users2 className="h-5 w-5" />,
      label: "Family",
      show: isParent
    }
  ].filter(item => item.show);

  const accountItems = [
    {
      href: "/profile",
      icon: <User className="h-5 w-5" />,
      label: "Profile"
    },
    {
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      label: "Settings"
    },
    {
      href: "/notifications",
      icon: <Bell className="h-5 w-5" />,
      label: "Notifications",
      badge: notificationCount > 0 ? notificationCount : undefined
    }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">TutorConnect</span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="touch-target"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            {isAuthenticated && (
              <Button variant="ghost" size="sm" className="touch-target relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="touch-target">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 mobile-dialog safe-area-top safe-area-bottom">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <span className="font-bold text-lg">TutorConnect</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsOpen(false)}
                      className="touch-target"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* User Profile Section */}
                  {isAuthenticated && session?.user && (
                    <div className="mb-6 p-4 rounded-lg bg-muted">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                          <AvatarFallback className="text-lg">
                            {session.user.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {session.user.email}
                          </p>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {getDashboardLabel()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Items */}
                  <div className="flex-1 space-y-2">
                    <div className="space-y-1">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors touch-target"
                        >
                          {item.icon}
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </div>

                    {/* Account Section */}
                    {isAuthenticated && (
                      <>
                        <div className="border-t pt-4 mt-4">
                          <p className="text-xs font-medium text-muted-foreground mb-2 px-3">
                            Account
                          </p>
                          <div className="space-y-1">
                            {accountItems.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-muted transition-colors touch-target"
                              >
                                <div className="flex items-center space-x-3">
                                  {item.icon}
                                  <span className="font-medium">{item.label}</span>
                                </div>
                                {item.badge && (
                                  <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Auth Actions */}
                  <div className="border-t pt-4 mt-auto">
                    {isAuthenticated ? (
                      <Button
                        variant="outline"
                        className="w-full justify-start mobile-button"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        Sign Out
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Button asChild className="w-full mobile-button" variant="outline">
                          <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                            Sign In
                          </Link>
                        </Button>
                        <Button asChild className="w-full mobile-button">
                          <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                            Sign Up
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Mobile Search Dialog */}
      <MobileSearch 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
      />
    </>
  );
}