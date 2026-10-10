"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  apiClient,
  clearTokens,
  getAccessToken,
  saveTokens,
} from "@/lib/api-client";
import type {
  ApiMessageResponse,
  AuthUser,
  LoginResponse,
  LoginSuccessResponse,
  RegisterResponse,
} from "@/types/auth";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  twoFactorPending: {
    isPending: boolean;
    tempToken: string | null;
  };
  login: (email: string, password: string) => Promise<{ requires2fa: boolean }>;
  complete2Fa: (code: string) => Promise<void>;
  cancel2Fa: () => void;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<RegisterResponse>;
  requestMagicLink: (email: string) => Promise<ApiMessageResponse>;
  verifyMagicLink: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<ApiMessageResponse>;
  resetPassword: (
    token: string,
    newPassword: string,
  ) => Promise<ApiMessageResponse>;
  verifyEmail: (token: string) => Promise<ApiMessageResponse>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<ApiMessageResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("cafe_access_token");
    }
    return false;
  });
  const [twoFactorPending, setTwoFactorPending] = useState<{
    isPending: boolean;
    tempToken: string | null;
  }>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("cafe_2fa_temp_token");
      if (saved) return { isPending: true, tempToken: saved };
    }
    return { isPending: false, tempToken: null };
  });

  const refreshUser = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const profile = await apiClient<AuthUser>("/auth/me");
      setUser(profile);
    } catch {
      setUser(null);
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await apiClient<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });

    if (res.requires2fa) {
      setTwoFactorPending({
        isPending: true,
        tempToken: res.tempToken,
      });
      if (typeof window !== "undefined") {
        sessionStorage.setItem("cafe_2fa_temp_token", res.tempToken);
      }
      return { requires2fa: true };
    }

    const successRes = res as LoginSuccessResponse;
    saveTokens({
      accessToken: successRes.accessToken,
      refreshToken: successRes.refreshToken,
    });
    setUser(successRes.user);
    setTwoFactorPending({ isPending: false, tempToken: null });
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("cafe_2fa_temp_token");
    }
    return { requires2fa: false };
  };

  const complete2Fa = async (code: string) => {
    if (!twoFactorPending.tempToken) {
      throw new Error("No 2FA session in progress. Please sign in again.");
    }

    const payload = {
      tempToken: twoFactorPending.tempToken,
      code: code.trim(),
    };

    const res = await apiClient<LoginResponse>("/auth/2fa/authenticate", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    });

    if (!res.requires2fa) {
      const successRes = res as LoginSuccessResponse;
      saveTokens({
        accessToken: successRes.accessToken,
        refreshToken: successRes.refreshToken,
      });
      setUser(successRes.user);
      setTwoFactorPending({ isPending: false, tempToken: null });
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("cafe_2fa_temp_token");
      }
    }
  };

  const cancel2Fa = () => {
    setTwoFactorPending({ isPending: false, tempToken: null });
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("cafe_2fa_temp_token");
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    return apiClient<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    });
  };

  const requestMagicLink = async (email: string) => {
    return apiClient<ApiMessageResponse>("/auth/magic-link/request", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
  };

  const verifyMagicLink = async (token: string) => {
    const res = await apiClient<LoginResponse>("/auth/magic-link/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
      skipAuth: true,
    });

    if (!res.requires2fa) {
      const successRes = res as LoginSuccessResponse;
      saveTokens({
        accessToken: successRes.accessToken,
        refreshToken: successRes.refreshToken,
      });
      setUser(successRes.user);
    }
  };

  const forgotPassword = async (email: string) => {
    return apiClient<ApiMessageResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
  };

  const resetPassword = async (token: string, newPassword: string) => {
    return apiClient<ApiMessageResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
      skipAuth: true,
    });
  };

  const verifyEmail = async (token: string) => {
    const res = await apiClient<ApiMessageResponse>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
      skipAuth: true,
    });
    // Refresh user profile if logged in
    await refreshUser();
    return res;
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    return apiClient<ApiMessageResponse>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  };

  const logout = async () => {
    try {
      await apiClient("/auth/logout", {
        method: "POST",
        body: JSON.stringify({}),
      });
    } catch {
      // Ignore logout network errors and clear local credentials regardless
    } finally {
      clearTokens();
      setUser(null);
      setTwoFactorPending({ isPending: false, tempToken: null });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        twoFactorPending,
        login,
        complete2Fa,
        cancel2Fa,
        register,
        requestMagicLink,
        verifyMagicLink,
        forgotPassword,
        resetPassword,
        verifyEmail,
        changePassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
