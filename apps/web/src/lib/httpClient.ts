const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const isBrowser = typeof window !== "undefined";

export interface User {
  id: number;
  name: string;
  email: string;
  company_id?: number;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface RequestData {
  [key: string]: unknown;
}

class HttpClient {
  /**
   * Get CSRF token from the backend.
   */
  private async getCsrfToken(): Promise<string | null> {
    if (!isBrowser) {
      console.warn("getCsrfToken can\'t be called on the server");
      return null;
    }

    try {
      const res = await fetch(`${API_URL}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(
          `Failed to fetch CSRF token: ${res.status} ${res.statusText}`,
        );
      }

      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="));

      if (!match) {
        console.warn("Cookie XSRF-TOKEN not found");
        return null;
      }

      const raw = match.split("=")[1];

      return decodeURIComponent(raw);
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      return null;
    }
  }

  /**
   * Generic request method to handle all HTTP methods.
   */
  private async request<T, D extends RequestData = RequestData>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    data?: D,
    options: RequestInit = {},
  ): Promise<T> {
    let xsrfToken: string | null = null;

    if (method !== "GET" && isBrowser) {
      xsrfToken = await this.getCsrfToken();
      if (!xsrfToken) {
        console.warn("CSRF token is not available, proceeding without it.");
      }
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    if (!res.ok) {
      if (res.status === 419) {
        throw new Error("Session expired, please refresh the page.");
      }

      const errorText = await res.text().catch(() => null);
      console.error(
        `Error ${method} ${endpoint} :`,
        res.status,
        errorText || res.statusText,
      );

      throw new Error(`HTTP error ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  async post<T, D extends RequestData = RequestData>(
    endpoint: string,
    data?: D,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T, D>("POST", endpoint, data, options);
  }

  async put<T, D extends RequestData = RequestData>(
    endpoint: string,
    data?: D,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T, D>("PUT", endpoint, data, options);
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>("DELETE", endpoint, undefined, options);
  }
}

export const httpClient = new HttpClient();
