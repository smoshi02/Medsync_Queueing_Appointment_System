export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const url = `${import.meta.env.VITE_API_URL}${endpoint}`;

  try {
    console.log("Fetching:", url, "with token:", token ? "YES" : "NO");

    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    if (res.status === 403) {
      console.error(`Access forbidden to ${endpoint}. Check your role or permissions.`);
      return { error: "Forbidden" };
    }

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!res.ok && res.status !== 403) {
      throw new Error(data.message || `Failed to fetch ${endpoint}`);
    }

    return data;
  } catch (err) {
    console.error("Fetch error:", err);
    throw new Error(err.message || "Network error");
  }
};
