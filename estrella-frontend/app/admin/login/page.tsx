"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const token = localStorage.getItem("admin_token");
    if (token) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("admin_token", data.token);
      router.push("/admin/dashboard");
    } catch (err) {
      setError((err as Error).message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #fbf9f6 0%, #f3ede2 100%)",
      padding: "24px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(229, 223, 213, 0.7)",
        borderRadius: 12,
        padding: "40px 32px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.04)",
      }}>
        {/* Brand Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#c9a961",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(201, 169, 97, 0.2)"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>

        <h1 style={{
          fontFamily: "var(--font-display, serif)",
          fontSize: 26,
          fontWeight: 400,
          color: "var(--brand-text-primary, #1a1a1a)",
          textAlign: "center",
          marginBottom: 8,
          letterSpacing: "0.02em"
        }}>
          Astreylla Portal
        </h1>
        <p style={{
          fontFamily: "var(--font-sans, sans-serif)",
          fontSize: 13,
          color: "var(--brand-text-secondary, #6b6b6b)",
          textAlign: "center",
          marginBottom: 32
        }}>
          Authorized access only. Enter administrative credentials.
        </p>

        {error && (
          <div style={{
            background: "#fdf2f2",
            border: "1px solid #f8b4b4",
            borderRadius: 6,
            padding: "12px 14px",
            color: "#9b2c2c",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            marginBottom: 20,
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label htmlFor="username" style={{
              display: "block",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--brand-text-secondary)",
              marginBottom: 8
            }}>Username</label>
            <input
              type="text"
              id="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              placeholder="admin"
            />
          </div>

          <div>
            <label htmlFor="password" style={{
              display: "block",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--brand-text-secondary)",
              marginBottom: 8
            }}>Password</label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 10,
              width: "100%",
              padding: "13px",
              background: "var(--brand-text-primary, #1a1a1a)",
              color: "#ffffff",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              border: 0,
              borderRadius: 6,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 150ms ease",
            }}
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  fontFamily: "var(--font-sans, sans-serif)",
  fontSize: 13,
  background: "#ffffff",
  border: "1px solid #dcd6cd",
  borderRadius: 6,
  outline: "none",
  color: "#1a1a1a",
  transition: "border-color 150ms ease",
};
