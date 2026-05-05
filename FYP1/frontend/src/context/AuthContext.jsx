import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUserLoggedIn = async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        // Assuming we can fetch profile to validate token and get user info
        // Adjust endpoint if needed, e.g. /users/profile/ or a specialized /me/ endpoint
        // Since our current profile endpoint lists profiles (filtered by user), we might need to fetch the first one or use a specific detail endpoint.
        // For now, let's assume we decode token or fetch simple profile.
        // Using /api/users/profile/ (list) which returns [profile]
        const response = await api.get("users/profile/");
        let profileData = null;

        if (response.data.results && Array.isArray(response.data.results)) {
          // Paginated response
          if (response.data.results.length > 0) {
            profileData = response.data.results[0];
          }
        } else if (Array.isArray(response.data)) {
          // Standard array response
          if (response.data.length > 0) {
            profileData = response.data[0];
          }
        } else if (response.data && typeof response.data === "object") {
          // Single object response (what the screenshot implies, or unpaginated detail)
          profileData = response.data;
        }

        if (profileData) {
          setUser(profileData);
        }
      } catch (error) {
        console.error("Auth check failed", error);
        logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const login = async (username, password) => {
    const response = await api.post("users/login/", { username, password });
    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);
    await checkUserLoggedIn();
  };

  const register = async (userData) => {
    await api.post("users/register/", userData);
    // Auto login or redirect to login?
    // Let's assume redirect to login usually, or auto login
    await login(userData.username, userData.password);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
