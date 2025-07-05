// Client HTTP optimisé pour Laravel Sanctum

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const isBrowser = typeof window !== "undefined";

class HttpClient {
  /**
   * Récupère le token CSRF depuis les cookies
   */
  private async getCsrfToken(): Promise<string | null> {
    if (!isBrowser) {
      console.warn("getCsrfToken ne peut être appelé que côté client");
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
        throw new Error(`Échec init CSRF (${res.status})`);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="));

      if (!match) {
        console.warn("Cookie XSRF-TOKEN introuvable après init CSRF");
        return null;
      }

      const raw = match.split("=")[1];

      return decodeURIComponent(raw);
    } catch (error) {
      console.error("Erreur lors de la récupération du token CSRF:", error);
      return null;
    }
  }

  /**
   * Méthode générique pour effectuer des requêtes HTTP
   */
  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    data?: any,
    options: RequestInit = {},
  ): Promise<T> {
    let xsrfToken: string | null = null;

    if (method !== "GET" && isBrowser) {
      xsrfToken = await this.getCsrfToken();
      if (!xsrfToken) {
        console.warn("Aucun token CSRF disponible - requête risquée");
      }
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Origin: API_URL,
        Cookie: document.cookie,
        ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    if (!res.ok) {
      if (res.status === 419) {
        console.error("Erreur CSRF 419 – token expiré ou invalide");
        throw new Error("Session expirée. Veuillez rafraîchir la page.");
      }

      const errorText = await res.text().catch(() => null);
      console.error(
        `Erreur ${method} ${endpoint} :`,
        res.status,
        errorText || res.statusText,
      );

      throw new Error(`Erreur HTTP ${res.status}`);
    }

    return res.json();
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>("POST", endpoint, data, options);
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>("PUT", endpoint, data, options);
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>("DELETE", endpoint, undefined, options);
  }
}

export const httpClient = new HttpClient();
