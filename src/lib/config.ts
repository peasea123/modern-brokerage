export const CONFIG = {
  bookTitle: "The Modern Brokerage",
  bookSubtitle: "A Strategic Guide to Real Estate Firm Management",
  bookAuthor: "Dr. Philip Seagraves, PhD",
  bookEdition: "First Edition",
  bookPrice: 55.0,
  bookPriceDisplay: "$55.00",
  currency: "usd",

  // Download settings
  downloadTokenExpiryHours: 72, // tokens expire after 72 hours
  maxDownloadsPerPurchase: 5,

  // PDF file path (relative to project root)
  pdfFileName: "The-Modern-Brokerage.pdf",

  // Stripe (stub for now)
  stripeEnabled: false,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripePriceId: process.env.STRIPE_PRICE_ID || "",

  // Admin
  adminPassword: process.env.ADMIN_PASSWORD || "admin2026",

  // Site
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
} as const;
