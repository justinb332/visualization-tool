"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"


const COLORS = [
  { value: "#000000", name: "Black" }, 
  { value: "#ffffff", name: "White" }, 
  { value: "#ff0000", name: "Red" }, 
  { value: "#00ff00", name: "Green" }, 
  { value: "#0000ff", name: "Blue" }, 
  { value: "#ffff00", name: "Yellow" }, 
  { value: "#ff00ff", name: "Magenta" },
  { value: "#00ffff", name: "Cyan" }, 
  { value: "#ffa500", name: "Orange" },
  { value: "#800080", name: "Purple" },
  { value: "#008000", name: "Dark Green" },
  { value: "#800000", name: "Maroon" },
]

const BRUSH_SIZES = [2, 5, 10, 20]

export default function SketchPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [isRevealed, setIsRevealed] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    // Set display size to take up most of the screen (updated)
    const displayWidth = Math.min(window.innerWidth * 0.95, 1400)
    const displayHeight = Math.min(window.innerHeight * 0.75, 800)
    
    // Set canvas style size (what the user sees)
    canvas.style.width = `${displayWidth}px`
    canvas.style.height = `${displayHeight}px`
    
    // Set actual canvas resolution (much higher for better quality)
    const pixelRatio = window.devicePixelRatio || 1
    const scaleFactor = 2 // Additional scaling for even better quality
    canvas.width = displayWidth * pixelRatio * scaleFactor
    canvas.height = displayHeight * pixelRatio * scaleFactor
    
    // Scale the drawing context to match the high resolution
    context.scale(pixelRatio * scaleFactor, pixelRatio * scaleFactor)

    // Function to update canvas background
    const updateCanvasBackground = () => {
      const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
      context.fillStyle = backgroundColor
      // Save current transform
      context.save()
      // Reset transform to fill entire canvas
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.fillRect(0, 0, canvas.width, canvas.height)
      // Restore transform
      context.restore()
    }

    // Set initial background
    updateCanvasBackground()
    
    // Set drawing properties
    context.lineCap = "round"
    context.lineJoin = "round"

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          // Preserve existing drawing
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          updateCanvasBackground()
          context.putImageData(imageData, 0, 0)
        }
      })
    })

    // Start observing theme changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })

    // Cleanup observer on unmount
    return () => observer.disconnect()
  }, [])

  const getEventCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    // No scaling needed since we're using CSS to scale the canvas display
    
    if ("touches" in event) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top
      }
    } else {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
    }
  }

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    const { x, y } = getEventCoordinates(event)

    setIsDrawing(true)
    setHasDrawn(true)
    
    context.strokeStyle = currentColor
    context.lineWidth = brushSize
    context.beginPath()
    context.moveTo(x, y)
  }

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    const { x, y } = getEventCoordinates(event)

    context.lineTo(x, y)
    context.stroke()
  }

  const stopDrawing = (event?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (event) {
      event.preventDefault()
    }
    if (isDrawing) {
      const canvas = canvasRef.current
      const context = canvas?.getContext("2d")
      if (context) {
        context.closePath()
      }
    }
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    // Get background color from CSS variable
    const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
    context.fillStyle = backgroundColor
    
    // Save current transform
    context.save()
    // Reset transform to fill entire canvas
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.fillRect(0, 0, canvas.width, canvas.height)
    // Restore transform
    context.restore()
    
    setHasDrawn(false)
    setIsRevealed(false)
  }

  const toggleReveal = () => {
    setIsRevealed(!isRevealed)
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-16">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className={`border-2 border-gray-300 rounded cursor-crosshair bg-background ${
              !isRevealed ? "opacity-0" : "opacity-100"
            } transition-opacity duration-500`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
            style={{ 
              touchAction: "none",
              display: "block"
            }}
          />
          {!isRevealed && (
            <div 
              className="absolute inset-0 bg-muted rounded border-2 border-dashed border-gray-400 flex items-center justify-center pointer-events-none"
            >
            </div>
          )}
        </div>

        {/* Controls Below Canvas */}
        <div className="mt-6 space-y-4">
          {/* All controls on one line */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {/* Color Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Color:</label>
              <select 
                value={currentColor} 
                onChange={(e) => setCurrentColor(e.target.value)}
                className="bg-background border border-border rounded px-3 py-1 text-sm"
              >
                {COLORS.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brush Size Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Brush:</label>
              <select 
                value={brushSize} 
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="bg-background border border-border rounded px-3 py-1 text-sm"
              >
                {BRUSH_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <button 
              className="btn-secondary px-3 py-1 rounded-md"
              onClick={toggleReveal}
            >
              {isRevealed ? "Hide Drawing" : "Reveal Drawing"}
            </button>
            <button 
              className="btn-secondary px-3 py-1 rounded-md"
              onClick={clearCanvas}
            >
              Clear Canvas
            </button>
            <button 
              className="btn-secondary px-3 py-1 rounded-md"
              onClick={() => setShowInstructions(true)}
            >
              Instructions
            </button>
          </div>
        </div>
      </main>

      {/* Instructions Popup */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Blind Sketching Instructions</h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                This exercise helps you improve your mental imagery and achieve prophantasia by drawing without visual feedback.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold">How to practice:</h4>
                <ul className="text-muted-foreground space-y-1 ml-4">
                  <li>• Choose a color and brush size</li>
                  <li>• Draw on the canvas without seeing your artwork</li>
                  <li>• Visualize what you're creating mentally as you draw</li>
                  <li>• Try to "see" your drawing in your mind's eye</li>
                  <li>• Click "Reveal Drawing" to check your accuracy</li>
                  <li>• Compare your mental image with the actual result</li>
                  <li>• Use "Clear Canvas" to start over</li>
                </ul>
              </div>
              <div className="bg-accent p-3 rounded">
                <p className="text-xs text-muted-foreground">
                  <strong>Tip:</strong> Start with simple shapes and gradually work up to more complex drawings as your visualization skills improve.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
