"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <Button variant="outline" onClick={handleSignOut}>
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  )
}
