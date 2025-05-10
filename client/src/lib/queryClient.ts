import { QueryClient } from "@tanstack/react-query";

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

  // Check token expiration
  const token = localStorage.getItem('token');
  const tokenExpiration = localStorage.getItem('tokenExpiration');
  
  if (token && tokenExpiration) {
    const expirationTime = parseInt(tokenExpiration);
    if (Date.now() < expirationTime) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      // Token expired, remove it
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiration');
      // Only redirect to login if not already on auth page
      if (path !== '/api/login' && path !== '/api/register' && !window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
        return Promise.reject(new Error('Token expired'));
      }
    }
  }

  

  const response = await fetch(`http://localhost:3001${path}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  // LOGGING: Show response details
  let responseData = null;
  try {
    responseData = await response.clone().json();
  } catch (e) {
    responseData = null;
  }

  // Handle 401 Unauthorized responses
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    // Only redirect to login if not already on auth page
    if (path !== '/api/login' && path !== '/api/register' && !window.location.pathname.includes('/auth')) {
      window.location.href = '/auth';
    }
  }

  return response;
}
