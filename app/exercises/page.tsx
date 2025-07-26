import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

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
            <div className="bg-card p-6 rounded-lg shadow-lg border border-border text-card-foreground">
              <h3 className="text-xl font-semibold mb-2">Basic Object Visualization</h3>
              <p className="text-muted-foreground text-sm mb-4">Focus on visualizing simple objects in detail.</p>
              <Button className="btn-primary w-full">Start</Button>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-lg border border-border text-card-foreground">
              <h3 className="text-xl font-semibold mb-2">Blind Sketching</h3>
              <p className="text-muted-foreground text-sm mb-4">Use the canvas to draw, but visualize your sketch mentally.</p>
              <Button className="btn-primary w-full" asChild>
                <Link href="/exercises/sketch">
                  <span>Start</span>
                </Link>
              </Button>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-lg border border-border text-card-foreground">
              <h3 className="text-xl font-semibold mb-2">Sensory Immersion</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Add sounds, smells, and textures to your visualizations.
              </p>
              <Button className="btn-primary w-full">Start</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
