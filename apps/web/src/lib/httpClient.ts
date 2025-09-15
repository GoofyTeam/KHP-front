// Note: next/headers imports are moved to server-specific functions

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
    if (isBrowser) {
      // Client-side: use existing logic
      try {
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

        // Wait a bit for the cookie to be set
        await new Promise((resolve) => setTimeout(resolve, 100));

        const token = await this.extractTokenFromCookie();

        if (token) {
          this.xsrfToken = token;
          return token;
        }

        console.warn("WEB: Cookie XSRF-TOKEN not found after fetch");
        return null;
      } catch (error) {
        console.error("WEB: Error fetching CSRF token:", error);
        return null;
      }
    } else {
      // Server-side: get token from Next.js cookies
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const token = cookieStore.get("XSRF-TOKEN")?.value;

        if (token) {
          this.xsrfToken = decodeURIComponent(token);
          console.log("WEB SERVER: Found CSRF token in cookies");
          return this.xsrfToken;
        }

        console.warn("WEB SERVER: XSRF-TOKEN not found in cookies");
        return null;
      } catch (error) {
        console.error(
          "WEB SERVER: Error getting CSRF token from cookies:",
          error
        );
        return null;
      }
    }
  }

  /**
   * Extract CSRF token from cookies
   */
  public async extractTokenFromCookie(): Promise<string | null> {
    if (isBrowser) {
      // Client-side: synchronous cookie access
      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="));

      if (!match) {
        return null;
      }

      const raw = match.split("=")[1];
      return decodeURIComponent(raw);
    } else {
      // Server-side: use Next.js cookies
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const token = cookieStore.get("XSRF-TOKEN")?.value;
        return token ? decodeURIComponent(token) : null;
      } catch (error) {
        console.error(
          "WEB SERVER: Error extracting token from cookies:",
          error
        );
        return null;
      }
    }
  }

  /**
   * Extract CSRF token from cookies (synchronous version for client-side)
   */
  private extractTokenFromCookieSync(): string | null {
    if (!isBrowser) {
      console.warn(
        "extractTokenFromCookieSync should only be called client-side"
      );
      return null;
    }

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
   * Clear cookies client-side
   */
  private clearClientCookies() {
    if (!isBrowser) return;

    // Clear cookies by setting them to expire
    const cookiesToClear = ["XSRF-TOKEN", "khp_session", "laravel_session"];

    cookiesToClear.forEach((cookieName) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });

    console.log("WEB CLIENT: Session cookies cleared");
  }

  /**
   * Trigger logout redirect (server-side)
   */
  private async triggerLogoutRedirect() {
    const { redirect } = await import("next/navigation");
    redirect("/login"); // This throws a special NEXT_REDIRECT error - don't catch it!
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
  private async request<
    T,
    D extends RequestData | FormData = RequestData | FormData,
  >(
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    data?: D,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const maxRetries = 1; // Retry once for CSRF token expiration
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

      // If sending FormData, do not set Content-Type so fetch sets boundary
      if (body instanceof FormData && "Content-Type" in headers) {
        delete (headers as Record<string, string>)["Content-Type"];
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
        // Handle CSRF token expiration with automatic retry
        if (res.status === 419 && retryCount < maxRetries) {
          if (isBrowser) {
            console.warn(
              "WEB: CSRF token expired, refreshing token and retrying..."
            );
            this.resetCsrfToken();

            // Get a new CSRF token
            await this.getCsrfToken();

            // Retry the request with the new token
            return this.request<T, D>(
              method,
              endpoint,
              data,
              options,
              retryCount + 1
            );
          } else {
            // Server-side: can't refresh CSRF, redirect to logout
            console.warn(
              "WEB SERVER: CSRF token expired in Server Action - redirecting to logout"
            );

            // Clear session cookies server-side by setting them to expire
            try {
              const { cookies } = await import("next/headers");
              const cookieStore = await cookies();

              // Set cookies to expire immediately
              cookieStore.set("XSRF-TOKEN", "", {
                expires: new Date(0),
                path: "/",
                httpOnly: false,
              });
              cookieStore.set("khp_session", "", {
                expires: new Date(0),
                path: "/",
                httpOnly: true,
              });
              cookieStore.set("laravel_session", "", {
                expires: new Date(0),
                path: "/",
                httpOnly: true,
              });

              console.log("WEB SERVER: Session cookies cleared");
            } catch (error) {
              console.warn("Failed to clear cookies:", error);
            }

            // Trigger logout redirect (this will throw NEXT_REDIRECT)
            await this.triggerLogoutRedirect();
          }
        }

        // Handle CSRF token expiration when retry is not possible
        if (res.status === 419) {
          if (isBrowser) {
            // Clear cookies and redirect client-side
            this.clearClientCookies();
            window.location.href = "/login";
            throw new Error("Redirecting to login..."); // For TypeScript
          }
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

  async post<T, D extends RequestData | FormData = RequestData | FormData>(
    endpoint: string,
    data?: D,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T, D>("POST", endpoint, data, options);
  }

  async put<T, D extends RequestData | FormData = RequestData | FormData>(
    endpoint: string,
    data?: D,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T, D>("PUT", endpoint, data, options);
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>("DELETE", endpoint, undefined, options);
  }

  /**
   * Wrapper methods that return ActionResult format for easier error handling
   */
  async postWithResult<
    T,
    D extends RequestData | FormData = RequestData | FormData,
  >(
    endpoint: string,
    data?: D,
    options?: RequestInit
  ): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
      const result = await this.post<T, D>(endpoint, data, options);
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  async getWithResult<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
      const result = await this.get<T>(endpoint, options);
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }
}

export const httpClient = new HttpClient();
