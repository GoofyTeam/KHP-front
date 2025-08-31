const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.NODE_ENV === "production"
    ? "https://dash.goofykhp.fr"
    : null;

const isBrowser = typeof window !== "undefined";
const isServer = !isBrowser;

export interface User {
  id: number;
  name: string;
  email: string;
  company_id?: number;
  updated_at?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface RequestData {
  [key: string]: unknown;
}

interface ServerHeaders {
  Cookie?: string;
  "X-XSRF-TOKEN"?: string;
  Authorization?: string;
  Referer?: string;
  "User-Agent"?: string;
  Origin?: string;
}

class HttpClient {
  private xsrfToken: string | null = null;

  /**
   * Get CSRF token from the backend if not already available.
   */
  public async getCsrfToken(): Promise<string | null> {
    if (!isBrowser) {
      console.warn("getCsrfToken can't be called on the server");
      return null;
    }

    if (this.xsrfToken) {
      return this.xsrfToken;
    }

    try {
      const existingToken = this.extractTokenFromCookie();
      if (existingToken) {
        this.xsrfToken = existingToken;
        return existingToken;
      }

      const res = await fetch(`${API_URL}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(
          `Failed to fetch CSRF token: ${res.status} ${res.statusText}`
        );
      }

      const token = this.extractTokenFromCookie();

      if (token) {
        this.xsrfToken = token;
        return token;
      }

      console.warn("Cookie XSRF-TOKEN not found after fetch");
      return null;
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      return null;
    }
  }

  /**
   * Extract CSRF token from cookies
   */
  public extractTokenFromCookie(): string | null {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="));

    if (!match) {
      return null;
    }

    const raw = match.split("=")[1];
    return decodeURIComponent(raw);
  }

  /**
   * Reset CSRF token (used when token is invalid)
   */
  private resetCsrfToken() {
    this.xsrfToken = null;
  }

  /**
   * Get server-side headers using Next.js headers() and cookies()
   */
  private async getServerHeaders(): Promise<ServerHeaders> {
    if (isBrowser) return {};

    try {
      // Dynamically import Next.js functions only on server
      const { headers, cookies } = await import("next/headers");

      const headersList = await headers();
      const cookieStore = await cookies();

      const serverHeaders: ServerHeaders = {};

      // Forward essential headers
      const cookie = headersList.get("cookie");
      if (cookie) {
        serverHeaders.Cookie = cookie;
      }

      // Get XSRF token from cookies
      const xsrfCookie = cookieStore.get("XSRF-TOKEN");
      if (xsrfCookie?.value) {
        try {
          serverHeaders["X-XSRF-TOKEN"] = decodeURIComponent(xsrfCookie.value);
        } catch {
          serverHeaders["X-XSRF-TOKEN"] = xsrfCookie.value;
        }
      }

      // Check for Bearer token in HTTP-only cookie
      const authToken = cookieStore.get("auth_token");
      if (authToken?.value) {
        serverHeaders.Authorization = `Bearer ${authToken.value}`;
      }

      // Forward important request headers
      const referer = headersList.get("referer");
      if (referer) {
        serverHeaders.Referer = referer;
      }

      const userAgent = headersList.get("user-agent");
      if (userAgent) {
        serverHeaders["User-Agent"] = userAgent;
      }

      const origin = headersList.get("origin");
      if (origin) {
        serverHeaders.Origin = origin;
      }

      return serverHeaders;
    } catch (error) {
      console.warn("Failed to get server headers:", error);
      return {};
    }
  }

  /**
   * Detect authentication strategy and prepare headers
   */
  private async prepareHeaders(
    method: string,
    options: RequestInit = {}
  ): Promise<Record<string, string>> {
    const baseHeaders: Record<string, string> = {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest", // Laravel expects this
    };

    if (isServer) {
      // Server-side: use Next.js headers and cookies
      const serverHeaders = await this.getServerHeaders();
      return {
        ...baseHeaders,
        "Content-Type": "application/json",
        ...serverHeaders,
        ...(options.headers as Record<string, string>),
      };
    }

    // Browser-side: handle CSRF and check for FormData
    const isFormData = options.body instanceof FormData;

    if (!isFormData) {
      baseHeaders["Content-Type"] = "application/json";
    }

    // Get CSRF token for non-GET requests
    if (method !== "GET") {
      const xsrfToken = await this.getCsrfToken();
      if (xsrfToken) {
        baseHeaders["X-XSRF-TOKEN"] = xsrfToken;
      }
    }

    return {
      ...baseHeaders,
      ...(options.headers as Record<string, string>),
    };
  }

  /**
   * Generic request method to handle all HTTP methods with intelligent context detection.
   */
  private async request<T, D extends RequestData = RequestData>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    data?: D,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const headers = await this.prepareHeaders(method, options);

      // Prepare body - handle FormData vs JSON
      let body: string | FormData | undefined;
      if (data) {
        if (data instanceof FormData) {
          body = data;
        } else {
          body = JSON.stringify(data);
        }
      }

      const requestConfig: RequestInit = {
        method,
        credentials: "include",
        headers,
        body,
        cache: options.cache || (isServer ? "no-store" : "default"),
        ...options,
      };

      const res = await fetch(`${API_URL}${endpoint}`, requestConfig);

      if (!res.ok) {
        // Handle CSRF token expiration
        if (res.status === 419 && isBrowser) {
          this.resetCsrfToken();
          throw new Error("Session expired, please refresh the page.");
        }

        // Handle authentication errors
        if (res.status === 401) {
          throw new Error("Authentication required. Please log in.");
        }

        // Handle validation errors
        if (res.status === 422) {
          const errorData = await res.json().catch(() => null);
          if (errorData?.errors) {
            const firstError = Object.values(errorData.errors)[0];
            throw new Error(
              Array.isArray(firstError) ? firstError[0] : String(firstError)
            );
          }
        }

        const errorText = await res.text().catch(() => null);
        throw new Error(`${res.status}: ${errorText || res.statusText}`);
      }

      // Handle empty responses
      const contentType = res.headers.get("content-type");
      const contentLength = res.headers.get("content-length");

      // If no content or content-length is 0, return empty object
      if (contentLength === "0" || !contentType?.includes("application/json")) {
        return {} as T;
      }

      const text = await res.text();

      // Handle empty text response
      if (!text.trim()) {
        return {} as T;
      }

      try {
        return JSON.parse(text) as T;
      } catch {
        return {} as T;
      }
    } catch (error) {
      // Reset CSRF token on session expiration
      if (
        error instanceof Error &&
        error.message.includes("Session expired") &&
        isBrowser
      ) {
        this.resetCsrfToken();
      }

      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  async post<T, D extends RequestData = RequestData>(
    endpoint: string,
    data?: D,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T, D>("POST", endpoint, data, options);
  }

  async put<T, D extends RequestData = RequestData>(
    endpoint: string,
    data?: D,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T, D>("PUT", endpoint, data, options);
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>("DELETE", endpoint, undefined, options);
  }
}

export const httpClient = new HttpClient();
