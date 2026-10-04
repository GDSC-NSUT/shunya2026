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
          {event.registerUrl ? (
            <a
              href={event.registerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card-register-btn active"
              data-url={event.registerUrl}
              onClick={(e) => {
                e.stopPropagation();
                if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
              }}
              aria-label={`Register for ${event.title}`}
            >
              <span>REGISTER</span>
              <span className="card-register-arrow">&rarr;</span>
            </a>
          ) : (
            <button
              type="button"
              className="card-register-btn empty"
              onClick={(e) => {
                e.stopPropagation();
                if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
              }}
              aria-label={`Registration for ${event.title} opening soon`}
            >
              <span>REGISTER</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default GlassCard;
