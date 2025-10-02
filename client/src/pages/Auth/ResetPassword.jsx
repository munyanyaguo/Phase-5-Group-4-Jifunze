// src/pages/Auth/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:5000/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = request token, 2 = reset password
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [debugToken, setDebugToken] = useState("");

  // Step 1: Request reset token
  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to request reset");

      setSuccess("If email exists, reset instructions have been sent.");
      // Show token for local testing (in production, this would be sent via email)
      if (result?.data?.reset_token) {
        setDebugToken(result.data.reset_token);
      } else {
        setDebugToken("");
      }
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  // Step 2: Submit token + new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to reset password");

      setSuccess("Password reset successfully! You can now log in.");
      // Redirect to login after successful reset
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      {step === 1 && (
        <form onSubmit={handleRequestToken} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <p className="text-xs text-gray-500">We'll generate a reset token and (for local testing) show it below.</p>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Request Reset Token
          </button>
          {debugToken && (
            <div className="mt-3 p-2 border rounded bg-gray-50">
              <p className="text-sm text-gray-800">Reset token (local testing):</p>
              <code className="break-all text-xs">{debugToken}</code>
            </div>
          )}
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="text"
            placeholder="Enter reset token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <p className="text-xs text-gray-500">Password must have at least 6 characters, one uppercase letter, and one number.</p>
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
