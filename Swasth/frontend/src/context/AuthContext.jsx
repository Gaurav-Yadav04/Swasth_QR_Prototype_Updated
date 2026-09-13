
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore logged-in user
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("swasth_user");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to restore user:", error);
      localStorage.removeItem("swasth_user");
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("swasth_user", JSON.stringify(userData));
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("swasth_user");
  };

  // Update logged-in user's profile
  const updateUser = (updatedData) => {
    setUser((currentUser) => {
      const updatedUser = {
        ...currentUser,
        ...updatedData,
      };

      localStorage.setItem(
        "swasth_user",
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}

export default AuthContext;

