/**
 * StaticFallback — Accessible alternative for prefers-reduced-motion: reduce.
 *
 * When the user's OS settings request reduced motion, this replaces the entire
 * kinetic engine with a clean CSS grid of all 6 competitions.
 * No animations, no GSAP, no transforms — just readable content.
 */

import { EVENTS } from "@/lib/events";

export default function StaticFallback() {
  return (
    <div className="static-fallback">
      <div style={{ marginBottom: "48px" }}>
        <h1
          style={{
            fontFamily: "var(--font-sans), 'Space Grotesk', sans-serif",
            fontSize: "48px",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            color: "#ffffff",
          }}
        >
          Event Timeline
          
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: "13px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
            marginTop: "12px",
          }}
        >
          Shunya · GDG On Campus
        </p>
      </div>

      <div className="static-grid">
        {EVENTS.map((event) => (
          <div
            key={event.id}
            className="static-card"
            style={{ "--card-accent": event.accent }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "11px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: event.accent,
                marginBottom: "12px",
              }}
            >
              {event.tag}
            </p>
            <h2
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              {event.title}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "14px",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {event.description}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "16px" }}>
              <p
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "11px",
                  letterSpacing: "0.04em",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <span style={{ opacity: 0.5 }}>DATE //</span> {event.date}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "11px",
                  letterSpacing: "0.04em",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <span style={{ opacity: 0.5 }}>VENUE //</span> {event.venue}
              </p>
            </div>
            <div className="card-action-wrap" style={{ marginTop: "16px" }}>
              {event.registerUrl ? (
                <a
                  href={event.registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-register-btn active"
                  style={{ textDecoration: "none" }}
                >
                  <span>REGISTER</span>
                  <span className="card-register-arrow">&rarr;</span>
                </a>
              ) : (
                <button type="button" className="card-register-btn empty">
                  <span>REGISTER</span>
                </button>
              )}
              <p className="card-deadline">
                Registration Deadline : <span className="card-deadline-val">{event.registrationDeadline || "TBA"}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
