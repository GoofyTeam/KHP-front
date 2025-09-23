export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export interface HttpError extends Error {
  status: number;
  statusText: string;
  response?: Response;
  data?: unknown;
}

export interface RequestOptions<Req = unknown> {
  path: string;
  method: HttpMethod;
  body?: Req;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  signal?: AbortSignal;
}

export interface HttpClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  defaultHeaders?: Record<string, string>;
  csrfConfig?: {
    cookieName?: string;
    headerName?: string;
    endpoint?: string;
  };
  interceptors?: {
    request?: (
      config: RequestInit & { url: string },
    ) => RequestInit & { url: string };
    response?: (response: Response) => Response | Promise<Response>;
    error?: (error: HttpError) => HttpError | Promise<HttpError>;
  };
}

export type ResponseType =
  | "json"
  | "text"
  | "blob"
  | "arrayBuffer"
  | "formData";
