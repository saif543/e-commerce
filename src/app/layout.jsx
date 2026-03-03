import { Poppins } from "next/font/google";
import "./globals.css";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Nishat Commerce - Shop the Best Deals",
  description: "Your one-stop shop for electronics, gadgets, and more",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <AuthProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
