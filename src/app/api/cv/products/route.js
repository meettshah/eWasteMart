import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Verified fallback e-waste products with real hardware imagery
const CURATED_SAMPLE_PRODUCTS = [
  {
    id: "sample-smartphones-1",
    title: "Samsung Galaxy & Redmi Smartphones (Lot of 35)",
    category: "Mobile and personal devices",
    condition: "scrap",
    quantity: 35,
    unit: "items",
    askingPrice: 28000,
    location: "Andheri East, Mumbai, MH",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=800&auto=format&fit=crop&q=80",
    description: "Decommissioned lot of 35 smartphones across mixed Android generations with depleted batteries and shattered display glass.",
  },
  {
    id: "sample-motherboards-2",
    title: "Server Motherboards & RAM Sticks (Gold-Finger Scrap)",
    category: "Computers and peripherals",
    condition: "scrap",
    quantity: 20,
    unit: "items",
    askingPrice: 30400,
    location: "Electronic City, Bangalore, KA",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    description: "High-yield printed circuit boards with visible gold-plated PCIe traces, ceramic BGA processors, and tantalum capacitors.",
  },
  {
    id: "sample-laptops-3",
    title: "Dell Latitude 7490 Core i7 Laptops (Lot of 10)",
    category: "Computers and peripherals",
    condition: "repairable",
    quantity: 10,
    unit: "items",
    askingPrice: 35700,
    location: "Gurugram, Haryana",
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
    description: "Corporate decommissioned laptops. Power on to BIOS, minor casing scuffs, suitable for refurbishment or parts harvesting.",
  },
  {
    id: "sample-routers-4",
    title: "Cisco Catalyst 2960-X Gigabit Switches (6 Units)",
    category: "Networking devices",
    condition: "working",
    quantity: 6,
    unit: "items",
    askingPrice: 41800,
    location: "Whitefield, Bangalore, KA",
    imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80",
    description: "Rackmount enterprise networking switches with intact power supplies and aluminum chassis.",
  },
  {
    id: "sample-displays-5",
    title: "Dell & BenQ 24-inch IPS LED Monitors (Lot of 12)",
    category: "Televisions and displays",
    condition: "working",
    quantity: 12,
    unit: "items",
    askingPrice: 28900,
    location: "Noida Sector 62, UP",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    description: "Working commercial computer monitors removed during office renovation. Power cables included.",
  },
];

export async function GET() {
  try {
    const dbListings = await prisma.listing.findMany({
      where: {
        imageUrl: { not: "" },
      },
      select: {
        id: true,
        title: true,
        category: true,
        condition: true,
        quantity: true,
        unit: true,
        askingPrice: true,
        location: true,
        imageUrl: true,
        description: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    if (dbListings && dbListings.length > 0) {
      return NextResponse.json(dbListings);
    }
  } catch (err) {
    console.warn("[CV Products API] Database query warning:", err.message);
  }

  return NextResponse.json(CURATED_SAMPLE_PRODUCTS);
}

