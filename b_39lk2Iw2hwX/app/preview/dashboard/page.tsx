"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, ShoppingBag, Clock, Plus, Download, User } from "lucide-react"

// Demo data for preview
const demoOrders = [
  { id: "1", plan_name: "Pro", headshot_count: 15, price_cents: 7900, status: "completed", created_at: "2024-01-15" },
  { id: "2", plan_name: "Basic", headshot_count: 5, price_cents: 2900, status: "processing", created_at: "2024-01-20" },
]

const demoHeadshots = [
  { id: "1", storage_path: "/images/after-female.jpg", status: "completed" },
  { id: "2", storage_path: "/images/after-male.jpg", status: "completed" },
  { id: "3", storage_path: null, status: "processing" },
  { id: "4", storage_path: null, status: "processing" },
]

export default function PreviewDashboardPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Preview banner */}
        <div className="mb-6 rounded-lg border border-primary/50 bg-primary/10 p-4 text-center">
          <p className="text-sm font-medium text-primary">
            Preview Mode - This is a demo of the dashboard with sample data
          </p>
        </div>

        {/* Welcome section */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome, Demo User!</h1>
            <p className="text-muted-foreground">
              Manage your AI headshots and orders
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/preview/upload">
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
                <p className="text-2xl font-bold">4</p>
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
                <p className="text-2xl font-bold">2</p>
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
                <p className="text-2xl font-bold">1</p>
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
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {demoHeadshots.map((headshot) => (
                    <div
                      key={headshot.id}
                      className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted"
                    >
                      {headshot.storage_path ? (
                        <>
                          <img
                            src={headshot.storage_path}
                            alt="AI Headshot"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button size="sm" variant="secondary">
                              <Download className="mr-2 h-4 w-4" />
                              Download
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
                <div className="space-y-4">
                  {demoOrders.map((order) => (
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
                            order.status === "completed"
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
                    <p className="font-medium">Demo User</p>
                    <p className="text-sm text-muted-foreground">demo@studioai.com</p>
                  </div>
                </div>
                <div className="border-t border-border pt-6">
                  <Button variant="outline" disabled>Sign Out (Preview)</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
