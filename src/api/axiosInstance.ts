import axios from "axios";

// A single Axios instance shared across the entire app.
// Every component imports this — never the raw axios object.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // required so the browser sends the refreshToken cookie
});

// ---- Access token: lives only in memory ----
let currentAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  currentAccessToken = token;
}

// ---- Attach access token to every outgoing request ----
apiClient.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  return config;
});

// ---- Shared in-flight refresh, so simultaneous 401s don't race each other ----
let refreshPromise: Promise<string> | null = null;

export async function getNewAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post("/api/auth/refresh")
      .then((res) => {
        const token = res.data.token;
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// ---- Auto-retry a request once, after silently refreshing ----
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshCall = originalRequest?.url?.includes("/api/auth/refresh");

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true;
      try {
        const newToken = await getNewAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        setAccessToken(null);
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;