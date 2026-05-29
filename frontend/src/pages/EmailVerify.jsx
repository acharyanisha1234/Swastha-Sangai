import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EmailVerify = () => {
  const { backendUrl } = useContext(AuthContext);
  const navigate = useNavigate();

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const otp = otpDigits.join("");

      if (otp.length !== 6) {
        toast.error("Please enter all 6 digits.");
        return;
      }

      const res = await axios.post(backendUrl + "/api/auth/verify-email", { otp });

      toast.success(res.data?.message);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return; // only digits or empty

    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/20 via-muted to-primary/30 p-4">
      <div className="w-full max-w-md bg-card/70 backdrop-blur-xl p-10 rounded-3xl shadow-xl border border-border">

        {/* Heading */}
        <div className="flex flex-col items-center mb-4">
          <h2 className="font-semibold text-4xl tracking-wide text-foreground">
            <span className="font-space-grotesk">
              <span className="font-extralight">Verify</span>{" "}
              <span className="text-primary font-semibold">Email</span>
            </span>
          </h2>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center gap-5"
        >
          <label className="block text-sm font-medium text-muted-foreground">
            Enter the 6 digit code sent to your email.
          </label>

          {/* OTP Inputs */}
          <div className="flex flex-row gap-3">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                className="w-12 h-12 text-center text-lg font-semibold rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary outline-none"
                required
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:scale-[1.02] transition-all"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerify;
