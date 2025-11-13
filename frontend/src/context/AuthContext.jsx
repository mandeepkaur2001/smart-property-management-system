// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "@/lib/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user session if exists
  useEffect(() => {
    const stored = Cookies.get("spms_user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/login", { email, password });

      // Ensure cards array is included in user context
      const loggedUser = {
        ...res.data.user,
        cards: res.data.user.cards || [], // add cards here
      };

      setUser(loggedUser);
      Cookies.set("spms_user", JSON.stringify(loggedUser), { expires: 1 }); // 1 day

      // Redirect based on role
      if (loggedUser.role === "manager") router.push("/dashboard/manager");
      else if (loggedUser.role === "tenant") router.push("/dashboard/tenant");
      else router.push("/");

      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const logout = () => {
    Cookies.remove("spms_user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
