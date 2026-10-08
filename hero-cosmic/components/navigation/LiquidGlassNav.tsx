'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

/* ── Section registry ── */
const SECTIONS = [
  { id: 'home',     label: 'Home' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'schedule', label: 'Schedule' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

/* ── Inline styles as constants to keep JSX readable ── */
const FONT = 'var(--font-corpta), sans-serif';

const pillBase: React.CSSProperties = {
  position: 'fixed',
  top: 'max(18px, env(safe-area-inset-top, 18px))',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 9999,
  fontFamily: FONT,
  cursor: 'default',

  /* ── Liquid Water / Refraction visual ── */
  backdropFilter: 'blur(16px) brightness(1.1) contrast(1.1) saturate(120%)',
  WebkitBackdropFilter: 'blur(16px) brightness(1.1) contrast(1.1) saturate(120%)',

  background: 'transparent',

  /* Mimicking the thick 3D glass bevel from the reference image */
  boxShadow: [
    // Strong top/left specular highlight (the bright rim)
    'inset 2px 3px 6px rgba(255, 255, 255, 0.7)',
    'inset 1px 1px 2px rgba(255, 255, 255, 0.9)',
    // Strong bottom/right inner shadow (the thick glass volume)
    'inset -2px -4px 8px rgba(0, 0, 0, 0.5)',
    'inset -1px -1px 3px rgba(0, 0, 0, 0.7)',
    // Drop shadow for depth
    '0 15px 35px rgba(0, 0, 0, 0.5)',
    // Fake caustic reflection below the glass
    '0 15px 20px rgba(255, 255, 255, 0.08)'
  ].join(', '),

  // Pronounced directional borders to enhance the 3D bevel edge
  borderTop: '1.5px solid rgba(255, 255, 255, 0.7)',
  borderLeft: '1.5px solid rgba(255, 255, 255, 0.4)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.4)',
  borderRight: '1px solid rgba(0, 0, 0, 0.2)',
  
  borderRadius: '999px',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  width: 'max-content',
  maxWidth: 'min(92vw, 800px)', // Cap on mobile (92vw≈359px at 390px); accommodates full expanded text on desktop
  contain: 'layout paint', // Isolates layout recalculations from the rest of the DOM

  /* ── Motion: all transitions via CSS only (no new dep) ── */
  transition: [
    'padding 320ms cubic-bezier(0.4,0,0.2,1)',
    'box-shadow 200ms ease',
    'border-radius 320ms ease',
  ].join(', '),

  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
};

const compactInner: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px 48px',
  minWidth: '160px',
};

const activeLabelStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  color: 'rgba(220,235,255,0.9)',
  lineHeight: 1,
};

const expandedInner: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0',
  padding: '0',
  height: '72px',
};

const logoBlock: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 36px',
  height: '100%',
  cursor: 'pointer',
  borderRight: '1px solid rgba(255,255,255,0.08)',
  flexShrink: 0,
};

const logoText: React.CSSProperties = {
  fontSize: '1.25rem',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.95)',
  fontWeight: 600,
};

const navLinksWrapper: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '0 16px',
  gap: '12px',
  flexShrink: 0,
};

const navLinkBase: React.CSSProperties = {
  padding: '14px 20px',
  fontSize: '0.9rem',
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  color: 'rgba(200,220,255,0.75)',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontFamily: FONT,
  borderRadius: '999px',
  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  lineHeight: 1,
  flexShrink: 0,
};

const navLinkHover: React.CSSProperties = {
  color: 'rgba(255,255,255,1)',
  background: 'rgba(255,255,255,0.08)',
};

