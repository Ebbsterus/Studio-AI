"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface GenerateHeadshotsButtonProps {
  orderId: string
  disabled?: boolean
}

export function GenerateHeadshotsButton({ orderId, disabled }: GenerateHeadshotsButtonProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-headshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          style: "professional",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate headshot")
      }

      router.refresh()
    } catch (err) {
      setError("Failed to generate. Please try again.")
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleGenerate}
        disabled={disabled || isGenerating}
        size="sm"
        variant="outline"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
