import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users, ShoppingBag, ImageIcon, DollarSign, ArrowLeft } from "lucide-react"

// List of admin email addresses
const ADMIN_EMAILS = [
  "admin@studioai.com",
  // Add more admin emails here
]

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  if (!ADMIN_EMAILS.includes(user.email || "")) {
    redirect("/dashboard")
  }

  // Fetch all orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  // Fetch all headshots
  const { data: headshots } = await supabase
    .from("headshots")
    .select("*")
    .order("created_at", { ascending: false })

  // Calculate stats
  const totalUsers = profiles?.length || 0
  const totalOrders = orders?.length || 0
  const totalHeadshots = headshots?.length || 0
  const totalRevenue = orders
    ?.filter(o => o.status === "completed" || o.status === "paid")
    .reduce((sum, o) => sum + o.price_cents, 0) || 0

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, orders, and headshots</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
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
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(totalRevenue / 100).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="headshots">Headshots</TabsTrigger>
          </TabsList>

          {/* Orders tab */}
          <TabsContent value="orders">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>View and manage all customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                {orders && orders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            {order.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>{order.plan_name}</TableCell>
                          <TableCell>${(order.price_cents / 100).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.status === "completed" || order.status === "paid"
                                  ? "default"
                                  : order.status === "processing"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">No orders yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users tab */}
          <TabsContent value="users">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>View all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {profiles && profiles.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-mono text-sm">
                            {profile.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>{profile.full_name || "—"}</TableCell>
                          <TableCell>
                            {new Date(profile.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">No users yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Headshots tab */}
          <TabsContent value="headshots">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>All Headshots</CardTitle>
                <CardDescription>View all generated headshots</CardDescription>
              </CardHeader>
              <CardContent>
                {headshots && headshots.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Headshot ID</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {headshots.map((headshot) => (
                        <TableRow key={headshot.id}>
                          <TableCell className="font-mono text-sm">
                            {headshot.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {headshot.user_id.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {headshot.order_id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                headshot.status === "completed"
                                  ? "default"
                                  : headshot.status === "processing"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {headshot.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(headshot.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">No headshots yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
