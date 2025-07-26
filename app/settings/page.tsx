"use client"

import { useTheme } from "@/hooks/use-theme"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground px-8 py-12 pb-50">
      <div className="text-center max-w-md">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Settings</h2>
        <p className="text-muted-foreground text-lg leading-relaxed mb-8">Adjust your application preferences here.</p>
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl font-medium">
            Current Theme: <span className="capitalize">{theme}</span>
          </p>
          <Button
            onClick={toggleTheme}
            className="btn-primary px-8 cursor-pointer py-3 text-xl font-medium rounded-full" size="lg"
          >
            Toggle to {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </Button>
        </div>
      </div>
    </div>
  )
}
