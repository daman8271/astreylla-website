// Compact line-art shape icons used inside the shape filter buttons.
// Each icon is a 24×24 viewBox so the buttons can scale by font-size.

type IconProps = { size?: number };

const stroke = "currentColor";

export function RoundIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.4" />
      <path
        d="M5 9 L19 9 M5 15 L19 15 M9 4 L9 20 M15 4 L15 20"
        stroke={stroke}
        strokeWidth="0.7"
        opacity="0.5"
      />
    </svg>
  );
}

export function PrincessIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="16" height="16" stroke={stroke} strokeWidth="1.4" />
      <path
        d="M4 4 L20 20 M20 4 L4 20"
        stroke={stroke}
        strokeWidth="0.7"
        opacity="0.5"
      />
    </svg>
  );
}

export function CushionIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" stroke={stroke} strokeWidth="1.4" />
      <path
        d="M7 7 L17 17 M17 7 L7 17"
        stroke={stroke}
        strokeWidth="0.7"
        opacity="0.5"
      />
    </svg>
  );
}

export function OvalIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="12" cy="12" rx="6" ry="9" stroke={stroke} strokeWidth="1.4" />
    </svg>
  );
}

export function PearIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 C7 9 6 13 6 16 a6 6 0 0 0 12 0 c0 -3 -1 -7 -6 -13 z"
        stroke={stroke}
        strokeWidth="1.4"
        fill="none"
      />
    </svg>
  );
}

export function EmeraldIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 4 L17 4 L20 7 L20 17 L17 20 L7 20 L4 17 L4 7 Z"
        stroke={stroke}
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function MarquiseIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 C18 8 18 16 12 21 C6 16 6 8 12 3 Z"
        stroke={stroke}
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function HeartIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20 C7 16 3 13 3 9 a4 4 0 0 1 9 -1 a4 4 0 0 1 9 1 c0 4 -4 7 -9 11 z"
        stroke={stroke}
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function AsscherIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="16" height="16" stroke={stroke} strokeWidth="1.4" />
      <path d="M7 4 L4 7 M17 4 L20 7 M20 17 L17 20 M4 17 L7 20" stroke={stroke} strokeWidth="1.4" />
    </svg>
  );
}

export function RadiantIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 3 L16 3 L21 8 L21 16 L16 21 L8 21 L3 16 L3 8 Z"
        stroke={stroke}
        strokeWidth="1.4"
      />
    </svg>
  );
}

export const SHAPE_ICONS: Record<string, (p: IconProps) => JSX.Element> = {
  Round: RoundIcon,
  Princess: PrincessIcon,
  Cushion: CushionIcon,
  Oval: OvalIcon,
  Pear: PearIcon,
  Emerald: EmeraldIcon,
  Marquise: MarquiseIcon,
  Heart: HeartIcon,
  Asscher: AsscherIcon,
  Radiant: RadiantIcon,
};
