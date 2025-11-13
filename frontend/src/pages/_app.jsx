// src/pages/_app.jsx
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Navbar />
      <div className="p-6">
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
