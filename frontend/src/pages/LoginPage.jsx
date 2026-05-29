import React, { useContext, useState } from "react";
import { FaEye, FaRegEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

export default function LoginPage() {
  const { backendUrl, setIsLoggedIn } = useContext(AuthContext);

  const [state, setState] = useState("Sign Up");
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      axios.defaults.withCredentials = true;

      if (state === "Sign Up") {
        const res = await axios.post(`${backendUrl}/api/auth/signup`, {
          fullName,
          email,
          password,
        });

        toast.success(res?.data?.message);
        setIsLoggedIn(true);
        navigate("/");
      } else {
        const res = await axios.post(`${backendUrl}/api/auth/login`, {
          email,
          password,
        });

        toast.success(res?.data?.message);
        setIsLoggedIn(true);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/20 via-muted to-primary/30 p-4">
      <div className="w-full max-w-md bg-card/70 backdrop-blur-xl p-10 rounded-3xl border border-border shadow-xl">

        {/* Logo / App Name */}
        <div className="flex flex-col items-center mb-6">
          <h2 className="font-semibold text-4xl tracking-wide text-foreground">
            <span className="font-space-grotesk">
              <span className="font-extralight">Swastha</span>
              <span className="text-primary font-semibold">Sangai</span>
            </span>
          </h2>
        </div>

        <form onSubmit={onSubmitHandler} className="space-y-5">
          {/* Full Name */}
          {state === "Sign Up" && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <FaEye /> : <FaRegEyeSlash />}
              </span>
            </div>

            {/* Forgot Password */}
            {state !== "Sign Up" && (
              <label
                className="block mt-3 text-sm font-medium text-muted-foreground hover:text-primary cursor-pointer"
                onClick={() => navigate("/reset-password")}
              >
                Forgot password?
              </label>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:scale-[1.02] transition-all"
          >
            {state}
          </button>
        </form>

        {/* Toggle Login / Signup */}
        <p className="text-sm text-center mt-6 text-muted-foreground">
          {state === "Sign Up"
            ? "Already have an account? "
            : "Don't have an account? "}
          <button
            onClick={() =>
              setState(state === "Sign Up" ? "Log In" : "Sign Up")
            }
            className="text-primary hover:underline"
          >
            {state === "Sign Up" ? "Login" : "Signup"}
          </button>
        </p>
      </div>
    </div>
  );
}
