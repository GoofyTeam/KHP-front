import { ImprovedHttpClient } from "./http-client";
import type { HttpClientConfig } from "../types/http-client";

const API_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : import.meta.env.MODE === "production"
    ? "https://app.goofykhp.fr"
    : null;

const config: HttpClientConfig = {
  baseUrl: API_URL,
  timeout: 10000,
  retries: 3,
  defaultHeaders: {
    Accept: "application/json",
  },
  interceptors: {
    request: (config) => {
      // Log des requêtes en dev
      if (import.meta.env.DEV) {
        console.log(`🚀 ${config.method} ${config.url}`);
      }
      return config;
    },
    response: (response) => {
      // Log des réponses en dev
      if (import.meta.env.DEV) {
        console.log(`✅ ${response.status} ${response.url}`);
      }
      return response;
    },
    error: (error) => {
      // Log des erreurs
      if (import.meta.env.DEV) {
        console.error(`❌ ${error.status} ${error.message}`, error.data);
      }
      return error;
    },
  },
};

export const api = new ImprovedHttpClient(config);
export default api;
