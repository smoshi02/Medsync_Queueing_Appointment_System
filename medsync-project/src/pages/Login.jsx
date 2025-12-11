import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { API_URL } from "../config/constants";
import { User, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import bgVideo from "../assets/sangab.mp4";
import logo from "../assets/medsync-logo.png";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // FIELD-LEVEL ERRORS
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Reset
    setUsernameError("");
    setPasswordError("");

    let valid = true;

    if (!username.trim()) {
      setUsernameError("Username is required");
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      valid = false;
    }

    if (!valid) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        // Backend invalid login
        setUsernameError("Invalid username or password");
        setPasswordError("Invalid username or password");
        return;
      }

      const data = await res.json();
      login(data.token);

      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center lg:justify-end relative overflow-hidden p-4 lg:pr-20">

      {/* VIDEO BACKGROUND */}
      <div className="absolute inset-0">
        {/* Video Element */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={bgVideo} type="video/mp4" />
        </video>

        {/* Dark Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-violet-950/75 to-black/80"></div>

        {/* Animated circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* LEFT DESIGN */}
      <div className="hidden lg:flex absolute left-0 top-0 bottom-0 w-1/2 flex-col justify-between p-16 z-10">

        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <img src={logo} alt="MedSync" className="h-16 drop-shadow-2xl" />
            <div>
              <h1 className="text-3xl font-bold text-white">MedSync</h1>
              <p className="text-violet-300 text-sm font-medium">
                Healthcare Management System
              </p>
            </div>
          </div>

          <div className="space-y-4 max-w-xl">
            <h2 className="text-5xl font-bold text-white leading-tight">
              Your Health,<br />Our Priority
            </h2>
            <p className="text-xl text-slate-300">
              Secure, efficient, and accessible healthcare management for modern medical practices.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-xl">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Secure & Private</h3>
            <p className="text-slate-400 text-sm">HIPAA compliant with end-to-end encryption</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
            <p className="text-slate-400 text-sm">Real-time sync for accuracy</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Team Collaboration</h3>
            <p className="text-slate-400 text-sm">Seamless coordination between providers</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Analytics & Reports</h3>
            <p className="text-slate-400 text-sm">Powerful insights at your fingertips</p>
          </div>
        </div>

      </div>

      {/* RIGHT LOGIN CARD */}
      <div className="relative z-10 w-full max-w-lg">

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20">

          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-violet-500/30 blur-2xl rounded-full"></div>
              <img src={logo} alt="MedSync" className="h-16 relative z-10" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              MedSync
            </h1>
            <p className="text-violet-600 text-sm font-medium mt-1">
              Healthcare Management System
            </p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-600">
              Sign in to access your account
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* USERNAME */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Username
              </label>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 rounded-xl 
                    text-slate-900 placeholder-slate-400 focus:bg-white 
                    transition-all outline-none
                    ${usernameError
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-violet-500 focus:ring-violet-100"
                    }
                  `}
                  placeholder="Enter your username"
                />
              </div>

              {usernameError && (
                <p className="text-sm text-red-600 font-medium">{usernameError}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Password
              </label>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 rounded-xl 
                    text-slate-900 placeholder-slate-400 focus:bg-white 
                    transition-all outline-none
                    ${passwordError
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-violet-500 focus:ring-violet-100"
                    }
                  `}
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {passwordError && (
                <p className="text-sm text-red-600 font-medium">{passwordError}</p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 
                hover:from-violet-700 hover:to-fuchsia-700 text-white py-3.5 rounded-xl 
                font-semibold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 
                disabled:opacity-50 disabled:cursor-not-allowed transition-all transform 
                hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center group"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  Sign In
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 mt-8 pt-6 border-t border-slate-100">
            <p className="font-medium">© 2024 MedSync. All rights reserved.</p>
            <p className="mt-1">Trusted by healthcare providers worldwide</p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;