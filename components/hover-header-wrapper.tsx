"use client"

import { useState, useEffect } from "react"
import { Header } from "./header"

export function HoverHeaderWrapper() {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setIsVisible(false)
    }, 500)
    setTimeoutId(id)
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
      className="fixed top-0 left-0 right-0 h-20 z-50 overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Header isVisible={isVisible} />
    </div>
  )
}
