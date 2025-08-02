"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface HeaderProps {
  isVisible: boolean
}

export function Header({ isVisible }: HeaderProps) {
  return (
    <header
      className={cn(
        "w-full bg-secondary text-foreground py-2 relative z-40",
        "transition-transform duration-300 ease-in-out will-change-transform",
        isVisible ? "translate-y-0" : "-translate-y-full",
      )}
      style={{ backgroundColor: 'var(--secondary)' }} // Ensure solid background
    >
      <nav className="flex justify-center items-center py-2">
        <div className="flex space-x-12">
          <Link href="/" className="nav-link text-xl">
            Home
          </Link>
           <Link href="/exercises" className="nav-link text-xl">
            Exercises
          </Link>
          <Link href="/settings" className="nav-link text-xl">
            Settings
          </Link>
        </div>
      </nav>
    </header>
  )
}
