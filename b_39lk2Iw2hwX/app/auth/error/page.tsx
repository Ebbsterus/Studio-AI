import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md border-border bg-card text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            Something went wrong during authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The authentication link may have expired or is invalid. 
            Please try signing in again or contact support if the problem persists.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" asChild>
            <Link href="/auth/login">Back to Sign In</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
