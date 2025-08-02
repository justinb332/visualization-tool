"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UnifiedExerciseHeaderProps {
  onNewObject?: () => void
  onShowInstructions?: () => void
}

function UnifiedExerciseHeader({ 
  isVisible,
  onNewObject, 
  onShowInstructions,
  onKeepVisible
}: UnifiedExerciseHeaderProps & { isVisible: boolean; onKeepVisible?: () => void }) {
  const handleButtonClick = (callback: (() => void) | undefined) => {
    if (onKeepVisible) onKeepVisible()
    if (callback) callback()
  }

  return (
    <header
      className={cn(
        "w-full bg-secondary text-foreground relative z-40",
        "transition-transform duration-300 ease-in-out will-change-transform",
        isVisible ? "translate-y-0" : "-translate-y-full",
      )}
      style={{ 
        pointerEvents: isVisible ? 'auto' : 'none',
        touchAction: 'manipulation',
        backgroundColor: 'var(--secondary)' // Ensure solid background
      }}
    >
      {/* Main Navigation */}
      <nav className="flex justify-center items-center py-2 border-b border-border">
        <div className="flex space-x-12">
          <Link href="/" className="nav-link text-xl" onClick={() => onKeepVisible?.()}>
            Home
          </Link>
          <Link href="/exercises" className="nav-link text-xl" onClick={() => onKeepVisible?.()}>
            Exercises
          </Link>
          <Link href="/settings" className="nav-link text-xl" onClick={() => onKeepVisible?.()}>
            Settings
          </Link>
        </div>
      </nav>
      
      {/* Exercise Controls */}
      <div className="flex gap-4 justify-center flex-wrap py-4">
        {onNewObject && (
          <Button 
            onClick={() => handleButtonClick(onNewObject)}
            className="btn-primary px-6 py-3 w-32 border min-h-[44px] touch-manipulation"
            variant="secondary"
          >
            New Object
          </Button>
        )}
        
        {onShowInstructions && (
          <Button 
            onClick={() => handleButtonClick(onShowInstructions)}
            className="btn-primary px-6 py-3 w-32 border min-h-[44px] touch-manipulation"
            variant="secondary"
          >
            Instructions
          </Button>
        )}
      </div>
    </header>
  )
}

export function UnifiedExerciseHeaderWrapper({ 
  onNewObject, 
  onShowInstructions
}: UnifiedExerciseHeaderProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [showTouchIndicator, setShowTouchIndicator] = useState(true)
  const [showHoverIndicator, setShowHoverIndicator] = useState(true)

  // Detect if device supports touch
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  // Hide indicators after 3 seconds on first visit
  useEffect(() => {
    if (showTouchIndicator || showHoverIndicator) {
      const timer = setTimeout(() => {
        setShowTouchIndicator(false)
        setShowHoverIndicator(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showTouchIndicator, showHoverIndicator])

  const showHeader = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(true)
    
    // If indicators are still showing when header appears, fade them out quickly
    if (showTouchIndicator || showHoverIndicator) {
      setTimeout(() => {
        setShowTouchIndicator(false)
        setShowHoverIndicator(false)
      }, 200) // Short delay to allow header to appear first
    }
  }

  const hideHeaderDelayed = () => {
    const id = setTimeout(() => {
      setIsVisible(false)
    }, isTouchDevice ? 3000 : 500)
    setTimeoutId(id)
  }

  const keepHeaderVisible = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(true)
    
    // If indicators are still showing when header appears, fade them out quickly
    if (showTouchIndicator || showHoverIndicator) {
      setTimeout(() => {
        setShowTouchIndicator(false)
        setShowHoverIndicator(false)
      }, 200) // Short delay to allow header to appear first
    }
    
    hideHeaderDelayed()
  }

  const handleMouseEnter = () => {
    if (!isTouchDevice) showHeader()
  }

  const handleMouseLeave = () => {
    if (!isTouchDevice) hideHeaderDelayed()
  }

  const handleTouch = (event: React.TouchEvent) => {
    if (isTouchDevice) {
      const target = event.target as HTMLElement
      if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
        return
      }
      
      if (!event.currentTarget.contains(target)) {
        return
      }
      
      event.preventDefault()
      event.stopPropagation()
      
      if (isVisible) {
        setIsVisible(false)
        if (timeoutId) clearTimeout(timeoutId)
      } else {
        showHeader()
        hideHeaderDelayed()
      }
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  return (
    <div
      className="fixed top-0 left-0 right-0 h-24 z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouch}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Touch indicator for mobile devices */}
      {isTouchDevice && (
        <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 transition-opacity duration-1000 z-30 ${
          showTouchIndicator && !isVisible ? 'opacity-70 animate-pulse' : 'opacity-0'
        }`}>
          <div className="bg-foreground text-background px-3 py-1 rounded text-sm shadow-lg">
            Tap for controls
          </div>
        </div>
      )}
      
      {/* Hover indicator for desktop devices */}
      {!isTouchDevice && (
        <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 transition-opacity duration-1000 z-30 ${
          showHoverIndicator && !isVisible ? 'opacity-60 animate-pulse' : 'opacity-0'
        }`}>
          <div className="bg-foreground text-background px-3 py-1 rounded text-sm shadow-lg">
            Hover for controls
          </div>
        </div>
      )}
      <UnifiedExerciseHeader 
        isVisible={isVisible}
        onNewObject={onNewObject}
        onShowInstructions={onShowInstructions}
        onKeepVisible={keepHeaderVisible}
      />
    </div>
  )
}
