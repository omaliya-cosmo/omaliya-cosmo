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
  title: "Omaliya | Sri Lanka's Favorite Online Store",
  description:
    "Shop the latest trends, exclusive deals, and premium products at Omaliya. Your one-stop online shop in Sri Lanka.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
