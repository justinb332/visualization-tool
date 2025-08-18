"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UnifiedExerciseHeaderWrapper } from "@/components/unified-exercise-header"

// Directions for movement
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
}

// Generate maze using recursive pathfinding with lookahead
const generateMaze = (trueWidth: number, trueHeight: number) => {
  // Calculate cell dimensions to support both even and odd true dimensions
  // For odd dimensions: cellWidth = (trueWidth - 1) / 2
  // For even dimensions: cellWidth = trueWidth / 2
  const cellWidth = trueWidth % 2 === 1 ? Math.floor((trueWidth - 1) / 2) : Math.floor(trueWidth / 2)
  const cellHeight = trueHeight % 2 === 1 ? Math.floor((trueHeight - 1) / 2) : Math.floor(trueHeight / 2)
  
  // Create expanded grid: (2*cellWidth+1) x (2*cellHeight+1)
  // This ensures we always get the target dimensions or close to it
  const mazeWidth = Math.min(2 * cellWidth + 1, trueWidth)
  const mazeHeight = Math.min(2 * cellHeight + 1, trueHeight)
  
  // Initialize with all walls (true = wall, false = path)
  const maze: boolean[][] = Array(mazeHeight).fill(null).map(() => Array(mazeWidth).fill(true))
  
  // Helper to convert cell coordinates to maze coordinates
  const cellToMaze = (cellX: number, cellY: number) => ({ x: cellX * 2 + 1, y: cellY * 2 + 1 })
  
  let startCellX = 0, startCellY = 0, endCellX = 0, endCellY = 0
  // Choose random start/end position across the entire maze
  while (startCellX === endCellX && startCellY === endCellY) {
    startCellX = Math.floor(Math.random() * cellWidth)
    startCellY = Math.floor(Math.random() * cellHeight)
    endCellX = Math.floor(Math.random() * cellWidth)
    endCellY = Math.floor(Math.random() * cellHeight)
  }
  
  // Convert to maze coordinates
  const start = cellToMaze(startCellX, startCellY)
  const end = cellToMaze(endCellX, endCellY)
  
  // Recursive function to check if a path exists from current position to exact end position
  const canReachEnd = (cellX: number, cellY: number, visited: Set<string>, depth: number = 0): boolean => {
    // Limit recursion depth to prevent stack overflow
    if (depth > cellWidth * cellHeight) {
      return false
    }
    
    // If we've reached the exact end cell, success!
    if (cellX === endCellX && cellY === endCellY) {
      return true
    }
    
    // Get all possible directions
    const directions = [
      { dx: 0, dy: -1, name: 'UP' },
      { dx: 0, dy: 1, name: 'DOWN' },
      { dx: -1, dy: 0, name: 'LEFT' },
      { dx: 1, dy: 0, name: 'RIGHT' }
    ]
    
    // Filter valid directions
    let validDirections = directions.filter(dir => {
      const newCellX = cellX + dir.dx
      const newCellY = cellY + dir.dy
      
      // Must be within bounds
      if (newCellX < 0 || newCellX >= cellWidth || newCellY < 0 || newCellY >= cellHeight) {
        return false
      }
      
      // Must not be already visited
      if (visited.has(`${newCellX},${newCellY}`)) {
        return false
      }
      
      return true
    })
    
    // Try each direction recursively
    for (const dir of validDirections) {
      const newCellX = cellX + dir.dx
      const newCellY = cellY + dir.dy
      const newVisited = new Set(visited)
      newVisited.add(`${newCellX},${newCellY}`)
      
      if (canReachEnd(newCellX, newCellY, newVisited, depth + 1)) {
        return true
      }
    }
    
    return false
  }
  
  // Generate path using recursive validation
  const visitedCells = new Set<string>()
  visitedCells.add(`${startCellX},${startCellY}`)
  
  // Mark start cell as path
  maze[start.y][start.x] = false
  
  let currentCellX = startCellX
  let currentCellY = startCellY
  
  // Generate path until reaching the exact end position
  let attempts = 0
  const maxAttempts = 100
  
  while ((currentCellX !== endCellX || currentCellY !== endCellY) && attempts < maxAttempts) {
    attempts++
    
    // Get all possible directions
    const allDirections = [
      { dx: 0, dy: -1, name: 'UP' },
      { dx: 0, dy: 1, name: 'DOWN' },
      { dx: -1, dy: 0, name: 'LEFT' },
      { dx: 1, dy: 0, name: 'RIGHT' }
    ]
    
    // Filter out invalid directions
    let validDirections = allDirections.filter(dir => {
      const newCellX = currentCellX + dir.dx
      const newCellY = currentCellY + dir.dy
      
      // Must be within bounds
      if (newCellX < 0 || newCellX >= cellWidth || newCellY < 0 || newCellY >= cellHeight) {
        return false
      }
      
      // Must not be visited
      if (visitedCells.has(`${newCellX},${newCellY}`)) {
        return false
      }
      
      return true
    })
    
    // If we're close to the end, try to reach it directly
    let chosenDirection
    if (Math.abs(currentCellX - endCellX) <= 1 && Math.abs(currentCellY - endCellY) <= 1) {
      const directPath = allDirections.find(dir => {
        const newCellX = currentCellX + dir.dx
        const newCellY = currentCellY + dir.dy
        return newCellX === endCellX && newCellY === endCellY
      })
      if (directPath && !visitedCells.has(`${endCellX},${endCellY}`)) {
        chosenDirection = directPath
      }
    }
    
    // If no direct path to end, use normal pathfinding
    if (!chosenDirection) {
      // Filter directions that lead to dead ends using lookahead
      const viableDirections = validDirections.filter(dir => {
        const newCellX = currentCellX + dir.dx
        const newCellY = currentCellY + dir.dy
        const testVisited = new Set(visitedCells)
        testVisited.add(`${newCellX},${newCellY}`)
        
        const result = canReachEnd(newCellX, newCellY, testVisited, visitedCells.size)
        return result
      })
      
      // Choose direction: use viable directions or any valid direction if none are viable
      if (viableDirections.length > 0) {
        chosenDirection = viableDirections[Math.floor(Math.random() * viableDirections.length)]
      } else if (validDirections.length > 0) {
        // Fallback to any valid direction
        chosenDirection = validDirections[Math.floor(Math.random() * validDirections.length)]
      } else {
        // No valid moves - regenerate with different positions
        return generateMaze(trueWidth, trueHeight)
      }
    }
    
    // Make the move
    const newCellX = currentCellX + chosenDirection.dx
    const newCellY = currentCellY + chosenDirection.dy
    
    // Update maze
    const currentMaze = cellToMaze(currentCellX, currentCellY)
    const newMaze = cellToMaze(newCellX, newCellY)
    
    // Mark new cell as path
    maze[newMaze.y][newMaze.x] = false
    
    // Remove wall between cells
    const wallX = (currentMaze.x + newMaze.x) / 2
    const wallY = (currentMaze.y + newMaze.y) / 2
    maze[wallY][wallX] = false
    
    // Update position
    currentCellX = newCellX
    currentCellY = newCellY
    visitedCells.add(`${currentCellX},${currentCellY}`)
  }
  
  // If we couldn't reach the end after max attempts, regenerate the maze
  if (currentCellX !== endCellX || currentCellY !== endCellY) {
    return generateMaze(trueWidth, trueHeight)
  }
  
  // Check if the final path meets minimum length requirement
  const totalCells = cellWidth * cellHeight
  const minPathLength = Math.floor(totalCells * 0.5)
  const actualPathLength = visitedCells.size
  
  if (actualPathLength < minPathLength) {
    return generateMaze(trueWidth, trueHeight)
  }
  
  // Ensure end cell is marked as path
  maze[end.y][end.x] = false
  
  return { 
    maze, 
    startX: start.x, 
    startY: start.y, 
    endX: end.x, 
    endY: end.y,
    mazeWidth,
    mazeHeight
  }
}

