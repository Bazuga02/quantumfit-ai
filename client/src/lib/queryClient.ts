import { QueryClient } from "@tanstack/react-query";

const PRODUCTION_API = "https://quantumfit-ai.vercel.app";

function getApiUrl(): string {
  if (typeof window === "undefined") {
    return import.meta.env.VITE_API_URL ?? import.meta.env.NEXT_PUBLIC_API_URL ?? PRODUCTION_API;
  }

  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return "";
  if (host.endsWith(".vercel.app")) return "";
  return import.meta.env.VITE_API_URL ?? import.meta.env.NEXT_PUBLIC_API_URL ?? PRODUCTION_API;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

type GetQueryFnOptions = {
  on401?: "throw" | "returnNull";
};

export function getQueryFn<T = any>(options: GetQueryFnOptions = {}) {
  return async (): Promise<T> => {
    const response = await apiRequest("GET", "/api/user");
    if (!response.ok) {
      if (response.status === 401) {
        if (options.on401 === "returnNull") {
          return null as T;
        }
        throw new Error("Unauthorized");
      }
      throw new Error("Failed to fetch user data");
    }
    return response.json();
  };
}

export async function apiRequest(
  method: string,
  path: string,
  body?: any
): Promise<Response> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const response = await fetch(`${getApiUrl()}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    if (
      path !== "/api/login" &&
      path !== "/api/register" &&
      path !== "/api/guest-login" &&
      !window.location.pathname.includes("/auth")
    ) {
      window.location.href = "/auth";
    }
  }

  return response;
}
