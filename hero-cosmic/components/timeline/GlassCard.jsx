import React from "react";

const GlassCard = React.forwardRef(function GlassCard(
  { event, nodeIndex, onClick, onMouseEnter, onMouseLeave, onMouseMove },
  ref
) {
  const handleRegisterClick = (e) => {
    e.stopPropagation();
    if (event.registerUrl) {
      window.open(event.registerUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      ref={ref}
      className="glass-card"
      style={{ "--card-accent": event.accent }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      data-node-index={nodeIndex}
      role="button"
      aria-label={`View details for ${event.title}`}
      tabIndex={-1}
    >
      {/* The Background Watermark Index (Repeating 1-8) */}
      <span className="card-index">
        {String((nodeIndex % 8) + 1).padStart(2, "0")}
      </span>

      {/* Card content (bottom-aligned) */}
      <div className="card-content-v2">
        <p className="card-tag">
          {event.date}
        </p>
        <h3 className="card-title">{event.title}</h3>
        <p className="card-date">{event.venue} &bull; By GDG NSUT</p>

        {/* Register Button */}
        <div className="card-action-wrap">
          <button
            type="button"
            className={`card-register-btn ${event.registerUrl ? "active" : "empty"}`}
            onClick={handleRegisterClick}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={
              event.registerUrl
                ? `Register for ${event.title}`
                : `Registration for ${event.title} opening soon`
            }
          >
            <span>REGISTER</span>
            {event.registerUrl && <span className="card-register-arrow">&rarr;</span>}
          </button>
        </div>
      </div>
    </div>
  );
});

export default GlassCard;
