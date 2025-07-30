"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

// Generate random RGB color
const generateRandomColor = () => {
  return [
    Math.floor(Math.random() * 256), // Red (0-255)
    Math.floor(Math.random() * 256), // Green (0-255)
    Math.floor(Math.random() * 256), // Blue (0-255)
  ]
}

export default function ColorGradientPage() {
  const [currentColor, setCurrentColor] = useState<number[] | null>(null)
  const [userRed, setUserRed] = useState(128)
  const [userGreen, setUserGreen] = useState(128)
  const [userBlue, setUserBlue] = useState(128)
  const [showTarget, setShowTarget] = useState(false)
  const [phase, setPhase] = useState<'waiting' | 'memorizing' | 'recreating' | 'comparing'>('waiting')
  const [score, setScore] = useState<number | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  // Start a new round
  const startRound = () => {
    const randomColor = generateRandomColor()
    setCurrentColor(randomColor)
    setUserRed(128)
    setUserGreen(128)
    setUserBlue(128)
    setShowTarget(true)
    setPhase('memorizing')
    setScore(null)
    setCountdown(5)
    setHasStarted(true)
  }

  // Countdown effect for memorization phase
  useEffect(() => {
    if (phase === 'memorizing' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (phase === 'memorizing' && countdown === 0) {
      setShowTarget(false)
      setPhase('recreating')
    }
  }, [phase, countdown])

  // Calculate color accuracy score
  const calculateScore = () => {
    if (!currentColor) return 0
    
    const [targetR, targetG, targetB] = currentColor
    const diffR = Math.abs(targetR - userRed)
    const diffG = Math.abs(targetG - userGreen)
    const diffB = Math.abs(targetB - userBlue)
    
    // Calculate maximum possible error for each component
    // For a target value, max error is the distance to the furthest extreme (0 or 255)
    const maxErrorR = Math.max(targetR, 255 - targetR)
    const maxErrorG = Math.max(targetG, 255 - targetG)
    const maxErrorB = Math.max(targetB, 255 - targetB)
    
    // Calculate accuracy for each component (0-100%)
    const accuracyR = Math.max(0, 100 - (diffR / maxErrorR) * 100)
    const accuracyG = Math.max(0, 100 - (diffG / maxErrorG) * 100)
    const accuracyB = Math.max(0, 100 - (diffB / maxErrorB) * 100)
    
    // Average the three component accuracies
    const overallAccuracy = (accuracyR + accuracyG + accuracyB) / 3
    return Math.round(overallAccuracy)
  }

  const submitColor = () => {
    const accuracy = calculateScore()
    setScore(accuracy)
    setShowTarget(true)
    setPhase('comparing')
  }

  const resetRound = () => {
    setPhase('waiting')
    setCurrentColor(null)
    setShowTarget(false)
    setScore(null)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-blue-600" 
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreMessage = (score: number) => {
    if (score >= 95) return "Perfect! Amazing color memory!"
    if (score >= 90) return "Excellent! Very close match!"
    if (score >= 75) return "Great! Good color visualization!"
    if (score >= 60) return "Good effort! Keep practicing!"
    return "Keep trying! Color memory improves with practice!"
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Main Exercise Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 pt-20">
        <div className="max-w-4xl w-full space-y-8">
          
          {/* Title - only shown before starting */}
          {!hasStarted && (
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Color Recall</h1>
              <p className="text-muted-foreground">
                Memorize the color and recreate it using RGB sliders
              </p>
            </div>
          )}

          {/* Starting Phase */}
          {!hasStarted ? (
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={startRound}
                className="btn-primary px-8 cursor-pointer py-5 text-md font-medium" size="default"
              >
                Start Exercise
              </Button>
              <Button 
                onClick={() => setShowInstructions(true)}
                className="btn-primary px-8 cursor-pointer py-5 text-md font-medium" size="default"
              >
                Instructions
              </Button>
            </div>
          ) : (
            <>
              {/* Color Display Area */}
              <div className="flex gap-8 justify-center items-center">
                
                {/* Target Color (shown during memorizing and comparing phases) */}
                {showTarget && currentColor && (
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      {phase === 'memorizing' ? 'Memorize This Color' : 'Target Color'}
                    </h3>
                    <div 
                      className="w-48 h-48 rounded-lg border-2 border-gray-300 shadow-lg"
                      style={{ 
                        backgroundColor: `rgb(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]})` 
                      }}
                    />
                    {phase === 'memorizing' && (
                      <p className="text-2xl font-bold text-blue-600 mt-2">{countdown}s</p>
                    )}
                    {phase === 'comparing' && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        RGB({currentColor[0]}, {currentColor[1]}, {currentColor[2]})
                      </p>
                    )}
                  </div>
                )}

                {/* User Color (shown during recreating and comparing phases) */}
                {(phase === 'recreating' || phase === 'comparing') && (
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Your Recreation</h3>
                    <div 
                      className="w-48 h-48 rounded-lg border-2 border-gray-300 shadow-lg"
                      style={{ 
                        backgroundColor: `rgb(${userRed}, ${userGreen}, ${userBlue})` 
                      }}
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      RGB({userRed}, {userGreen}, {userBlue})
                    </p>
                  </div>
                )}
              </div>

              {/* RGB Sliders (shown during recreating phase) */}
              {phase === 'recreating' && (
                <div className="max-w-md mx-auto space-y-4">
                  <h3 className="text-lg font-semibold text-center mb-4">
                    Recreate the color from memory
                  </h3>
                  
                  {/* Red Slider */}
                  <div className="space-y-2">
                    <label className="flex justify-between text-sm font-medium">
                      <span>Red: {userRed}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={userRed}
                      onChange={(e) => setUserRed(Number(e.target.value))}
                      className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer slider-red"
                    />
                  </div>

                  {/* Green Slider */}
                  <div className="space-y-2">
                    <label className="flex justify-between text-sm font-medium">
                      <span>Green: {userGreen}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={userGreen}
                      onChange={(e) => setUserGreen(Number(e.target.value))}
                      className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider-green"
                    />
                  </div>

                  {/* Blue Slider */}
                  <div className="space-y-2">
                    <label className="flex justify-between text-sm font-medium">
                      <span>Blue: {userBlue}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={userBlue}
                      onChange={(e) => setUserBlue(Number(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider-blue"
                    />
                  </div>
                </div>
              )}

              {/* Score Display */}
              {phase === 'comparing' && score !== null && (
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Your Score</h3>
                  <p className={`text-4xl font-bold ${getScoreColor(score)}`}>
                    {score}%
                  </p>
                  <p className="text-muted-foreground">
                    {getScoreMessage(score)}
                  </p>
                  {currentColor && (
                    <div className="text-sm text-muted-foreground mt-4">
                      <p>Target: RGB({currentColor[0]}, {currentColor[1]}, {currentColor[2]})</p>
                      <p>Your guess: RGB({userRed}, {userGreen}, {userBlue})</p>
                    </div>
                  )}
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex gap-4 justify-center">
                {phase === 'recreating' && (
                  <Button 
                    onClick={submitColor}
                    className="px-6 py-2"
                  >
                    Submit Color
                  </Button>
                )}
                
                {phase === 'comparing' && (
                  <div className="flex gap-4">
                    <Button 
                      onClick={startRound}
                      className="px-6 py-2"
                    >
                      Try Another
                    </Button>
                    <Button 
                      onClick={() => setShowInstructions(true)}
                      className="px-6 py-2"
                    >
                      Instructions
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Instructions Popup */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Color Gradient Instructions</h3>
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
                This exercise helps you develop color memory and visualization skills by recreating colors from memory.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold">How to practice:</h4>
                <ul className="text-muted-foreground space-y-1 ml-4">
                  <li>• A color will be shown for 5 seconds</li>
                  <li>• Study the color carefully and try to memorize it</li>
                  <li>• After it disappears, use the RGB sliders to recreate it</li>
                  <li>• Try to visualize the exact shade in your mind</li>
                  <li>• Submit your recreation to see how close you got</li>
                  <li>• Higher scores mean better color memory!</li>
                </ul>
              </div>
              <div className="bg-accent p-3 rounded">
                <p className="text-xs text-muted-foreground">
                  <strong>Tip:</strong> Focus on the color's brightness, saturation, and hue. Try to form a mental image of the color even after it disappears.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider-red::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
        }
        .slider-green::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
        }
        .slider-blue::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
