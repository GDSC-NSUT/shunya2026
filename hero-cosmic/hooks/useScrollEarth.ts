import { useEffect, useRef, RefObject } from 'react';

const FADE_MS = 420;

function setVisible(element: HTMLElement, visible: boolean, opacity: number) {
  element.style.visibility = 'visible';
  element.style.opacity = visible ? String(opacity) : '0';
}

/**
 * Keeps the hero Earth fixed in its hero pose, then crossfades to a separate
 * Earth that belongs to the About section's layout. Scroll only changes the
 * visibility at scene boundaries; it never scrubs the Earth's position.
 */
export function useScrollEarth(
  bgRef?: RefObject<HTMLDivElement | null>,
) {
  const earthRef = useRef<HTMLDivElement>(null);
  const aboutEarthRef = useRef<HTMLDivElement>(null);
  const aboutSectionRef = useRef<HTMLElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heroEarth = earthRef.current;
    const aboutEarth = aboutEarthRef.current;
    if (!heroEarth || !aboutEarth) return;

    const inner = heroEarth.querySelector('[data-earth-inner]') as HTMLElement | null;
    let viewportHeight = window.innerHeight;
    let lastHeroVisible: boolean | undefined;
    let lastAboutVisible: boolean | undefined;
    let heroHideTimer: ReturnType<typeof setTimeout> | undefined;
    let aboutHideTimer: ReturnType<typeof setTimeout> | undefined;

    const configure = () => {
      viewportHeight = window.innerHeight;
      heroEarth.style.transition = `opacity ${FADE_MS}ms ease`;
      aboutEarth.style.transition = `opacity ${FADE_MS}ms ease`;
      if (inner) inner.style.transform = 'translate(-50%, -50%) translate3d(0,0,0) scale(1)';
      heroEarth.style.transform = `translate(-50%, -50%) translate3d(0, ${(
        viewportHeight * 0.6
      ).toFixed(2)}px, 0)`;
      if (hudRef.current) hudRef.current.style.transition = `opacity ${FADE_MS}ms ease`;
    };

    const update = (scrollY: number) => {
      const about = aboutSectionRef?.current;
      const aboutTop = about?.offsetTop ?? viewportHeight * 1.5;
      const aboutBottom = aboutTop + (about?.offsetHeight ?? viewportHeight);
      const isMobile = window.innerWidth < 768;
      const earthSize = isMobile
        ? window.innerWidth * 0.82
        : Math.max(280, Math.min(window.innerWidth * 0.42, 760));
      const earthTop = isMobile
        ? aboutTop + viewportHeight * 0.25 - earthSize / 2
        : aboutTop + ((about?.offsetHeight ?? viewportHeight) - earthSize) / 2;
      const handoffStart = earthTop - viewportHeight;

      // Begin the handoff as the section-bound Earth itself enters the viewport.
      // It remains visible until its own section scrolls away.
      const aboutVisible = scrollY >= handoffStart && scrollY < aboutBottom;
      const heroVisible = scrollY < handoffStart;

      if (heroVisible !== lastHeroVisible) {
        lastHeroVisible = heroVisible;
        if (heroHideTimer) clearTimeout(heroHideTimer);
        setVisible(heroEarth, heroVisible, 1);
        if (!heroVisible) {
          heroHideTimer = setTimeout(() => {
            if (!lastHeroVisible) heroEarth.style.visibility = 'hidden';
          }, FADE_MS);
        }
      }

      if (aboutVisible !== lastAboutVisible) {
        lastAboutVisible = aboutVisible;
        if (aboutHideTimer) clearTimeout(aboutHideTimer);
        // Keep the embedded Earth understated on mobile so copy remains clear.
        const opacity = window.innerWidth < 768 ? 0.34 : 1;
        setVisible(aboutEarth, aboutVisible, opacity);
        if (!aboutVisible) {
          aboutHideTimer = setTimeout(() => {
            if (!lastAboutVisible) aboutEarth.style.visibility = 'hidden';
          }, FADE_MS);
        }
      }

      if (hudRef.current) hudRef.current.style.opacity = heroVisible ? '1' : '0';

      // Preserve the established hero-background cutoff before Part Two.
      if (bgRef?.current) {
        bgRef.current.style.display = scrollY < viewportHeight * 2 ? 'block' : 'none';
      }
    };

    const onNativeScroll = () => update(window.scrollY);
    const onLenisScroll = (event: { scroll: number }) => update(event.scroll);
    const handleResize = () => {
      configure();
      update(window.__lenis?.scroll ?? window.scrollY);
    };
    let lenisCheck: ReturnType<typeof setInterval> | undefined;
    let lenisGiveUp: ReturnType<typeof setTimeout> | undefined;
    let subscribedLenis: typeof window.__lenis;

    configure();
    heroEarth.style.visibility = 'visible';
    aboutEarth.style.visibility = 'hidden';
    aboutEarth.style.opacity = '0';
    update(window.__lenis?.scroll ?? window.scrollY);
    window.addEventListener('scroll', onNativeScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    const connectLenis = () => {
      const lenis = window.__lenis;
      if (!lenis || subscribedLenis) return;
      subscribedLenis = lenis;
      window.removeEventListener('scroll', onNativeScroll);
      lenis.on('scroll', onLenisScroll);
      update(lenis.scroll);
    };

    connectLenis();
    if (!subscribedLenis) {
      lenisCheck = setInterval(connectLenis, 100);
      lenisGiveUp = setTimeout(() => {
        if (lenisCheck) clearInterval(lenisCheck);
      }, 3000);
    }

    return () => {
      if (lenisCheck) clearInterval(lenisCheck);
      if (lenisGiveUp) clearTimeout(lenisGiveUp);
      if (heroHideTimer) clearTimeout(heroHideTimer);
      if (aboutHideTimer) clearTimeout(aboutHideTimer);
      if (subscribedLenis) subscribedLenis.off('scroll', onLenisScroll);
      window.removeEventListener('scroll', onNativeScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [aboutSectionRef, bgRef]);

  return { earthRef, aboutEarthRef, aboutSectionRef: aboutSectionRef, hudRef };
}
