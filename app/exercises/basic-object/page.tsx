"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UnifiedExerciseHeaderWrapper } from "@/components/unified-exercise-header"
import Image from "next/image"

export default function BasicObjectVisualizationPage() {
  const [availableImages, setAvailableImages] = useState<string[]>([]) // Just filenames
  const [usedImages, setUsedImages] = useState<string[]>([]) // Track used filenames
  const [currentImageFilename, setCurrentImageFilename] = useState<string | null>(null) // Current filename
  const [isImageRevealed, setIsImageRevealed] = useState(true)
  const [showInstructions, setShowInstructions] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load available image filenames
  const loadImageList = async () => {
    try {
      setError(null)
      const response = await fetch('/api/images?exercise=basic-object')
      if (!response.ok) {
        throw new Error('Failed to load image list')
      }
      const filenames = await response.json()
      if (filenames.error) {
        throw new Error(filenames.error)
      }
      if (filenames.length === 0) {
        throw new Error('No images found')
      }
      setAvailableImages(filenames)
      return filenames
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load image list')
      return null
    }
  }

  // Load a specific image on demand
  const loadRandomImage = async () => {
    if (availableImages.length === 0) return
    
    try {
      // Get current filename 
      const currentFilename = currentImageFilename
      
      // Get images that haven't been used yet, excluding the current image
      let unusedImages = availableImages.filter(img => 
        !usedImages.includes(img) && img !== currentFilename
      )
      
      // If all images have been used (or only current image remains), reset the used images list
      let imagesToChooseFrom = unusedImages
      if (unusedImages.length === 0) {
        // Reset and exclude only the current image
        imagesToChooseFrom = availableImages.filter(img => img !== currentFilename)
        setUsedImages(currentFilename ? [currentFilename] : []) // Keep current image in used list
      }
      
      // If we still have no options (only 1 image total), use all available
      if (imagesToChooseFrom.length === 0) {
        imagesToChooseFrom = availableImages
      }
      
      // Pick random filename from available images
      const randomFilename = imagesToChooseFrom[Math.floor(Math.random() * imagesToChooseFrom.length)]
      
      // Set the current filename
      setCurrentImageFilename(randomFilename)
      setIsImageRevealed(true)
      
      // Add this image to used images
      setUsedImages(prev => [...prev, randomFilename])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load image')
    }
  }

  const startExercise = async () => {
    setHasStarted(true)
    // Load the image list if not already loaded
    let imagesToUse = availableImages
    if (availableImages.length === 0) {
      const imageList = await loadImageList()
      if (imageList && imageList.length > 0) {
        imagesToUse = imageList
      }
    }
    // Load first random image when starting
    if (imagesToUse.length > 0) {
      const randomFilename = imagesToUse[Math.floor(Math.random() * imagesToUse.length)]
      
      setCurrentImageFilename(randomFilename)
      setIsImageRevealed(true)
      
      // Add this image to used images
      setUsedImages([randomFilename])
    }
  }

  const nextImage = () => {
    if (availableImages.length === 0) return
    loadRandomImage()
  }

  // Build src path from current filename
  const currentImageSrc = currentImageFilename ? `/images/basic-object/${currentImageFilename}` : null

  // Hide image on spacebar press or screen touch
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        setIsImageRevealed(!isImageRevealed)
      }
    }

    const handleClick = (event: MouseEvent) => {
      // Don't hide if clicking on buttons or instructions popup
      const target = event.target as HTMLElement
      if (target.closest('button') || target.closest('[role="dialog"]') || target.closest('.fixed')) {
        return
      }
      setIsImageRevealed(!isImageRevealed)
    }

    const handleTouch = (event: TouchEvent) => {
      // Don't hide if touching buttons or instructions popup
      const target = event.target as HTMLElement
      if (target.closest('button') || target.closest('[role="dialog"]') || target.closest('.fixed')) {
        return
      }
      setIsImageRevealed(!isImageRevealed)
    }

    document.addEventListener('keydown', handleKeyPress)
    document.addEventListener('click', handleClick)
    document.addEventListener('touchstart', handleTouch)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('touchstart', handleTouch)
    }
  }, [isImageRevealed])

  return (
    <div className="h-screen flex flex-col bg-background text-foreground" data-exercise-started={hasStarted.toString()}>
      {/* Main Exercise Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 pt-20">
        <div className="max-w-4xl w-full space-y-8">
          
          {/* Title - only shown before starting */}
          {!hasStarted && (
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Basic Object Visualization</h1>
              <p className="text-muted-foreground">
                Practice detailed object visualization to develop your mental imagery
              </p>
            </div>
          )}

          {/* Starting Phase */}
          {!hasStarted ? (            
          <div className="flex gap-4 justify-center">
              <Button
                onClick={startExercise}
                disabled={error !== null}
                className="btn-primary px-5 cursor-pointer py-5 text-md font-medium" size="default"
              >
                Start Exercise
              </Button>
              <Button 
                onClick={() => setShowInstructions(true)}
                className="btn-primary px-5 cursor-pointer py-5 text-md font-medium" size="default"
              >
                Instructions
              </Button>
            </div>
          ) : (
            <>
              {/* Image Display Area */}
              <div className="flex justify-center items-center min-h-[350px]">
                <div className="relative">
                  {isImageRevealed && currentImageSrc ? (
                    <div className="text-center">
                      <div className="p-8">
                        <Image
                          src={currentImageSrc}
                          alt="Image"
                          width={300}
                          height={300}
                          className="object-contain"
                          priority
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center text-red-500">
              <p>Error: {error}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please make sure there are image files in the /public/images/ directory
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Unified Exercise Header - only show when exercise has started and we have images available */}
      {hasStarted && availableImages.length > 0 && (
        <UnifiedExerciseHeaderWrapper
          onNewObject={nextImage}
          onShowInstructions={() => setShowInstructions(true)}
        />
      )}

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
                <ul className="text-muted-foreground space-y-1 ml-4 list-disc list-outside">
                  <li className="pl-2">Study the object carefully when it's visible</li>
                  <li className="pl-2">Pay attention to shape, color, texture, and details</li>
                  <li className="pl-2">Touch anywhere on screen or press spacebar to hide the image,
                        focusing on recreating every detail mentally. Press again to show the image.</li>
                  <li className="pl-2">Hover over top of screen to access control buttons</li>
                  <li className="pl-2">Use "New Object" to practice with different items</li>
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