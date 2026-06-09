import axios from "axios";

// A single Axios instance shared across the entire app.
// Every component imports this — never the raw axios object.
const apiClient = axios.create({
  baseURL: "http://localhost:5253",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: runs before every outgoing request.
// Reads the token from localStorage and attaches it if present.
// This means no component ever has to think about auth headers.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;