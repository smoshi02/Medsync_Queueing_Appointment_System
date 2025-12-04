export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    // Token invalid or expired
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return res.json();
};
