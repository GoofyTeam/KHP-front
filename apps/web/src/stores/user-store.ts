"use client";

import { create } from "zustand";
import { ApolloClient, ApolloError, useApolloClient } from "@apollo/client";
import {
  GetMeDocument,
  type GetMeQuery as GetMeQueryType,
} from "@workspace/graphql";

// Type basé sur la réponse GraphQL GetMe
type User = {
  id: string;
  name: string;
  email: string;
  company?: {
    id: string;
    name: string;
    auto_complete_menu_orders?: boolean | null;
    open_food_facts_language?: string | null;
  } | null;
};

type State = {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (u: User | null) => void;
  fetchUser: (
    apolloClient: ApolloClient<unknown>
  ) => Promise<{ success: boolean; data?: User; error?: string }>;
  clearUser: () => void;
  clearError: () => void;
};

export const useUserStore = create<State>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, error: null }),

  fetchUser: async (apolloClient) => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await apolloClient.query<GetMeQueryType>({
        query: GetMeDocument,
        fetchPolicy: "network-only",
        errorPolicy: "all",
      });

      const userData = data?.me;

      if (!userData || !userData.id) {
        const errorMessage = "User not found";
        set({
          isLoading: false,
          error: errorMessage,
          user: null,
        });
        return { success: false, error: errorMessage };
      }

      // Mapper les données GraphQL vers notre type User
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        company: userData.company
          ? {
              id: userData.company.id,
              name: userData.company.name,
              open_food_facts_language:
                userData.company.open_food_facts_language,
            }
          : null,
      };

      set({
        user,
        isLoading: false,
        error: null,
      });

      return { success: true, data: user };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch user data";

      // Gestion spécifique des erreurs d'authentification GraphQL
      if (error instanceof ApolloError) {
        const hasAuthError =
          error.graphQLErrors?.some(
            (err) => err.extensions?.code === "UNAUTHENTICATED"
          ) ||
          (error.networkError &&
            "statusCode" in error.networkError &&
            error.networkError.statusCode === 401);

        if (hasAuthError) {
          // Redirection vers login si pas authentifié
          if (typeof window !== "undefined") {
            window.location.href = "/login";
            return { success: false, error: "Redirecting to login..." };
          }
        }
      }

      set({
        isLoading: false,
        error: errorMessage,
        user: null,
      });
      return { success: false, error: errorMessage };
    }
  },

  clearUser: () => set({ user: null, error: null }),

  clearError: () => set({ error: null }),
}));

// Hook personnalisé pour utiliser le store avec Apollo Client
export const useUserWithGraphQL = () => {
  const apolloClient = useApolloClient();
  const store = useUserStore();

  const fetchUser = () => store.fetchUser(apolloClient);

  return {
    ...store,
    fetchUser,
  };
};
