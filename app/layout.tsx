import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import { CartProvider } from "./lib/hooks/CartContext";
import Footer from "@/components/layout/Footer";
import { UserProvider } from "@/app/lib/hooks/UserContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"], // Adjust weights as needed
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700"], // Adjust weights as needed
});

export const metadata: Metadata = {
  title: "Omaliya | Karseell Products & Beauty Care in Sri Lanka",
  description:
    "Shop premium Karseell Products, Beauty and Skin care essentials in Sri Lanka. Discover trusted cosmetics, skincare solutions, and beauty accessories with island-wide delivery.",
  keywords:
    "Karseell, beauty products, skin care, cosmetics, Sri Lanka, online shopping, beauty essentials",
  openGraph: {
    title: "Omaliya | Premium Beauty & Skin Care Products",
    description:
      "Explore Karseell and premium beauty products at Omaliya. Sri Lanka's trusted online store for quality skin care and cosmetics.",
    type: "website",
    url: "https://omaliya.lk",
    siteName: "Omaliya Cosmetics",
    images: [
      {
        url: "https://res.cloudinary.com/omaliya/image/upload/v1750397118/ss_notjww.png", // Replace with actual image path
        width: 1200,
        height: 630,
        alt: "Omaliya Cosmetics",
      },
    ],
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://storage.googleapis.com/onepayjs/onepayv2.js"
          async
        ></script>
      </head>
      <body className={poppins.variable}>
        <CartProvider>
          <UserProvider>
            <HeaderWrapper />
            {children}
          </UserProvider>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
