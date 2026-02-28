/**
 * Authentication Provider
 * Provides authentication state and methods to the app
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import authService from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect users with forcePasswordReset flag to change password page
  useEffect(() => {
    if (!isLoading && user?.forcePasswordReset && pathname !== '/force-change-password') {
      router.push('/force-change-password');
    }
  }, [isLoading, user, pathname, router]);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // CRITICAL: Don't auto-login if user just logged out
        const isLoggingOut = sessionStorage.getItem("logging_out");
        if (isLoggingOut) {
          // Clear the flag and ensure no auth data remains
          sessionStorage.removeItem("logging_out");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          document.cookie = "access_token=; path=/; max-age=0; SameSite=Strict";
          setIsLoading(false);
          return;
        }

        const token = authService.getAccessToken();
        const storedUser = authService.getUser();

        if (token && storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);

          // Validate token by fetching profile (optional, for token validation)
          try {
            const response = await authService.getProfile();
            if (response.data) {
              setUser(response.data);
            }
          } catch (error) {
            // Token invalid or expired, try refresh
            try {
              await authService.refreshToken();
              const refreshedUser = authService.getUser();
              if (refreshedUser) {
                setUser(refreshedUser);
              }
            } catch (refreshError) {
              // Refresh failed, clear auth
              console.error("Auth refresh failed:", refreshError);
              authService.clearAuthData();
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login - set auth state after successful login
  const login = useCallback((userData, tokens) => {
    authService.setAuthData(tokens.token, tokens.refreshToken, userData);
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  // Logout - clear auth state completely
  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      // NUCLEAR CLEANUP - Clear absolutely everything

      // 1. Set logout flag FIRST (prevents refresh token logic)
      sessionStorage.setItem("logging_out", "true");

      // 2. Clear ALL localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      // 3. Clear ALL cookies (including any variants)
      document.cookie = "access_token=; path=/; max-age=0; SameSite=Strict";
      document.cookie = "access_token=; path=/; max-age=0;";
      document.cookie = "refresh_token=; path=/; max-age=0; SameSite=Strict";
      document.cookie = "refresh_token=; path=/; max-age=0;";

      // 4. Clear React Query cache
      queryClient.clear();

      // 5. Clear React state
      setUser(null);
      setIsAuthenticated(false);

      // 6. Force full page reload to /login (clears all JS state)
      window.location.replace("/login");
    }
  }, [queryClient]);

  // Check if user has specific role(s)
  const hasRole = useCallback(
    (requiredRoles) => {
      if (!user?.roles) return false;

      const roles = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];

      // Strict role matching - user must have at least one of the required roles
      // No automatic bypass for any role (including SUPERADMIN)
      return roles.some((role) => user.roles.includes(role));
    },
    [user]
  );

  // Get appropriate dashboard path based on user roles and lecturer status
  const getDashboardPath = useCallback(() => {
    if (!user?.roles) return "/student-dashboard";

    if (user.roles.includes("SUPERADMIN") || user.roles.includes("ADMIN")) {
      return "/admin-dashboard";
    }

    if (user.roles.includes("LECTURER")) {
      // Check lecturer approval status
      if (user.lecturerStatus === "approved") {
        return "/instructor-dashboard";
      } else if (user.lecturerStatus === "rejected") {
        return "/instructor-dashboard/rejected";
      } else {
        // pending or unknown status
        return "/instructor-dashboard/pending";
      }
    }

    return "/student-dashboard";
  }, [user]);

  // Update user data
  const updateUser = useCallback((userData) => {
    setUser(userData);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  }, []);

  // Get current access token
  const token = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return authService.getAccessToken();
  }, [isAuthenticated]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated,
      login,
      logout,
      hasRole,
      getDashboardPath,
      updateUser,
    }),
    [
      user,
      token,
      isLoading,
      isAuthenticated,
      login,
      logout,
      hasRole,
      getDashboardPath,
      updateUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthProvider;
