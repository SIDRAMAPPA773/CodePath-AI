import axios from "axios";

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  url = url.replace(/\/+$/, "");
  if (!url.endsWith("/api")) {
    url += "/api";
  }
  return url;
};

const API = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true, // ✅ Send cookies automatically
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If it's a 401 and NOT from /auth/me or /login, redirect to login
    if (error.response && error.response.status === 401) {
      const isAuthMe = error.config.url.includes("/auth/me");
      if (!isAuthMe && window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
        localStorage.setItem("toast_error", "Session expired");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
    
    // Extract message and globally execute Error Component state
    const message = error.response?.data?.message || "Something went wrong";
    window.dispatchEvent(new CustomEvent("api_error", { detail: message }));
    
    return Promise.reject(error);
  }
);

export default API;