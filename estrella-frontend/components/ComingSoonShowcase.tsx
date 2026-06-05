"use client";

import Link from "next/link";
import React, { useState } from "react";
import { ArrowRight, Check, Compass, Star } from "lucide-react";

interface PreviewItem {
  name: string;
  shape: string;
  description: string;
  colorHex: string;
  gradient: string;
}

interface ComingSoonShowcaseProps {
  title: string;
  subtitle: string;
  description: string;
  type: "diamonds" | "gemstones";
  previews: PreviewItem[];
}

export function ComingSoonShowcase({
  title,
  subtitle,
  description,
  type,
  previews,
}: ComingSoonShowcaseProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "var(--brand-bg)",
        color: "var(--brand-text-primary)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Editorial full-bleed backdrop image with overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/luxury_gemstones_backdrop.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }}
      />
      {/* Gradient overlay for contrast and readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(10, 8, 6, 0.7) 0%, rgba(14, 12, 10, 0.95) 70%, rgba(14, 12, 10, 1) 100%)",
          zIndex: 1,
        }}
      />

      {/* Main content grid */}
      <div
        className="estrella-container"
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "calc(75px + clamp(48px, 8vw, 96px))",
          paddingBottom: "clamp(48px, 8vw, 96px)",
          flex: 1,
          textAlign: "center",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 16px",
            borderRadius: "9999px",
            background: "rgba(181, 154, 111, 0.15)",
            border: "1px solid rgba(181, 154, 111, 0.3)",
            marginBottom: 24,
            backdropFilter: "blur(8px)",
          }}
        >
          <Star size={12} style={{ color: "var(--brand-accent-gold)" }} />
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--brand-accent-gold)",
            }}
          >
            {subtitle}
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(44px, 7vw, 76px)",
            fontWeight: 400,
            lineHeight: 1.1,
            color: "#ffffff",
            marginBottom: 20,
            maxWidth: "18ch",
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          }}
        >
          {title}
        </h1>

        {/* Narrative Description */}
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(16px, 2.2vw, 20px)",
            lineHeight: 1.7,
            color: "rgba(255, 255, 255, 0.8)",
            maxWidth: "600px",
            marginBottom: 40,
            textShadow: "0 1px 8px rgba(0,0,0,0.3)",
          }}
        >
          {description}
        </p>

        {/* Dual Actions Grid */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            width: "100%",
            maxWidth: "480px",
            marginBottom: 64,
          }}
        >
          {/* Main Ring CTA Button */}
          <Link
            href="/ring-studio/setting"
            className="estrella-btn estrella-btn--pill-white"
            style={{
              width: "100%",
              justifyContent: "center",
              gap: 12,
              paddingBlock: 16,
              background: "#ffffff",
              color: "#0e0e0e",
              boxShadow: "0 12px 28px rgba(255, 255, 255, 0.1)",
              border: "none",
            }}
          >
            <Compass size={16} />
            <span>Check Our Rings</span>
            <ArrowRight size={14} />
          </Link>

          {/* Premium waitlist form */}
          <div
            style={{
              width: "100%",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              padding: "20px 24px",
              backdropFilter: "blur(12px)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#ffffff",
                marginBottom: 12,
                textAlign: "left",
              }}
            >
              Exclusive Pre-Launch Notification
            </h3>
            {subscribed ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "var(--brand-accent-gold)",
                  fontSize: 14,
                  fontWeight: 500,
                  textAlign: "left",
                }}
              >
                <Check size={16} />
                <span>You have been added to our exclusive list. Thank you.</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  gap: 12,
                  width: "100%",
                }}
              >
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                    padding: "10px 14px",
                    color: "#ffffff",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 200ms ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--brand-accent-gold)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.2)")}
                />
                <button
                  type="submit"
                  className="estrella-btn"
                  style={{
                    background: "var(--brand-accent-gold)",
                    color: "#1a1a1a",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontSize: 13,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Notify Me
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Showcase Tiles */}
        <div style={{ width: "100%", maxWidth: "1000px" }}>
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--brand-accent-gold)",
              marginBottom: 32,
            }}
          >
            Sneak Preview
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {previews.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "16px",
                  padding: "32px 24px",
                  textAlign: "center",
                  backdropFilter: "blur(8px)",
                  transition: "all 300ms ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                className="hover-card-premium"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.borderColor = "var(--brand-accent-gold)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(181, 154, 111, 0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Colored stone shape representation */}
                <div
                  style={{
                    width: 72,
                    height: 72,
                    margin: "0 auto 24px",
                    borderRadius: "50%",
                    background: item.gradient,
                    boxShadow: `0 8px 24px ${item.colorHex}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 2,
                      borderRadius: "50%",
                      border: "1px dashed rgba(255,255,255,0.4)",
                    }}
                  />
                  <Star size={20} style={{ color: "#ffffff", opacity: 0.8 }} />
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 24,
                    color: "#ffffff",
                    marginBottom: 8,
                  }}
                >
                  {item.name}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 12,
                    color: "var(--brand-accent-gold)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  {item.shape} Cut
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
