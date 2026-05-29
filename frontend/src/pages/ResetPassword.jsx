import axios from "axios";
import React, { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaEye, FaRegEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const { backendUrl } = useContext(AuthContext);
  const navigate = useNavigate();

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join("");

    if (otp.length !== 6) {
      toast.error("Please enter all 6 digits.");
      return;
    }

    if (!isOtpSent) {
      return toast.error("OTP has not been sent to email.");
    }

    try {
      const res = await axios.post(
        backendUrl + "/api/auth/reset-password",
        { email, otp, newPassword },
      );

      toast.success(res.data?.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (email.trim() === "") {
      return toast.error("Please provide your email first.");
    }

    try {
      axios.defaults.withCredentials = true;
      const res = await axios.post(
        backendUrl + "/api/auth/send-reset-otp",
        { email }
      );

      toast.success(res.data?.message);
      setIsOtpSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message);
      setIsOtpSent(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/20 via-muted to-primary/30 p-4">
      <div className="w-full max-w-md bg-card/70 backdrop-blur-xl p-10 rounded-3xl border border-border shadow-xl animate-fadeIn">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-6">
          <h2 className="font-semibold text-white tracking-wide text-4xl">
            <span className="font-space-grotesk">
              <span className="font-light">Reset</span>{" "}
              <span className="text-primary font-thi">Password</span>
            </span>
          </h2>
        </div>

        {/* ====================== OTP INPUT SECTION ====================== */}
        {isOtpSent ? (
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-6">

            <label className="block text-sm text-muted-foreground text-center">
              Enter the 6-digit verification code sent to your email.
            </label>

            {/* OTP FIELDS */}
            <div className="flex justify-center gap-3">
              {[...Array(6)].map((_, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  maxLength="1"
                  type="text"
                  value={otpDigits[index]}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  className="w-12 h-12 text-center rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />

              ))}
            </div>

            {/* NEW PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-stone-400 hover:text-white transition"
              >
                {showPassword ? <FaEye /> : <FaRegEyeSlash />}
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-warning bg-primary text-primary-foreground py-3 w-full rounded-xl shadow-lg font-semibold hover:scale-[1.03] transition-all"
            >
              Reset Password
            </button>
          </form>
        ) : (
          /* ====================== EMAIL SUBMIT SECTION ====================== */
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-6">
            <label className="block text-sm text-muted-foreground text-center">
              Enter your email to receive a reset code.
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />

            <button
              type="submit"
              className="btn btn-warning w-full py-3 text-primary-foreground bg-primary rounded-xl shadow-lg font-semibold hover:scale-[1.03] transition-all"
            >
              Send OTP
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
