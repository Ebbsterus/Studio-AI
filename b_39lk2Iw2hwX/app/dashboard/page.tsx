import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, ShoppingBag, Clock, Plus, Download, User, LogOut } from "lucide-react"
import { SignOutButton } from "@/components/sign-out-button"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch user's headshots
  const { data: headshots } = await supabase
    .from("headshots")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const totalHeadshots = headshots?.length || 0
  const totalOrders = orders?.length || 0
  const pendingOrders = orders?.filter(o => o.status === "pending" || o.status === "processing").length || 0

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Welcome section */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome{profile?.full_name ? `, ${profile.full_name}` : " back"}!
            </h1>
            <p className="text-muted-foreground">
              Manage your AI headshots and orders
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/upload">
                <ImageIcon className="mr-2 h-4 w-4" />
                Upload Photos
              </Link>
            </Button>
            <Button asChild>
              <Link href="/#pricing">
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalHeadshots}</p>
                <p className="text-sm text-muted-foreground">Total Headshots</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalOrders}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingOrders}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="headshots" className="space-y-6">
          <TabsList>
            <TabsTrigger value="headshots">My Headshots</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Headshots tab */}
          <TabsContent value="headshots">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Your AI Headshots</CardTitle>
                <CardDescription>
                  Download and manage your generated headshots
                </CardDescription>
              </CardHeader>
              <CardContent>
                {headshots && headshots.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {headshots.map((headshot) => (
                      <div
                        key={headshot.id}
                        className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted"
                      >
                        {headshot.image_url ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`/api/file?pathname=${encodeURIComponent(headshot.image_url)}`}
                              alt="AI Headshot"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button size="sm" variant="secondary" asChild>
                                <a
                                  href={`/api/download?pathname=${encodeURIComponent(headshot.image_url)}&filename=headshot-${headshot.id}.jpg`}
                                  download
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </a>
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                              <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
                              <p className="mt-2 text-sm text-muted-foreground">Processing...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="mb-2 text-lg font-medium">No headshots yet</p>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Purchase a plan and upload your photos to get started
                    </p>
                    <Button asChild>
                      <Link href="/#pricing">View Pricing</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders tab */}
          <TabsContent value="orders">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View all your past and current orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <ShoppingBag className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{order.plan_name} Plan</p>
                            <p className="text-sm text-muted-foreground">
                              {order.headshot_count} headshots - ${order.price_cents / 100}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            variant={
                              order.status === "paid" || order.status === "completed"
                                ? "default"
                                : order.status === "processing"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {order.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="mb-2 text-lg font-medium">No orders yet</p>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Choose a plan to get your AI headshots
                    </p>
                    <Button asChild>
                      <Link href="/#pricing">View Pricing</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account tab */}
          <TabsContent value="account">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{profile?.full_name || "User"}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="border-t border-border pt-6">
                  <SignOutButton />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
