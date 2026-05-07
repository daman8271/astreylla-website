export function HeroPosterFallback({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 40%, #2a2a2a 0%, #0e0e0e 60%, #050505 100%)",
        ...style,
      }}
    />
  );
}
