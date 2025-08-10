"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

// Generate random RGB color based on difficulty
const generateRandomColor = (difficulty: string) => {
  const getRandomValue = () => {
    const base = Math.floor(Math.random() * 256)
    
    switch (difficulty) {
      case 'easy':
        return Math.floor(base / 15) * 15  // Multiples of 15 (0, 15, 30, 45, ..., 255)
      case 'medium':
        return Math.floor(base / 5) * 5    // Multiples of 5 (0, 5, 10, 15, ..., 255)
      case 'hard':
        return Math.floor(base / 3) * 3    // Multiples of 3 (0, 3, 6, 9, ..., 255)
      case 'expert':
      default:
        return base                        // Any value 0-255
    }
  }
  
  return [
    getRandomValue(), // Red
    getRandomValue(), // Green
    getRandomValue(), // Blue
  ]
}

// Get slider step based on difficulty
const getSliderStep = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 15
    case 'medium': return 5
    case 'hard': return 3
    case 'expert':
    default: return 1
  }
}

// Snap user input to valid values for difficulty
const snapToValidValue = (value: number, difficulty: string) => {
  const step = getSliderStep(difficulty)
  return Math.round(value / step) * step
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
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('easy') // Track selected difficulty, default to easy

  // Cycle through difficulties
  const cycleDifficulty = () => {
    const difficulties = ['easy', 'medium', 'hard', 'expert']
    const currentIndex = difficulties.indexOf(selectedDifficulty)
    const nextIndex = (currentIndex + 1) % difficulties.length
    setSelectedDifficulty(difficulties[nextIndex])
  }

  // Start a new round
  const startRound = () => {
    const randomColor = generateRandomColor(selectedDifficulty)
    setCurrentColor(randomColor)
    
    // Set initial user values to valid multiples for the difficulty
    const initialValue = snapToValidValue(128, selectedDifficulty)
    setUserRed(initialValue)
    setUserGreen(initialValue)
    setUserBlue(initialValue)
    
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
            <div className="space-y-4">
              {/* Difficulty Selection */}
              <div className="text-center">
                <Button
                  onClick={cycleDifficulty}
                  variant='outline'
                  className="btn-secondary px-4 cursor-pointer py-4 text-md font-medium" 
                  size="default"
                >
                  Difficulty: {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center max-w-xs mx-auto">
                <Button 
                  onClick={startRound}
                  className="btn-primary flex-1 cursor-pointer py-5 text-md font-medium" 
                  size="default"
                >
                  Start Exercise
                </Button>
                <Button 
                  onClick={() => setShowInstructions(true)}
                  className="btn-primary flex-1 cursor-pointer py-5 text-md font-medium" 
                  size="default"
                >
                  Instructions
                </Button>
              </div>
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
                      step={getSliderStep(selectedDifficulty)}
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
                      step={getSliderStep(selectedDifficulty)}
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
                      step={getSliderStep(selectedDifficulty)}
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
                    <div className="text-sm text-muted-foreground -mt-1">
                      <p className="text-s mt-2">Difficulty: {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex gap-4 justify-center">
                {phase === 'recreating' && (
                  <Button 
                    onClick={submitColor}
                    className="btn-primary px-5 cursor-pointer py-5 text-md font-medium" size="default"
                  >
                    Submit Color
                  </Button>
                )}
                
                {phase === 'comparing' && (
                  <div className="flex gap-4">
                    <Button 
                      onClick={startRound}
                      className="btn-primary px-5 cursor-pointer py-5 text-md font-medium" size="default"
                    >
                      Try Another
                    </Button>
                    <Button 
                      onClick={() => setShowInstructions(true)}
                      className="btn-primary px-5 cursor-pointer py-5 text-md font-medium" size="default"
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
              <h3 className="text-xl font-bold">Color Recall Instructions</h3>
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
                  <li>• Choose your difficulty level before starting</li>
                  <li>• A color will be shown for 5 seconds</li>
                  <li>• Study the color carefully and try to memorize it</li>
                  <li>• After it disappears, use the RGB sliders to recreate it</li>
                  <li>• Try to visualize the exact shade in your mind</li>
                  <li>• Submit your recreation to see how close you got</li>
                  <li>• Higher scores mean better color memory!</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Difficulty Levels:</h4>
                <ul className="text-muted-foreground space-y-1 ml-4 text-xs">
                  <li>• <strong>Easy:</strong> 15-step increments (18 options per channel)</li>
                  <li>• <strong>Medium:</strong> 5-step increments (52 options per channel)</li>
                  <li>• <strong>Hard:</strong> 3-step increments (86 options per channel)</li>
                  <li>• <strong>Expert:</strong> 1-step increments (256 options per channel)</li>
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