/* ── Ultra-Premium Word Morph Component ── */
const PremiumWordMorph = ({ text }: { text: string }) => {
  const words = text.match(/[^ ]+| /g) || [];
  
  const wordCounts: Record<string, number> = {};
  const items = words.map((word) => {
    if (!wordCounts[word]) wordCounts[word] = 0;
    const id = `${word}-${wordCounts[word]}`;
    wordCounts[word]++;
    return { word, id };
  });

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 100, damping: 14, mass: 0.8 }}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        overflow: 'hidden',
        padding: '4px 0',
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map(({ word, id }, i) => (
          <motion.span
            layout
            key={id}
            initial={{ opacity: 0, y: 35, filter: 'blur(8px)', rotateX: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, y: -35, filter: 'blur(8px)', rotateX: -60, scale: 0.9 }}
            transition={{ 
              type: 'spring', 
              stiffness: 100, 
              damping: 14, 
              mass: 0.8,
              delay: i * 0.04 
            }}
            style={{ 
              display: 'inline-block', 
              whiteSpace: 'pre',
              transformOrigin: 'bottom center',
              transformStyle: 'preserve-3d'
            }}
          >
            {word}
          </motion.span>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

/* ── Component ── */
export default function LiquidGlassNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [homeState, setHomeState] = useState('SHUNYA');
  const [expanded, setExpanded] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isCardSelected, setIsCardSelected] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  /* ── Listen for schedule detail view open/close messages ── */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'shunya:details-open') {
        setIsCardSelected(true);
      } else if (event.data?.type === 'shunya:details-close') {
        setIsCardSelected(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  /* ── Reset card selection when navigating away from schedule ── */
  useEffect(() => {
    if (pathname !== '/schedule') {
      setIsCardSelected(false);
    }
  }, [pathname]);

  /* ── Detect pointer type and mobile view client-side only ── */
  const [isPointerFine, setIsPointerFine] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mqPointer = window.matchMedia('(pointer: fine)');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPointerFine(mqPointer.matches);
    const onPointerChange = (e: MediaQueryListEvent) => setIsPointerFine(e.matches);
    mqPointer.addEventListener('change', onPointerChange);

    const mqMobile = window.matchMedia('(max-width: 1024px)');
    setIsMobile(mqMobile.matches);
    const onMobileChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mqMobile.addEventListener('change', onMobileChange);

    return () => {
      mqPointer.removeEventListener('change', onPointerChange);
      mqMobile.removeEventListener('change', onMobileChange);
    };
  }, []);

  // Track active section based on pathname and scroll
  useEffect(() => {
    if (pathname === '/timeline') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSection('timeline');
      setHomeState('SHUNYA');
      return;
    }
    if (pathname === '/schedule') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSection('schedule');
      setHomeState('SHUNYA');
      return;
    }
    if (pathname === '/') {
      const handleScroll = () => {
        const half = window.innerHeight / 2;
        
        const sponsorsEl = document.getElementById('sponsors');
        if (sponsorsEl && sponsorsEl.getBoundingClientRect().top <= half) {
          setHomeState('PAST SPONSORS');
          return;
        }

        const pastShunyaEl = document.getElementById('past-shunya');
        if (pastShunyaEl && pastShunyaEl.getBoundingClientRect().top <= half) {
          setHomeState('PAST SHUNYA');
          return;
        }

        const aboutEl = document.getElementById('about');
        if (aboutEl && aboutEl.getBoundingClientRect().top <= half) {
          setHomeState('ABOUT SHUNYA');
          return;
        }

        setHomeState('SHUNYA');
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [pathname]);

  const handleNav = (id: SectionId) => {
    setActiveSection(id);
    if (id === 'timeline') {
      router.push('/timeline');
      setExpanded(false);
      return;
    }
    if (id === 'schedule') {
      router.push('/schedule');
      setExpanded(false);
      return;
    }
    if (id === 'home') {
      if (pathname !== '/') router.push('/');
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      setExpanded(false);
      return;
    }
  };

  /* ── Collapse on outside click / tap ── */
  const handleOutsideClick = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    },
    []
  );

  useEffect(() => {
    if (expanded) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [expanded, handleOutsideClick]);

  const handleMouseEnter = () => {
    if (isPointerFine) setExpanded(true);
  };
  const handleMouseLeave = () => {
    if (isPointerFine) setExpanded(false);
  };
  const handleTap = (e: React.MouseEvent) => {
    if (!isPointerFine) {
      e.stopPropagation();
      setExpanded((v) => !v);
    }
  };

  const activeLabelText = SECTIONS.find((s) => s.id === activeSection)?.label ?? 'Home';

  // Dynamic overrides for mobile vertical expansion
  const isEffectivelyExpanded = !isMobile || expanded;

  const dynamicExpandedInner: React.CSSProperties = {
    ...expandedInner,
    display: isEffectivelyExpanded ? 'flex' : 'none',
    flexDirection: isMobile ? 'column' : 'row',
    height: isMobile ? 'auto' : '72px',
    maxHeight: isMobile ? '80vh' : 'none',
    overflowY: isMobile ? 'auto' : 'visible',
    overflowX: 'hidden',
    padding: isMobile ? '32px 24px' : '0',
    minWidth: isMobile ? '260px' : 'auto',
  };

  const dynamicCompactInner: React.CSSProperties = {
    ...compactInner,
    display: isEffectivelyExpanded ? 'none' : 'flex',
    padding: isMobile ? '12px 32px' : compactInner.padding,
    minWidth: isMobile ? '120px' : compactInner.minWidth,
  };

  const dynamicActiveLabelStyle: React.CSSProperties = {
    ...activeLabelStyle,
    fontSize: isMobile ? '0.85rem' : activeLabelStyle.fontSize,
  };

  const dynamicLogoBlock: React.CSSProperties = {
    ...logoBlock,
    borderRight: isMobile ? 'none' : logoBlock.borderRight,
    borderBottom: isMobile ? '1px solid rgba(255,255,255,0.06)' : 'none',
    padding: isMobile ? '0 0 24px 0' : logoBlock.padding,
    width: isMobile ? '100%' : 'auto',
  };

  const dynamicLogoText: React.CSSProperties = {
    ...logoText,
    fontSize: isMobile ? '1.1rem' : logoText.fontSize,
  };

  const dynamicNavLinksWrapper: React.CSSProperties = {
    ...navLinksWrapper,
    flexDirection: isMobile ? 'column' : 'row',
    padding: isMobile ? '24px 0 0 0' : navLinksWrapper.padding,
    gap: isMobile ? '12px' : navLinksWrapper.gap,
    width: isMobile ? '100%' : 'auto',
  };

  const dynamicPillBase: React.CSSProperties = {
    ...pillBase,
    borderRadius: isMobile && expanded ? '32px' : '999px',
    transform: isCardSelected
      ? 'translate(-50%, -150%)'
      : isMobile && expanded
      ? 'translateX(-50%) translateY(0)'
      : 'translateX(-50%)',
    opacity: isCardSelected ? 0 : 1,
    pointerEvents: isCardSelected ? 'none' : 'auto',
    transition: [
      'padding 320ms cubic-bezier(0.4,0,0.2,1)',
      'box-shadow 200ms ease',
      'border-radius 320ms ease',
      'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
      'opacity 300ms ease',
    ].join(', '),
  };

  return (
    <div
      ref={pillRef}
      style={dynamicPillBase}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleTap}
      aria-label="Site navigation"
      role="navigation"
    >
      {/* ── Compact State ── */}
      <div style={dynamicCompactInner}>
        {activeSection === 'home' ? (
          <span style={{ ...dynamicActiveLabelStyle, display: 'flex', alignItems: 'center' }}>
            <PremiumWordMorph text={homeState} />
            {isMobile && !expanded && (
               <svg style={{ marginLeft: '8px' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
            )}
          </span>
        ) : (
          <span style={{ ...dynamicActiveLabelStyle, display: 'flex', alignItems: 'center' }}>
            {activeLabelText}
            {isMobile && !expanded && (
               <svg style={{ marginLeft: '8px' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
            )}
          </span>
        )}
      </div>

      {/* ── Expanded State ── */}
      <div
        style={dynamicExpandedInner}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logo / Home link */}
        <div
          style={dynamicLogoBlock}
          onClick={() => handleNav('home')}
          role="link"
          aria-label="Home"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleNav('home')}
        >
          <span style={{ ...dynamicLogoText, display: 'flex', alignItems: 'center' }}>
            <PremiumWordMorph text={homeState} />
          </span>
        </div>

        {/* Nav links — all except Home */}
        <div style={dynamicNavLinksWrapper}>
          {SECTIONS.filter((s) => s.id !== 'home').map((s) => (
            <button
              key={s.id}
              style={{
                ...navLinkBase,
                ...(activeSection === s.id 
                  ? { 
                      color: '#ffffff', 
                      background: isMobile ? 'rgba(255,255,255,0.08)' : 'transparent',
                      textShadow: '0 0 16px rgba(255, 255, 255, 0.6), 0 0 32px rgba(96, 165, 250, 0.4)'
                    } 
                  : (hoveredLink === s.id && !isMobile ? navLinkHover : {})),
                width: isMobile ? '100%' : 'auto',
                padding: isMobile ? '16px 20px' : navLinkBase.padding,
                borderRadius: isMobile ? '16px' : navLinkBase.borderRadius,
                fontSize: isMobile ? '0.95rem' : navLinkBase.fontSize,
                letterSpacing: isMobile ? '0.2em' : navLinkBase.letterSpacing,
              }}
              onMouseEnter={() => !isMobile && setHoveredLink(s.id)}
              onMouseLeave={() => !isMobile && setHoveredLink(null)}
              onClick={() => handleNav(s.id)}
              tabIndex={0}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
