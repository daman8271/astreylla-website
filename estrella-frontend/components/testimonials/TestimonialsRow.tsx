const TESTIMONIALS = [
  {
    quote:
      "Pricing transparency I haven't seen anywhere else. The certification paperwork was waiting before the stone even shipped.",
    author: "Lena Marchetti",
    role: "Independent Jeweller, NYC",
  },
  {
    quote:
      "Five custom commissions, five flawless stones. Estrella is now the only wholesale partner my workshop uses.",
    author: "Arjun Mehra",
    role: "Bench Jeweller, London",
  },
  {
    quote:
      "Sourced our centre stone for half what we were quoted at the high-street showroom. Exact same lab certificate.",
    author: "Priya & Sam",
    role: "Engagement, Mumbai",
  },
];

export function TestimonialsRow() {
  return (
    <section
      className="estrella-section"
      style={{ background: "var(--brand-bg-section)" }}
      aria-labelledby="testimonials-heading"
    >
      <div className="estrella-container">
        <header style={{ textAlign: "center", marginBottom: 56 }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--brand-text-muted)",
              marginBottom: 12,
            }}
          >
            What people say
          </p>
          <h2
            id="testimonials-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 4.5vw, 48px)",
              color: "var(--brand-text-primary)",
            }}
          >
            Trusted by jewellers and couples alike
          </h2>
        </header>

        <ul
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {TESTIMONIALS.map((t) => (
            <li
              key={t.author}
              style={{
                background: "var(--brand-bg)",
                border: "1px solid var(--brand-border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: 32,
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 17,
                  lineHeight: 1.6,
                  color: "var(--brand-text-primary)",
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--brand-text-primary)",
                  }}
                >
                  {t.author}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 13,
                    color: "var(--brand-text-muted)",
                    marginTop: 2,
                  }}
                >
                  {t.role}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