export default function InvisibleMazePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('easy')
  const [hasStarted, setHasStarted] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showPath, setShowPath] = useState(false)
  const [hasMovedOnce, setHasMovedOnce] = useState(false)
  
  // Maze state
  const [maze, setMaze] = useState<boolean[][]>([])
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 })
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set())
  const [gameWon, setGameWon] = useState(false)
  const [moveCount, setMoveCount] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [mazeStart, setMazeStart] = useState({ x: 1, y: 1 })
  const [mazeEnd, setMazeEnd] = useState({ x: 3, y: 3 })
  
  // Get maze dimensions based on difficulty (only odd)
  const getMazeDimensions = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return { trueWidth: 7, trueHeight: 5 }
      case 'medium': return { trueWidth: 9, trueHeight: 7 }
      case 'hard': return { trueWidth: 13, trueHeight: 9 }
      case 'expert': return { trueWidth: 17, trueHeight: 11 }
      default: return { trueWidth: 7, trueHeight: 5 }
    }
  }
  
  // Cycle through difficulties
  const cycleDifficulty = () => {
    const difficulties = ['easy', 'medium', 'hard', 'expert']
    const currentIndex = difficulties.indexOf(selectedDifficulty)
    const nextIndex = (currentIndex + 1) % difficulties.length
    setSelectedDifficulty(difficulties[nextIndex])
  }
  
  // Toggle show path mode
  const toggleShowPath = () => {
    setShowPath(!showPath)
  }
  
  // Start new maze
  const startMaze = () => {
    const { trueWidth, trueHeight } = getMazeDimensions(selectedDifficulty)
    const mazeData = generateMaze(trueWidth, trueHeight)
    
    setMaze(mazeData.maze)
    setMazeStart({ x: mazeData.startX, y: mazeData.startY })
    setMazeEnd({ x: mazeData.endX, y: mazeData.endY })
    setPlayerPos({ x: mazeData.startX, y: mazeData.startY })
    setVisitedCells(new Set([`${mazeData.startX},${mazeData.startY}`]))
    setGameWon(false)
    setMoveCount(0)
    setAttempts(0)
    setHasStarted(true)
    setHasMovedOnce(false)
  }
  
  // Reset to start position
  const resetPosition = () => {
    setPlayerPos({ x: mazeStart.x, y: mazeStart.y })
    setVisitedCells(new Set([`${mazeStart.x},${mazeStart.y}`]))
    setMoveCount(0)
    setHasMovedOnce(false)
    setAttempts(prev => prev + 1)
  }
  
  // Handle player movement
  const movePlayer = (direction: keyof typeof DIRECTIONS) => {
    if (gameWon) return
    
    const dir = DIRECTIONS[direction]
    const newX = playerPos.x + dir.x
    const newY = playerPos.y + dir.y
    
    // Check bounds
    if (newX < 0 || newX >= maze[0]?.length || newY < 0 || newY >= maze.length) {
      resetPosition()
      return
    }
    
    // Check if hit wall
    if (maze[newY][newX]) {
      resetPosition()
      return
    }
    
    // Valid move
    const newPos = { x: newX, y: newY }
    setPlayerPos(newPos)
    
    // If moving to a previously visited cell (going backwards), remove the last visited cell
    if (visitedCells.has(`${newX},${newY}`)) {
      // Going backwards - remove the most recent cell from the trail
      const visitedArray = Array.from(visitedCells)
      if (visitedArray.length > 1) {
        // Remove the last cell (the one we just came from)
        visitedArray.pop()
        setVisitedCells(new Set(visitedArray))
      }
    } else {
      // Moving to new cell - add to visited
      setVisitedCells(prev => new Set([...Array.from(prev), `${newX},${newY}`]))
    }
    
    setMoveCount(prev => prev + 1)
    setHasMovedOnce(true)
    
    // Check if reached end (directly adjacent to finish AND on a valid path)
    const adjacentPositions = [
      { x: mazeEnd.x - 1, y: mazeEnd.y }, // Left
      { x: mazeEnd.x + 1, y: mazeEnd.y }, // Right
      { x: mazeEnd.x, y: mazeEnd.y - 1 }, // Up
      { x: mazeEnd.x, y: mazeEnd.y + 1 }  // Down
    ]
    
    const isDirectlyAdjacentToEnd = adjacentPositions.some(pos => 
      pos.x === newX && 
      pos.y === newY && 
      pos.x >= 0 && 
      pos.x < maze[0]?.length && 
      pos.y >= 0 && 
      pos.y < maze.length &&
      !maze[pos.y][pos.x] // Must be on a valid path (not a wall)
    )
    
    if (isDirectlyAdjacentToEnd) {
      setGameWon(true)
    }
  }
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!hasStarted || gameWon) return
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          movePlayer('UP')
          break
        case 'ArrowDown':
          e.preventDefault()
          movePlayer('DOWN')
          break
        case 'ArrowLeft':
          e.preventDefault()
          movePlayer('LEFT')
          break
        case 'ArrowRight':
          e.preventDefault()
          movePlayer('RIGHT')
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [hasStarted, gameWon, playerPos, maze])
  
  const getCellClass = (x: number, y: number) => {
    const isPlayer = playerPos.x === x && playerPos.y === y
    const isVisited = visitedCells.has(`${x},${y}`)
    const isStart = x === mazeStart.x && y === mazeStart.y
    const isEnd = x === mazeEnd.x && y === mazeEnd.y
    const isWall = maze[y] && maze[y][x]
    const isPath = !isWall
    const shouldShowPath = showPath && !hasMovedOnce && isPath
    
    // Always show finish cell (highest priority)
    if (isEnd) return "bg-green-600"
    
    // Always show start cell (overrides player when at same position)
    if (isStart) return "bg-blue-500"
    
    // Visited cells using theme-aware muted color
    if (isVisited && !isWall) return "bg-trail"
    
    // Starting path preview using theme-aware accent color
    if (shouldShowPath) return "bg-start-trail"
    
    return "bg-background"
  }
  
  const getCellSize = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return "w-24 h-24"
      case 'medium': return "w-19 h-19"
      case 'hard': return "w-15 h-14"
      case 'expert': return "w-12 h-11"
      default: return "w-24 h-24"
    }
  }

  const getOverlayPadding = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return { top: "pt-3", bottom: "pb-1" }       // Small maze = normal padding
      case 'medium': return { top: "pt-2", bottom: "pb-0" }     // Medium maze = less padding  
      case 'hard': return { top: "-mt-2", bottom: "-mb-4" }       // Large maze = minimal padding
      case 'expert': return { top: "-mt-4", bottom: "-mb-6" }   // Huge maze = negative margins!
      default: return { top: "pt-1", bottom: "pb-1" }
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground" data-exercise-started={hasStarted.toString()}>
      {/* Main Exercise Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 pt-20">
        <div className="max-w-6xl w-full space-y-8">
          
          {/* Title - only shown before starting */}
          {!hasStarted && (
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Invisible Maze</h1>
              <p className="text-muted-foreground">
                Navigate through an invisible maze using only your spatial memory
              </p>
            </div>
          )}

          {/* Starting Phase */}
          {!hasStarted ? (
            <div className="space-y-4">
              {/* Difficulty Selection */}
              <div className="text-center">
                <div className="flex gap-4 justify-center mb-4">
                  <Button
                    onClick={cycleDifficulty}
                    variant='outline'
                    className="btn-secondary px-4 cursor-pointer py-4 text-md font-medium" 
                    size="default"
                  >
                    Difficulty: {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
                  </Button>
                  <Button
                    onClick={toggleShowPath}
                    variant='outline'
                    className="btn-secondary px-4 cursor-pointer py-4 text-md font-medium" 
                    size="default"
                  >
                    Starting Path: {showPath ? 'On' : 'Off'}
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={startMaze}
                  className="btn-primary px-5 cursor-pointer py-5 text-md font-medium" 
                  size="default"
                >
                  Start Maze
                </Button>
                <Button 
                  onClick={() => setShowInstructions(true)}
                  className="btn-primary px-5 cursor-pointer py-5 text-md font-medium" 
                  size="default"
                >
                  Instructions
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Maze Grid with Completion Overlay */}
              <div className="flex justify-center relative">
                <div className="inline-block">
                  {maze.map((row, y) => (
                    <div key={y} className="flex">
                      {row.map((_, x) => (
                        <div
                          key={`${x}-${y}`}
                          className={`${getCellSize(selectedDifficulty)} ${getCellClass(x, y)}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Completion Overlay */}
                {(gameWon) && (
                  <div className="absolute inset-0 flex flex-col justify-between rounded-lg z-10">
                    {/* Completion Message at Top */}
                    <div className={`flex justify-center ${getOverlayPadding(selectedDifficulty).top}`}>
                      <div className="text-foreground font-bold text-3xl text-center">
                        Maze Completed in {attempts + 1} {attempts + 1 === 1 ? 'Attempt' : 'Attempts'}!
                      </div>
                    </div>

                    {/* Completion Buttons at Bottom */}
                    <div className={`flex justify-center ${getOverlayPadding(selectedDifficulty).bottom}`}>
                      <div className="flex gap-4">
                        <Button 
                          onClick={startMaze}
                          className="btn-primary px-5 cursor-pointer py-5 text-md font-medium" 
                          size="default"
                        >
                          Try Another
                        </Button>
                        <Button 
                          onClick={() => setShowInstructions(true)}
                          className="btn-primary px-5 cursor-pointer py-5 text-md font-medium" 
                          size="default"
                        >
                          Instructions
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Unified Exercise Header - only show when exercise has started and not completed */}
      {hasStarted && !gameWon && (
        <UnifiedExerciseHeaderWrapper
          onNewObject={startMaze}
          onShowInstructions={() => setShowInstructions(true)}
          newObjectLabel="New Maze"
        />
      )}

      {/* Instructions Popup */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Invisible Maze Instructions</h3>
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
                Navigate through an invisible maze with randomly generated winding paths and proper wall structure.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold">How to play:</h4>
                <ul className="text-muted-foreground space-y-1 ml-4 list-disc list-outside">
                  <li className="pl-2">Use arrow keys to move through the maze</li>
                  <li className="pl-2">You start from the blue square</li>
                  <li className="pl-2">Try to reach the green finish square</li>
                  <li className="pl-2">If you go off course, you restart at the beginning</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Difficulty Levels:</h4>
                <ul className="text-muted-foreground space-y-1 ml-4 text-xs">
                  <li>• <strong>Easy:</strong> 5x3 Grid</li>
                  <li>• <strong>Medium:</strong> 7x5 Grid</li>
                  <li>• <strong>Hard:</strong> 11x7 Grid</li>
                  <li>• <strong>Expert:</strong> 15x9 Grid</li>
                </ul>
              </div>
              <div className="bg-accent p-3 rounded">
                <p className="text-xs text-muted-foreground">
                  <strong>Tip:</strong> Try to build a mental map and visualize the path on screen.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}