import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginPage from "@/components/LoginPage";

export default function Login() {
  return (
    <main className="min-h-screen bg-offwhite">
      <Navbar />
      <LoginPage />
      <Footer />
    </main>
  );
}
