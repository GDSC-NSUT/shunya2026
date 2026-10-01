import React from "react";

const GlassCard = React.forwardRef(function GlassCard(
  { event, nodeIndex, onClick, onMouseEnter, onMouseLeave, onMouseMove },
  ref
) {
  return (
    <div
      ref={ref}
      className="glass-card"
      style={{ "--card-accent": event.accent }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      role="button"
      aria-label={`View details for ${event.title}`}
      tabIndex={-1}
    >
      {/* The Background Watermark Index (Repeating 1-6) */}
      <span className="card-index">
        {String((nodeIndex % 8) + 1).padStart(2, "0")}
      </span>

      {/* Card content (bottom-aligned) */}
      <div className="card-content-v2">
        <p className="card-tag">
          {event.tag}
        </p>
        <h3 className="card-title">{event.title}</h3>
        <p className="card-description">{event.description}</p>
        <p className="card-date">{event.date} &bull; {event.venue}</p>
      </div>
    </div>
  );
});

export default GlassCard;
