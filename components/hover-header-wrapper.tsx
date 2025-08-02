"use client"

import { useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Header } from "./header"

export function HoverHeaderWrapper() {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [showTouchIndicator, setShowTouchIndicator] = useState(true)
  const [showHoverIndicator, setShowHoverIndicator] = useState(true)
  const pathname = usePathname()

  // Detect if device supports touch
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  // Hide indicators after a few seconds on first visit
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTouchIndicator(false)
      setShowHoverIndicator(false)
    }, 3500)
    return () => clearTimeout(timer)
  }, []) // Remove dependencies so it only runs once on mount

  // Hide global header on basic object exercise page only after exercise starts
  const shouldHideHeader = pathname === "/exercises/basic-object" && 
    typeof window !== 'undefined' && 
    document.querySelector('[data-exercise-started="true"]')

  // Use smaller hover area on sketch page
  const hoverHeight = pathname === "/exercises/sketch" ? "h-12" : "h-24"

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
    }, isTouchDevice ? 3000 : 500) // Longer delay on touch devices
    setTimeoutId(id)
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
      // Don't handle touch if touching buttons or interactive elements
      if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
        return
      }
      
      // Only handle touch if this event originated from our div
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

  // Re-check if we should hide header when DOM changes
  useEffect(() => {
    if (pathname === "/exercises/basic-object") {
      const observer = new MutationObserver(() => {
        // Force re-render when data attribute changes
        setIsVisible(prev => prev)
      })
      
      observer.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['data-exercise-started']
      })
      
      return () => observer.disconnect()
    }
  }, [pathname])

  if (shouldHideHeader) {
    return null
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 ${hoverHeight} z-50`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouch}
    >
      {/* Touch indicator for mobile devices */}
      {isTouchDevice && (
        <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 transition-opacity duration-1000 ease-in-out z-30 ${
          showTouchIndicator && !isVisible ? 'opacity-80' : 'opacity-0'
        }`}>
          <div className={`bg-secondary text-primary px-2 py-1 rounded text-xs shadow-lg ${
            showTouchIndicator && !isVisible ? 'animate-pulse' : ''
          }`}>
            Tap to show menu
          </div>
        </div>
      )}
      
      {/* Hover indicator for desktop devices */}
      {!isTouchDevice && (
        <div className={`py-2 absolute top-2 left-1/2 transform -translate-x-1/2 transition-opacity duration-1000 ease-in-out z-30 ${
          showHoverIndicator && !isVisible ? 'opacity-80' : 'opacity-0'
        }`}>
          <div className={`bg-secondary text-primary px-2 py-1 rounded text-sm shadow-lg ${
            showHoverIndicator && !isVisible ? 'animate-pulse' : ''
          }`}>
            Hover to show menu
          </div>
        </div>
      )}
      <Header isVisible={isVisible} />
    </div>
  )
}
