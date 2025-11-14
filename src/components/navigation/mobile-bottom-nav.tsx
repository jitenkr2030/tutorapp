"use client";

import { useSession } from "next-auth/react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Search, 
  BookOpen, 
  GraduationCap, 
  Users, 
  Shield, 
  FileCheck, 
  MessageSquare, 
  Users2,
  Bell,
  Calendar,
  Video,
  Brain
} from "lucide-react";

interface MobileBottomNavProps {
  notificationCount?: number;
}

export default function MobileBottomNav({ notificationCount = 0 }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isAuthenticated, isAdmin, isTutor, isStudent, isParent } = useAuth();

  const getNavItems = () => {
    const baseItems = [
      {
        href: "/",
        icon: Home,
        label: "Home",
        show: true
      },
      {
        href: "/search",
        icon: Search,
        label: "Search",
        show: true
      }
    ];

    if (isAuthenticated) {
      const dashboardItem = {
        href: isAdmin ? "/admin" : 
               isTutor ? "/dashboard/tutor" : 
               isStudent ? "/dashboard/student" : 
               isParent ? "/dashboard/parent" : "/dashboard",
        icon: isAdmin ? Shield : 
               isTutor ? GraduationCap : 
               isStudent ? BookOpen : 
               isParent ? Users : BookOpen,
        label: isAdmin ? "Admin" : 
               isTutor ? "Tutor" : 
               isStudent ? "Student" : 
               isParent ? "Parent" : "Dashboard",
        show: true
      };

      baseItems.push(dashboardItem);

      // Role-specific items
      if (isTutor) {
        baseItems.push({
          href: "/verification",
          icon: FileCheck,
          label: "Verify",
          show: true
        });
      }

      if (isParent) {
        baseItems.push({
          href: "/communication",
          icon: MessageSquare,
          label: "Chat",
          show: true
        });
      }

      // Common items for authenticated users
      baseItems.push({
        href: "/sessions",
        icon: Video,
        label: "Sessions",
        show: true
      });

      // AI Tutor for all authenticated users
      baseItems.push({
        href: "/ai-tutor",
        icon: Brain,
        label: "AI Tutor",
        show: true
      });

      baseItems.push({
        href: "/notifications",
        icon: Bell,
        label: "Alerts",
        show: true,
        badge: notificationCount > 0 ? notificationCount : undefined
      });
    }

    return baseItems.filter(item => item.show);
  };

  const navItems = getNavItems();

  if (!isAuthenticated) {
    return null; // Don't show bottom nav for non-authenticated users
  }

  return (
    <nav className="mobile-nav safe-area-bottom">
      <div className="flex items-center justify-around py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
                          (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mobile-nav-item relative flex-1 min-w-0",
                isActive && "text-primary"
              )}
            >
              <div className="relative">
                <item.icon 
                  className={cn(
                    "h-6 w-6",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} 
                />
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-xs mt-1",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}