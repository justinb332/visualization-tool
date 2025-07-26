"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    // Set canvas size to be much larger (80% of viewport)
    const maxWidth = window.innerWidth * 0.8
    const maxHeight = window.innerHeight * 0.6
    canvas.width = Math.min(maxWidth, 1000)
    canvas.height = Math.min(maxHeight, 600)

    // Set white background
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, canvas.width, canvas.height)
    
    // Set drawing properties
    context.lineCap = "round"
    context.lineJoin = "round"
  }, [])

  const getEventCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    if ("touches" in event) {
      return {
        x: (event.touches[0].clientX - rect.left) * scaleX,
        y: (event.touches[0].clientY - rect.top) * scaleY
      }
    } else {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
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

    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
    setIsRevealed(false)
  }

  const toggleReveal = () => {
    setIsRevealed(!isRevealed)
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Top Controls Bar */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button className="bg-secondary text-secondary-foreground" asChild>
              <Link href="/exercises">← Back</Link>
            </Button>
            <h2 className="text-xl font-bold">Blind Sketching</h2>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
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
              <div 
                className="w-6 h-6 rounded border border-border"
                style={{ backgroundColor: currentColor }}
              />
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
            <div className="flex gap-2">
              <Button 
                className="btn-primary text-sm"
                onClick={toggleReveal}
                disabled={!hasDrawn}
              >
                {isRevealed ? "Hide" : "Reveal"}
              </Button>
              <Button 
                className="bg-destructive text-destructive-foreground text-sm"
                onClick={clearCanvas}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="relative max-w-full max-h-full">
          <canvas
            ref={canvasRef}
            className={`border-2 border-gray-300 rounded cursor-crosshair bg-white max-w-full max-h-full ${
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
            <div className="absolute inset-0 bg-muted rounded border-2 border-dashed border-gray-400 flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground text-xl font-medium mb-2">
                  {hasDrawn ? "Drawing Hidden" : "Start Drawing Here"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {hasDrawn ? "Click 'Reveal' to see your artwork" : "Click and drag to draw - visualize in your mind!"}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Instructions Footer */}
      <div className="bg-accent p-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h4 className="font-semibold mb-2 text-sm">Instructions:</h4>
          <div className="text-xs text-muted-foreground grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <span>• Choose color and brush size above</span>
            <span>• Draw without seeing your artwork</span>
            <span>• Visualize what you're creating mentally</span>
            <span>• Click 'Reveal' to check your accuracy</span>
          </div>
        </div>
      </div>
    </div>
  )
}