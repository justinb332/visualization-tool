import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ExercisesPage() {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <main className="flex flex-col items-center justify-center px-8 py-12 flex-grow overflow-y-auto">
        <div className="text-center max-w-2xl">
          <div className="absolute top-4 left-4">
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Visualization Exercises</h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            Here you will find various exercises to improve your mental imagery and achieve prophantasia. Select an
            exercise to begin your training.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="bg-card p-6 rounded-lg shadow-lg border border-border text-card-foreground flex flex-col h-full">
              <h3 className="text-xl font-semibold mb-2">Basic Object Visualization</h3>
              <p className="text-muted-foreground text-sm mb-4 flex-grow">Focus on visualizing simple objects in detail.</p>
              <div className="flex justify-center">
                <Button className="btn-primary w-2/3 text-md" asChild>
                  <Link href="/exercises/basic-object">
                    <span>Start</span>
                  </Link>
                </Button>
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-lg border border-border text-card-foreground flex flex-col h-full">
              <h3 className="text-xl font-semibold mb-2">Blind Sketch</h3>
              <p className="text-muted-foreground text-sm mb-4 flex-grow">Use the canvas to draw, but visualize your sketch mentally.</p>
              <div className="flex justify-center">
                <Button className="btn-primary text-md w-2/3" asChild>
                  <Link href="/exercises/sketch">
                    <span>Start</span>
                  </Link>
                </Button>
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-lg border border-border text-card-foreground flex flex-col h-full">
              <h3 className="text-xl font-semibold mb-2">Color Recall</h3>
              <p className="text-muted-foreground text-sm mb-4 flex-grow">
                Memorize colors and recreate them from memory using RGB sliders.
              </p>
              <div className="flex justify-center">
                <Button className="btn-primary w-2/3 text-md" asChild>
                  <Link href="/exercises/color-gradient">
                    <span>Start</span>
                  </Link>
                </Button>
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-lg border border-border text-card-foreground flex flex-col h-full">
              <h3 className="text-xl font-semibold mb-2">Invisible Maze</h3>
              <p className="text-muted-foreground text-sm mb-4 flex-grow">
                Navigate through an invisible maze using only your spatial memory.
              </p>
              <div className="flex justify-center">
                <Button className="btn-primary w-2/3 text-md" asChild>
                  <Link href="/exercises/invisible-maze">
                    <span>Start</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
