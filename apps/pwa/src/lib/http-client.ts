import {
  type HttpError,
  type RequestOptions,
  type HttpClientConfig,
  type ResponseType,
  HttpMethod,
} from "../types/http-client";

export class ImprovedHttpClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private defaultHeaders: Record<string, string>;
  private csrfToken: string | null = null;
  private csrfConfig: Required<NonNullable<HttpClientConfig["csrfConfig"]>>;
  private interceptors: HttpClientConfig["interceptors"];
  private cache = new Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  >();

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout ?? 10000;
    this.retries = config.retries ?? 3;
    this.defaultHeaders = config.defaultHeaders ?? {};
    this.interceptors = config.interceptors;
    this.csrfConfig = {
      cookieName: config.csrfConfig?.cookieName ?? "XSRF-TOKEN",
      headerName: config.csrfConfig?.headerName ?? "X-XSRF-TOKEN",
      endpoint: config.csrfConfig?.endpoint ?? "/sanctum/csrf-cookie",
    };
    this.csrfToken = this.readCookie(this.csrfConfig.cookieName);
  }

  /**
   * Initialisation CSRF automatique si nécessaire
   */
  async initCSRF(): Promise<void> {
    // Si on a déjà un token en cookie, on l'utilise sans appel réseau
    const existing = this.readCookie(this.csrfConfig.cookieName);
    if (existing) {
      this.csrfToken = existing;
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const res = await fetch(`${this.baseUrl}${this.csrfConfig.endpoint}`, {
        method: "GET",
        credentials: "include",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...this.defaultHeaders,
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw this.createHttpError(res, "CSRF initialization failed");
      }

      // On relit le cookie après le fetch
      this.csrfToken = this.readCookie(this.csrfConfig.cookieName);
      if (!this.csrfToken) {
        throw new Error(`Cookie ${this.csrfConfig.cookieName} not found`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("CSRF initialization timeout");
      }
      throw error;
    }
  }

  /**
   * Lecture d'un cookie par nom
   */
  public readCookie(name: string): string | null {
    const match = document.cookie.match(
      new RegExp("(^|; )" + name + "=([^;]*)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  }

  /**
   * Création d'une erreur HTTP typée
   */
  private async createHttpError(
    response: Response,
    message?: string
  ): Promise<HttpError> {
    let data: unknown;
    try {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch {
      data = null;
    }

    const error = new Error(
      message || `HTTP ${response.status}: ${response.statusText}`
    ) as HttpError;
    error.status = response.status;
    error.statusText = response.statusText;
    error.response = response;
    error.data = data;
    return error;
  }

  /**
   * Gestion du cache
   */
  private getCacheKey(url: string, options: RequestInit): string {
    return `${options.method || "GET"}:${url}:${JSON.stringify(options.body || {})}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache(key: string, data: unknown, ttl = 300000): void {
    // 5min par défaut
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Retry logic avec backoff exponentiel
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    retries: number = this.retries,
    delay = 1000
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) throw error;

      // Ne pas retry sur certaines erreurs
      if (error instanceof Error && "status" in error) {
        const httpError = error as HttpError;
        if (httpError.status >= 400 && httpError.status < 500) {
          throw error; // Erreurs client, pas de retry
        }
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.withRetry(fn, retries - 1, delay * 2);
    }
  }

  /**
   * Méthode générique pour toutes les requêtes
   */
  async request<Req = unknown, Res = unknown>(
    options: RequestOptions<Req>,
    responseType: ResponseType = "json"
  ): Promise<Res> {
    const {
      method,
      path,
      body,
      headers = {},
      timeout,
      retries,
      cache,
      signal,
    } = options;

    // Auto-init CSRF si nécessaire
    if (
      !this.csrfToken &&
      [
        HttpMethod.POST,
        HttpMethod.PUT,
        HttpMethod.PATCH,
        HttpMethod.DELETE,
      ].includes(method)
    ) {
      await this.initCSRF();
    }

    const url = `${this.baseUrl}${path}`;
    const allHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.defaultHeaders,
      ...headers,
      ...(this.csrfToken
        ? { [this.csrfConfig.headerName]: this.csrfToken }
        : {}),
    };

    // Configuration de la requête
    let requestConfig: RequestInit & { url: string } = {
      url,
      method,
      headers: allHeaders,
      credentials: "include",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    };

    // Interceptor de requête
    if (this.interceptors?.request) {
      requestConfig = this.interceptors.request(requestConfig);
    }

    // Gestion du cache pour GET
    const cacheKey = this.getCacheKey(requestConfig.url, requestConfig);
    if (method === "GET" && cache !== false) {
      const cached = this.getFromCache<Res>(cacheKey);
      if (cached) return cached;
    }

    // Controller pour timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      timeout ?? this.timeout
    );

    if (signal) {
      signal.addEventListener("abort", () => controller.abort());
    }

    const executeRequest = async (): Promise<Res> => {
      try {
        let response = await fetch(requestConfig.url, {
          ...requestConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Interceptor de réponse
        if (this.interceptors?.response) {
          response = await this.interceptors.response(response);
        }

        if (!response.ok) {
          const error = await this.createHttpError(response);
          if (this.interceptors?.error) {
            throw await this.interceptors.error(error);
          }
          throw error;
        }

        let data: Res;
        switch (responseType) {
          case "json":
            data = await response.json();
            break;
          case "text":
            data = (await response.text()) as Res;
            break;
          case "blob":
            data = (await response.blob()) as Res;
            break;
          case "arrayBuffer":
            data = (await response.arrayBuffer()) as Res;
            break;
          case "formData":
            data = (await response.formData()) as Res;
            break;
          default:
            data = await response.json();
        }

        // Mise en cache pour GET
        if (method === "GET" && cache !== false) {
          this.setCache(cacheKey, data);
        }

        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("Request timeout");
        }
        throw error;
      }
    };

    return this.withRetry(executeRequest, retries ?? this.retries);
  }

  // Méthodes de convenance avec support des types de réponse
  get<Res = unknown>(
    path: string,
    options?: Partial<RequestOptions<undefined>>,
    responseType?: ResponseType
  ) {
    return this.request<undefined, Res>(
      { method: HttpMethod.GET, path, body: undefined, ...options },
      responseType
    );
  }

  delete<Res = unknown>(
    path: string,
    options?: Partial<RequestOptions<undefined>>,
    responseType?: ResponseType
  ) {
    return this.request<undefined, Res>(
      { method: HttpMethod.DELETE, path, body: undefined, ...options },
      responseType
    );
  }

  post<Req = unknown, Res = unknown>(
    path: string,
    body: Req,
    options?: Partial<RequestOptions<Req>>,
    responseType?: ResponseType
  ) {
    return this.request<Req, Res>(
      { method: HttpMethod.POST, path, body, ...options },
      responseType
    );
  }

  put<Req = unknown, Res = unknown>(
    path: string,
    body: Req,
    options?: Partial<RequestOptions<Req>>,
    responseType?: ResponseType
  ) {
    return this.request<Req, Res>(
      { method: HttpMethod.PUT, path, body, ...options },
      responseType
    );
  }

  patch<Req = unknown, Res = unknown>(
    path: string,
    body: Req,
    options?: Partial<RequestOptions<Req>>,
    responseType?: ResponseType
  ) {
    return this.request<Req, Res>(
      { method: HttpMethod.PATCH, path, body, ...options },
      responseType
    );
  }

  /**
   * Upload de fichiers
   */
  async upload<Res = unknown>(
    path: string,
    file: File | FormData,
    options?: Partial<RequestOptions>
  ): Promise<Res> {
    const formData = file instanceof FormData ? file : new FormData();
    if (file instanceof File) {
      formData.append("file", file);
    }

    const { headers = {}, ...restOptions } = options || {};
    // Ne pas définir Content-Type pour FormData (le navigateur le fait automatiquement)
    delete headers["Content-Type"];

    return this.request<FormData, Res>({
      method: "POST",
      path,
      body: formData,
      headers,
      ...restOptions,
    } as RequestOptions<FormData>);
  }

  /**
   * Nettoyage du cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Mise à jour des headers par défaut
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }
}
