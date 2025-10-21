import React, { useEffect, useState } from "react";

function Toast({ kind = "success", message = "" }) {
  if (!message) return null;
  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={
          `min-w-[220px] rounded-xl border px-4 py-3 shadow-lg ` +
          `bg-white dark:bg-gray-900 ` +
          (kind === "error"
            ? "border-red-300 text-red-700 dark:border-red-700 dark:text-red-300"
            : "border-green-300 text-green-700 dark:border-green-700 dark:text-green-300")
        }
        role="status"
        aria-live="polite"
      >
        {message}
      </div>
    </div>
  );
}

export default function Login({ onSubmit, onNavigateRegister }) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState({ kind: "", message: "" });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      return setToast({ kind: "error", message: "Please fill username/email and password" });
    }
    try {
      setLoading(true);
      if (typeof onSubmit === "function") {
        await onSubmit({ identity: emailOrUsername, password });
      } else {
        // Demo fallback
        await new Promise((res) => setTimeout(res, 700));
      }
      setToast({ kind: "success", message: "Logged in successfully" });
    } catch (err) {
      setToast({ kind: "error", message: err?.message || "Login failed" });
    } finally {
      setLoading(false);
      setTimeout(() => setToast({ kind: "", message: "" }), 1800);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-black flex items-center justify-center px-4">
      <Toast kind={toast.kind} message={toast.message} />
      <div
        className={
          `w-full max-w-md rounded-2xl shadow-lg p-8 ring-1 ring-black/5 ` +
          `bg-white dark:bg-gray-900 ` +
          `transform transition-all duration-300 ` +
          (mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")
        }
      >
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Login to Continue</h1>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="identity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username or Email
            </label>
            <input
              id="identity"
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com or username"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={
              `w-full rounded-lg py-2.5 font-semibold text-white shadow ` +
              `bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 ` +
              `disabled:opacity-60 disabled:cursor-not-allowed transition`
            }
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">
          Don’t have an account?{" "}
          <button
            onClick={() => onNavigateRegister && onNavigateRegister()}
            className="text-blue-600 hover:text-indigo-600 font-medium underline-offset-2 hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
