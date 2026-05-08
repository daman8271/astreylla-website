import type { SettingColor } from "./setting-types";

const PALETTE: Record<SettingColor, { band: string; ink: string; bg: string }> = {
  Rose: { band: "#e3b8a4", ink: "#5a3328", bg: "#fbf3ef" },
  White: { band: "#dadada", ink: "#3a3a3a", bg: "#f7f7f7" },
  Yellow: { band: "#d8b76a", ink: "#3a2a06", bg: "#fcf6e6" },
  Platinum: { band: "#c8ccd0", ink: "#1f2933", bg: "#f4f6f8" },
};

export function SettingPlaceholder({
  color = "White",
  label,
  size = "100%",
}: {
  color?: SettingColor;
  label?: string;
  size?: number | string;
}) {
  const p = PALETTE[color];
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={label || "ring placeholder"}
      style={{ display: "block", background: p.bg }}
    >
      <ellipse cx="100" cy="125" rx="48" ry="50" fill="none" stroke={p.band} strokeWidth="6" />
      <ellipse cx="100" cy="125" rx="40" ry="42" fill="none" stroke={p.band} strokeWidth="2" opacity="0.6" />
      <path
        d="M85 70 L100 50 L115 70 L108 95 L92 95 Z"
        fill={p.bg}
        stroke={p.ink}
        strokeWidth="1.5"
        opacity="0.85"
      />
      <path d="M85 70 L115 70 M100 50 L100 95 M92 95 L85 70 L100 50 L115 70 L108 95" stroke={p.ink} strokeWidth="0.6" opacity="0.5" />
      {label ? (
        <text
          x="100"
          y="190"
          fontSize="10"
          textAnchor="middle"
          fill={p.ink}
          opacity="0.6"
          fontFamily="system-ui, sans-serif"
        >
          {label}
        </text>
      ) : null}
    </svg>
  );
}
