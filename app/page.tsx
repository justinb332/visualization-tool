import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <main className="flex flex-col items-center px-8 py-20 flex-grow overflow-y-auto">
        <div className="text-center max-w-2xl">
          <h1 className="hero-title mb-4">
            <span className="text-4xl text-muted-foreground">Welcome to the</span>
            <br />
            <span className="hero-subtitle">Visualization Exercise Tool!</span>
          </h1>

          <p className="hero-description mb-12 max-w-xl mx-auto">
            Made for those who are trying to improve their ability to form mental images with their mind&apos;s eye and
            achieve prophantasia.
          </p>

          <Button className="btn-primary px-8 py-3 text-xl font-medium rounded-full" size="lg" asChild>
            <Link href="/exercises">
              <span>Start Training</span>
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
