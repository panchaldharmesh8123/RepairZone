"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { apiCall } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // In a real app, you'd verify the token with your backend to get user info
        // For this example, we'll decode it or assume basic user data can be pulled from the token
        // Or, better, have a /auth/me endpoint
        const response = await apiCall("/api/auth/me", "GET", null, token);
        if (response.user) {
          setUser(response.user);
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Failed to load user from token:", error);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  };
  useEffect(() => {
    loadUser();
  }, [localStorage.getItem("token")]); // Only run loadUser when token changes

  const login = async (email, password) => {
    try {
      const response = await apiCall("/api/auth/login", "POST", {
        email,
        password,
      });
      localStorage.setItem("token", response.token);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: error.message || "Login failed" };
    }
  };

  const register = async (name, email, password, role = "user") => {
    try {
      const response = await apiCall("/api/auth/register", "POST", {
        name,
        email,
        password,
        role,
      });
      localStorage.setItem("token", response.token);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        message: error.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
