"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// Object images for visualization practice
const OBJECT_IMAGES = [
  {
    src: "/images/apple.png",
    alt: "Red Apple",
    name: "Apple"
  }
  // More images can be added here as they become available
]

export default function BasicObjectVisualizationPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageRevealed, setIsImageRevealed] = useState(true)
  const [showInstructions, setShowInstructions] = useState(false)

  const currentImage = OBJECT_IMAGES[currentImageIndex]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % OBJECT_IMAGES.length)
    setIsImageRevealed(true) // Show the new image by default
  }

  const toggleImageVisibility = () => {
    setIsImageRevealed(!isImageRevealed)
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Main Exercise Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 pt-20">
        <div className="max-w-4xl w-full space-y-8">
          
          {/* Image Display Area */}
          <div className="flex justify-center items-center min-h-[350px]">
            <div className="relative">
              {isImageRevealed && (
                <div className="text-center">
                  <div className="p-8">
                    <Image
                      src={currentImage.src}
                      alt={currentImage.alt}
                      width={300}
                      height={300}
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              onClick={nextImage}
              className="btn-secondary px-6 py-2 w-32"
              disabled={OBJECT_IMAGES.length <= 1}
              variant="secondary"
            >
              New Object
            </Button>
            
            <Button 
              onClick={toggleImageVisibility}
              className="btn-secondary px-6 py-2 w-32"
              variant="secondary"
            >
              {isImageRevealed ? "Hide Image" : "Reveal Image"}
            </Button>
            
            <Button 
              onClick={() => setShowInstructions(true)}
              className="btn-secondary px-6 py-2 w-32"
              variant="secondary"
            >
              Instructions
            </Button>
          </div>

          {/* Progress Info */}
          {OBJECT_IMAGES.length > 1 && (
            <div className="text-center text-sm text-muted-foreground">
              Object {currentImageIndex + 1} of {OBJECT_IMAGES.length}
            </div>
          )}
        </div>
      </main>

      {/* Instructions Popup */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Basic Object Visualization Instructions</h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                This exercise helps you develop your mental imagery by practicing detailed object visualization.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold">How to practice:</h4>
                <ul className="text-muted-foreground space-y-1 ml-4">
                  <li>• Study the object carefully when it's visible</li>
                  <li>• Pay attention to shape, color, texture, and details</li>
                  <li>• Click "Hide Image" to practice visualization</li>
                  <li>• Close your eyes and try to "see" the object in your mind</li>
                  <li>• Focus on recreating every detail mentally</li>
                  <li>• Click "Reveal Image" to check your mental image</li>
                  <li>• Use "New Object" to practice with different items</li>
                </ul>
              </div>
              <div className="bg-accent p-3 rounded">
                <p className="text-xs text-muted-foreground">
                  <strong>Tip:</strong> Start by focusing on the overall shape, then gradually add details like color, texture, and smaller features. Practice holding the complete image in your mind for longer periods.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}