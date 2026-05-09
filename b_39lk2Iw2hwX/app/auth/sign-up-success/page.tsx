import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md border-border bg-card text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a confirmation link to verify your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click the link in your email to activate your account and get started with Studio AI. 
            If you don&apos;t see it, check your spam folder.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/auth/login">Back to Sign In</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
