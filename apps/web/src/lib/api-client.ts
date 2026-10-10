export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (
    typeof window !== "undefined" &&
    window.location.hostname &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return `http://${window.location.hostname}:3000/api/v1`;
  }
  return "http://localhost:3000/api/v1";
}

export const API_BASE_URL =
  typeof window !== "undefined"
    ? getApiBaseUrl()
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

const ACCESS_TOKEN_KEY = "cafe_access_token";
const REFRESH_TOKEN_KEY = "cafe_refresh_token";

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public override readonly message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

// Token storage helpers (supports SSR safely)
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveTokens(tokens: {
  accessToken: string;
  refreshToken?: string;
}): void {
  if (typeof window === "undefined" || !tokens?.accessToken) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
  // Also store in cookie for Next.js middleware access
  // biome-ignore lint/suspicious/noDocumentCookie: cookie required for Next.js server middleware authentication
  document.cookie = `${ACCESS_TOKEN_KEY}=${tokens.accessToken}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  // biome-ignore lint/suspicious/noDocumentCookie: cookie required for Next.js server middleware authentication
  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

function onTokenRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => {
    cb(token);
  });
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth = false, headers = {}, ...rest } = options;

  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  const token = getAccessToken();
  if (token && !skipAuth && !requestHeaders.Authorization) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
  });

  // Handle 401 Unauthorized with token refresh (avoid infinite loop on auth routes)
  if (
    response.status === 401 &&
    !skipAuth &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/refresh")
  ) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearTokens();
      throw new ApiClientError(401, "Session expired. Please log in again.");
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${baseUrl}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshResponse.ok) {
          clearTokens();
          onTokenRefreshed(null);
          throw new ApiClientError(401, "Failed to refresh session.");
        }

        const data = await refreshResponse.json();
        saveTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
        onTokenRefreshed(data.accessToken);
      } catch (err) {
        clearTokens();
        onTokenRefreshed(null);
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    // Wait for the ongoing refresh to complete
    const newToken = await new Promise<string | null>((resolve) => {
      addRefreshSubscriber((t) => resolve(t));
    });

    if (!newToken) {
      throw new ApiClientError(401, "Session expired. Please log in again.");
    }

    // Retry request with new token
    requestHeaders.Authorization = `Bearer ${newToken}`;
    response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
    });
  }

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const responseData = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage =
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData
        ? Array.isArray(responseData.message)
          ? responseData.message.join(", ")
          : String(responseData.message)
        : response.statusText || "Request failed";

    throw new ApiClientError(response.status, errorMessage, responseData);
  }

  return responseData as T;
}
