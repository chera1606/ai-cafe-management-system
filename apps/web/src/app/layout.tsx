import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { FlyToCartProvider } from "@/components/product/fly-to-cart";
import { AiAssistantModal } from "@/components/ui/ai-assistant-modal";
import { RouteProgressBar } from "@/components/ui/route-progress-bar";
import { ToastContainer } from "@/components/ui/toast";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#173B2B",
};

export const metadata: Metadata = {
  title: "Sable — AI-Powered Artisan Cafe & Roastery",
  description:
    "Experience ceremonial Ethiopian Yirgacheffe roasts, slow-simmered culinary classics, and effortless AI table & counter ordering.",
  keywords: [
    "artisan cafe",
    "ethiopian coffee",
    "yirgacheffe",
    "ai ordering",
    "specialty roastery",
  ],
};

export default function RootLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal?: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${plusJakartaSans.variable} scroll-smooth antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen flex flex-col bg-cream text-forest font-sans antialiased selection:bg-meadow-tint selection:text-forest">
        <Suspense fallback={null}>
          <RouteProgressBar />
        </Suspense>
        <AuthProvider>
          <CartProvider>
            <FlyToCartProvider>
              {/* Skip to main content link for accessibility */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-meadow text-white font-medium rounded-lg shadow-lg"
              >
                Skip to content
              </a>

              {children}

              {/* Parallel Route Modal Slot */}
              {modal}

              {/* Global floating cart drawer & AI assistant modal */}
              <CartDrawer />
              <AiAssistantModal />
              <ToastContainer />
            </FlyToCartProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
