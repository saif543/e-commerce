import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export const metadata = {
    title: "Nishat Commerce - Shop the Best Deals",
    description: "Your one-stop shop for electronics, gadgets, and more",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
