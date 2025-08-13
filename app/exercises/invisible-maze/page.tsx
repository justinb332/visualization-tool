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
const generateMaze = (cellWidth: number, cellHeight: number) => {
  // Create expanded grid: (2*cellWidth+1) x (2*cellHeight+1)
  // Odd coordinates = cells, Even coordinates = walls
  const mazeWidth = 2 * cellWidth + 1
  const mazeHeight = 2 * cellHeight + 1
  
  // Initialize with all walls (true = wall, false = path)
  const maze: boolean[][] = Array(mazeHeight).fill(null).map(() => Array(mazeWidth).fill(true))
  
  // Helper to convert cell coordinates to maze coordinates
  const cellToMaze = (cellX: number, cellY: number) => ({ x: cellX * 2 + 1, y: cellY * 2 + 1 })
  
  // Choose random start position on left edge (cell coordinates)
  const startCellY = Math.floor(Math.random() * cellHeight)
  const endCellY = Math.floor(Math.random() * cellHeight)
  
  // Convert to maze coordinates
  const start = cellToMaze(0, startCellY)
  const end = cellToMaze(cellWidth - 1, endCellY)
  
  // Recursive function to check if a path exists from current position to rightmost edge
  const canReachEnd = (cellX: number, cellY: number, visited: Set<string>, depth: number = 0): boolean => {
    // Limit recursion depth to prevent stack overflow
    if (depth > cellWidth * cellHeight) return false
    
    // If we've reached the rightmost edge, success!
    if (cellX === cellWidth - 1) return true
    
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
    
    // Apply dead-end prevention rules
    if (cellY === 0) {
      validDirections = validDirections.filter(dir => dir.name !== 'LEFT')
    }
    if (cellY === cellHeight - 1) {
      validDirections = validDirections.filter(dir => dir.name !== 'LEFT')
    }
    if (cellX === 0) {
      if (cellY < startCellY) {
        validDirections = validDirections.filter(dir => dir.name !== 'DOWN')
      } else if (cellY > startCellY) {
        validDirections = validDirections.filter(dir => dir.name !== 'UP')
      }
    }
    
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
  visitedCells.add(`${0},${startCellY}`)
  
  // Mark start cell as path
  maze[start.y][start.x] = false
  
  let currentCellX = 0
  let currentCellY = startCellY
  
  while (currentCellX < cellWidth - 1) {
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
    
    // Apply dead-end prevention rules
    if (currentCellY === 0) {
      validDirections = validDirections.filter(dir => dir.name !== 'LEFT')
    }
    if (currentCellY === cellHeight - 1) {
      validDirections = validDirections.filter(dir => dir.name !== 'LEFT')
    }
    if (currentCellX === 0) {
      if (currentCellY < startCellY) {
        validDirections = validDirections.filter(dir => dir.name !== 'DOWN')
      } else if (currentCellY > startCellY) {
        validDirections = validDirections.filter(dir => dir.name !== 'UP')
      }
    }
    
    // Filter directions that lead to dead ends using lookahead
    const viableDirections = validDirections.filter(dir => {
      const newCellX = currentCellX + dir.dx
      const newCellY = currentCellY + dir.dy
      const testVisited = new Set(visitedCells)
      testVisited.add(`${newCellX},${newCellY}`)
      
      return canReachEnd(newCellX, newCellY, testVisited)
    })
    
    // Choose direction: prefer viable directions, fallback to valid if needed
    let chosenDirection
    if (viableDirections.length > 0) {
      chosenDirection = viableDirections[Math.floor(Math.random() * viableDirections.length)]
    } else if (validDirections.length > 0) {
      // Fallback to any valid direction if lookahead fails
      chosenDirection = validDirections[Math.floor(Math.random() * validDirections.length)]
    } else {
      // No valid moves - should rarely happen with this approach
      break
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
  
  // Connect to end position if needed
  if (currentCellY !== endCellY) {
    const minCellY = Math.min(currentCellY, endCellY)
    const maxCellY = Math.max(currentCellY, endCellY)
    
    for (let cellY = minCellY; cellY < maxCellY; cellY++) {
      const current = cellToMaze(cellWidth - 1, cellY)
      const next = cellToMaze(cellWidth - 1, cellY + 1)
      
      maze[current.y][current.x] = false
      maze[next.y][next.x] = false
      
      const wallY = (current.y + next.y) / 2
      maze[wallY][current.x] = false
    }
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
  const [debugMode, setDebugMode] = useState(false)
  
  // Maze state
  const [maze, setMaze] = useState<boolean[][]>([])
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 })
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set())
  const [gameWon, setGameWon] = useState(false)
  const [moveCount, setMoveCount] = useState(0)
  const [mazeStart, setMazeStart] = useState({ x: 1, y: 1 })
  const [mazeEnd, setMazeEnd] = useState({ x: 3, y: 3 })
  
  // Get maze dimensions based on difficulty (cell dimensions)
  const getMazeDimensions = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return { cellWidth: 6, cellHeight: 4 }
      case 'medium': return { cellWidth: 8, cellHeight: 6 }
      case 'hard': return { cellWidth: 12, cellHeight: 8 }
      case 'expert': return { cellWidth: 16, cellHeight: 10 }
      default: return { cellWidth: 6, cellHeight: 4 }
    }
  }
  
  // Cycle through difficulties
  const cycleDifficulty = () => {
    const difficulties = ['easy', 'medium', 'hard', 'expert']
    const currentIndex = difficulties.indexOf(selectedDifficulty)
    const nextIndex = (currentIndex + 1) % difficulties.length
    setSelectedDifficulty(difficulties[nextIndex])
  }
  
  // Start new maze
  const startMaze = () => {
    const { cellWidth, cellHeight } = getMazeDimensions(selectedDifficulty)
    const mazeData = generateMaze(cellWidth, cellHeight)
    
    setMaze(mazeData.maze)
    setMazeStart({ x: mazeData.startX, y: mazeData.startY })
    setMazeEnd({ x: mazeData.endX, y: mazeData.endY })
    setPlayerPos({ x: mazeData.startX, y: mazeData.startY })
    setVisitedCells(new Set([`${mazeData.startX},${mazeData.startY}`]))
    setGameWon(false)
    setMoveCount(0)
    setHasStarted(true)
  }
  
  // Reset to start position
  const resetPosition = () => {
    setPlayerPos({ x: mazeStart.x, y: mazeStart.y })
    setVisitedCells(new Set([`${mazeStart.x},${mazeStart.y}`]))
    setMoveCount(0)
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
    setVisitedCells(prev => new Set([...Array.from(prev), `${newX},${newY}`]))
    setMoveCount(prev => prev + 1)
    
    // Check if reached end
    if (newX === mazeEnd.x && newY === mazeEnd.y) {
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
    
    if (isPlayer) return "bg-blue-500"
    // Always show finish cell
    if (isEnd) return "bg-green-500"
    if (isStart && !isPlayer) return "bg-yellow-500"
    if (isVisited && !isWall) return "bg-blue-200"
    if (debugMode) return isWall ? "bg-gray-800" : "bg-gray-200"
    return "bg-gray-100"
  }
  
  const getCellSize = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return "w-6 h-6"
      case 'medium': return "w-5 h-5"
      case 'hard': return "w-4 h-4"
      case 'expert': return "w-3 h-3"
      default: return "w-6 h-6"
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
                <Button
                  onClick={cycleDifficulty}
                  variant='outline'
                  className="btn-secondary px-4 cursor-pointer py-4 text-md font-medium" 
                  size="default"
                >
                  Difficulty: {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedDifficulty === 'easy' && '13×9 grid - winding paths with proper walls'}
                  {selectedDifficulty === 'medium' && '17×13 grid - more complex navigation'}
                  {selectedDifficulty === 'hard' && '25×17 grid - challenging mazes'}
                  {selectedDifficulty === 'expert' && '33×21 grid - maximum challenge'}
                </p>
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
              {/* Game Stats */}
              <div className="text-center space-y-2">
                <div className="flex justify-center gap-8 text-sm">
                  <span>Moves: {moveCount}</span>
                  <span>Difficulty: {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}</span>
                </div>
                {gameWon && (
                  <div className="text-green-600 font-bold text-lg">
                    🎉 Maze Completed! Moves: {moveCount}
                  </div>
                )}
              </div>

              {/* Maze Grid */}
              <div className="flex justify-center">
                <div className="inline-block border-2 border-gray-400 p-1 bg-gray-800">
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
              </div>

              {/* Legend */}
              <div className="flex justify-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 border"></div>
                    <span>Start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 border"></div>
                    <span>You</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-200 border"></div>
                    <span>Path</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 border"></div>
                    <span>Finish</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="text-center text-sm text-muted-foreground space-y-2">
                <div>Use arrow keys to move • Hit a wall and restart from beginning</div>
                <button
                  onClick={() => setDebugMode(!debugMode)}
                  className="text-xs text-blue-500 hover:text-blue-700 underline"
                >
                  {debugMode ? 'Hide Maze Structure' : 'Show Maze Structure (Debug)'}
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Unified Exercise Header - only show when exercise has started */}
      {hasStarted && (
        <UnifiedExerciseHeaderWrapper
          onNewObject={startMaze}
          onShowInstructions={() => setShowInstructions(true)}
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
                  <li className="pl-2">You can only see where you've been (blue trail)</li>
                  <li className="pl-2">Start from the yellow square on the left side</li>
                  <li className="pl-2">Try to reach the green finish square on the right side</li>
                  <li className="pl-2">If you hit a wall, you restart at the beginning</li>
                  <li className="pl-2">Use your memory to navigate around walls</li>
                  <li className="pl-2">Lower move counts mean better performance</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Difficulty Levels:</h4>
                <ul className="text-muted-foreground space-y-1 ml-4 text-xs">
                  <li>• <strong>Easy:</strong> Small maze with larger cells</li>
                  <li>• <strong>Medium:</strong> Moderate complexity</li>
                  <li>• <strong>Hard:</strong> Complex navigation required</li>
                  <li>• <strong>Expert:</strong> Maximum challenge</li>
                </ul>
              </div>
              <div className="bg-accent p-3 rounded">
                <p className="text-xs text-muted-foreground">
                  <strong>Unique Algorithm:</strong> This maze uses a special generation algorithm that creates winding paths without dead ends, with proper one-line-thick walls between cells.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}