import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { API_URL } from "../config/constants";
import bgImage from "../assets/medsync-bg.jpg";
import logo from "../assets/medsync-logo.png";


function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Invalid username or password");
      }

      const data = await res.json();
      login(data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-gray-100 overflow-hidden">

      {/* LEFT SIDE — Enhanced Gradient + Slanted Overlay */}
      <div
        className="relative hidden md:flex w-[60%] items-center justify-start"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Richer Purple Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-800/90 via-purple-700/85 to-purple-600/90"></div>

        {/* Improved diagonal white overlay with smoother angle */}
        <div
          className="absolute top-0 right-0 bottom-0 bg-white shadow-2xl"
          style={{
            width: "50%",
            clipPath: "polygon(75% 0, 100% 0, 100% 100%, 0% 100%)",
          }}
        ></div>

        {/* Left Side Text */}
        <div className="relative z-10 p-12 pl-10 text-white max-w-xl drop-shadow-lg">
          <h1 className="text-4xl font-semibold mb-1 bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
            Welcome To
          </h1>

          <h2 className="text-7xl font-extrabold mb-8 bg-gradient-to-r from-white via-white to-purple-200 bg-clip-text text-transparent tracking-wide drop-shadow-md">
            MEDSYNC
          </h2>

          <p className="text-base text-white/95 leading-relaxed">
            Your all-in-one patient management and queue monitoring system.
          </p>

          <p className="text-base text-white/90 mt-3 leading-relaxed">
            MedSync streamlines workflow with organized patient registration,
            priority levels, time blocks, and real-time queue updates.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE — Login Form */}
      <div className="w-full md:w-[40%] flex items-center justify-center p-10 bg-white">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-4">
              <img
                src={logo}
                alt="logo"
                className="w-32 h-32 object-contain drop-shadow-md"
              />
            </div>

            <h1 className="text-4xl font-bold text-purple-700 tracking-wide">
              MEDSYNC
            </h1>
          </div>


          {/* Title */}
          <h2 className="text-3xl font-bold text-center mb-8 text-purple-700 drop-shadow-sm">
            Login
          </h2>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-600 rounded-lg shadow">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            {/* Username */}
            <div className="relative mb-8">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="
                block w-full border-0 border-b-2 
                border-gray-300 bg-transparent px-0 py-2 text-gray-900 
                focus:border-purple-600 focus:outline-none peer
              "
                placeholder=" "
                required
              />
              <label
                className="
                absolute text-gray-500 duration-300 transform
                -translate-y-6 scale-75 top-1 
                peer-placeholder-shown:scale-100 
                peer-placeholder-shown:translate-y-0 
                peer-focus:-translate-y-6 peer-focus:scale-75 
                peer-focus:text-purple-600
              "
              >
                Username
              </label>
            </div>

            {/* Password */}
            <div className="relative mb-8">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                block w-full border-0 border-b-2 
                border-gray-300 bg-transparent px-0 py-2 text-gray-900 
                focus:border-purple-600 focus:outline-none peer
              "
                placeholder=" "
                required
              />
              <label
                className="
                absolute text-gray-500 duration-300 transform
                -translate-y-6 scale-75 top-1 
                peer-placeholder-shown:scale-100 
                peer-placeholder-shown:translate-y-0 
                peer-focus:-translate-y-6 peer-focus:scale-75 
                peer-focus:text-purple-600
              "
              >
                Password
              </label>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2 rounded border-gray-300" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>

              <span className="text-sm text-purple-600 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="
              w-full bg-purple-600 text-white p-3 rounded-lg font-semibold 
              hover:bg-purple-700 transition shadow-md hover:shadow-lg
            "
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* Signup */}
          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-purple-600 hover:underline font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

}

export default Login;
