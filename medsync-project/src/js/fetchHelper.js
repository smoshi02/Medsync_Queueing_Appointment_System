export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const url = `${import.meta.env.VITE_API_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    // Handle 401 Unauthorized
    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    // Parse response safely
    let data;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!res.ok) {
      throw new Error(data.message || `Failed to fetch ${endpoint}`);
    }

    return data;
  } catch (err) {
    throw new Error(err.message || "Network error");
  }
};
