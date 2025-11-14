"use client"

import Link from "next/link"
import { MainNav } from "./navigation/main-nav"
import { Button } from "@/components/ui/button"
import { Search, Menu } from "lucide-react"
import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === "/" && href.startsWith("#")) {
      e.preventDefault()
      const element = document.getElementById(href.substring(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              TutorConnect
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link 
              href="/search" 
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Find Tutors
            </Link>
            <Link 
              href={pathname === "/" ? "#features" : "/#features"}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              onClick={(e) => handleNavClick(e, pathname === "/" ? "#features" : "/#features")}
            >
              Features
            </Link>
            <Link 
              href={pathname === "/" ? "#how-it-works" : "/#how-it-works"}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              onClick={(e) => handleNavClick(e, pathname === "/" ? "#how-it-works" : "/#how-it-works")}
            >
              How It Works
            </Link>
            <Link href="/become-tutor" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Become a Tutor
            </Link>
          </nav>
        </div>
        
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button
              variant="outline"
              className="relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
            >
              <Search className="mr-2 h-4 w-4" />
              Search tutors...
              <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                ⌘K
              </kbd>
            </Button>
          </div>
          
          <MainNav />
        </div>
      </div>
    </header>
  )
}