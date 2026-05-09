export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  headshotCount: number
  features: string[]
  popular?: boolean
}

export const PRODUCTS: Product[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for personal use",
    priceInCents: 2900,
    headshotCount: 5,
    features: [
      "5 AI headshots",
      "3 different styles",
      "High resolution downloads",
      "48-hour delivery",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Best for professionals",
    priceInCents: 7900,
    headshotCount: 15,
    features: [
      "15 AI headshots",
      "8 different styles",
      "Ultra-high resolution",
      "24-hour priority delivery",
      "Background customization",
    ],
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    description: "Ideal for teams & enterprises",
    priceInCents: 19900,
    headshotCount: 40,
    features: [
      "40 AI headshots",
      "All styles included",
      "Ultra-high resolution",
      "12-hour express delivery",
      "Background customization",
      "Team collaboration tools",
      "Dedicated support",
    ],
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id)
}
