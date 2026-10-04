import { useEffect, useRef, RefObject } from 'react';

const DESKTOP_FADE_MS = 420;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Mobile keeps the original scroll-following Earth animation. On laptop and
 * desktop, a fixed hero Earth crossfades to a separate Earth inside About.
 */
export function useScrollEarth(bgRef?: RefObject<HTMLDivElement | null>) {
  const earthRef = useRef<HTMLDivElement>(null);
  const aboutEarthRef = useRef<HTMLDivElement>(null);
  const aboutSectionRef = useRef<HTMLElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heroEarth = earthRef.current;
    if (!heroEarth) return;

    const inner = heroEarth.querySelector('[data-earth-inner]') as HTMLElement | null;
    let viewportHeight = window.innerHeight;
    let isMobile = window.innerWidth < 1024;
    let scrollY = window.__lenis?.scroll ?? window.scrollY;
    let rafId: number | null = null;
    let firstMobileTick = true;
    let currentY = 0;
    let currentHud = 1;
    let lastWrittenY = -9999;
    let lastWrittenHud = -9999;
    let lastHeroVisible: boolean | undefined;
    let lastAboutVisible: boolean | undefined;
    let lastLogoVisible: boolean | undefined;
    let lastBackgroundVisible: boolean | undefined;
    let heroHideTimer: ReturnType<typeof setTimeout> | undefined;
    let aboutHideTimer: ReturnType<typeof setTimeout> | undefined;
    let lenisCheck: ReturnType<typeof setInterval> | undefined;
    let lenisGiveUp: ReturnType<typeof setTimeout> | undefined;
    let subscribedLenis: typeof window.__lenis;

    const setBackgroundVisible = (visible: boolean) => {
      if (!bgRef?.current || visible === lastBackgroundVisible) return;
      bgRef.current.style.display = visible ? 'block' : 'none';
      lastBackgroundVisible = visible;
    };

    const configureMobile = () => {
      heroEarth.style.transition = 'none';
      heroEarth.style.visibility = 'visible';
      heroEarth.style.opacity = '1';
      if (inner) inner.style.transform = 'translate(-50%, -50%) translate3d(0,0,0) scale(0.9)';
      const aboutEarth = aboutEarthRef.current;
      if (aboutEarth) {
        aboutEarth.style.opacity = '0';
        aboutEarth.style.visibility = 'hidden';
      }
      if (hudRef.current) hudRef.current.style.transition = 'none';
      if (logoRef.current) logoRef.current.style.transition = 'none';
    };

    const configureDesktop = () => {
      heroEarth.style.transition = `opacity ${DESKTOP_FADE_MS}ms ease`;
      heroEarth.style.transform = `translate(-50%, -50%) translate3d(0, ${(viewportHeight * 0.6).toFixed(2)}px, 0)`;
      if (inner) inner.style.transform = 'translate(-50%, -50%) translate3d(0,0,0) scale(1)';
      const aboutEarth = aboutEarthRef.current;
      if (aboutEarth) aboutEarth.style.transition = `opacity ${DESKTOP_FADE_MS}ms ease`;
      if (hudRef.current) hudRef.current.style.transition = `opacity ${DESKTOP_FADE_MS}ms ease`;
      if (logoRef.current) logoRef.current.style.transition = `opacity ${DESKTOP_FADE_MS}ms ease`;
    };

    const tickMobile = () => {
      const scrollDistance = viewportHeight * 1.5;
      const raw = clamp(scrollY / Math.max(scrollDistance, 1), 0, 1);
      const eased = easeInOutCubic(raw);
      const targetHud = 1 - clamp(raw / 0.45, 0, 1);
      let targetY = lerp(viewportHeight * 0.49, 0, eased);
      if (scrollY > scrollDistance) targetY -= scrollY - scrollDistance;

      if (firstMobileTick || Math.abs(targetY - currentY) > viewportHeight) {
        currentY = targetY;
        currentHud = targetHud;
        firstMobileTick = false;
      } else {
        currentY += (targetY - currentY) * 0.14;
        currentHud += (targetHud - currentHud) * 0.14;
      }

      if (Math.abs(currentY - lastWrittenY) > 0.15) {
        heroEarth.style.transform = `translate(-50%, -50%) translate3d(0, ${currentY.toFixed(2)}px, 0)`;
        lastWrittenY = currentY;
      }
      if (hudRef.current && Math.abs(currentHud - lastWrittenHud) > 0.002) {
        const opacity = clamp(currentHud, 0, 1).toFixed(3);
        hudRef.current.style.opacity = opacity;
        if (logoRef.current) logoRef.current.style.opacity = opacity;
        lastWrittenHud = currentHud;
      }

      const settled = Math.abs(targetY - currentY) < 0.1 && Math.abs(targetHud - currentHud) < 0.002;
      if (settled) {
        rafId = null;
      } else {
        rafId = requestAnimationFrame(tickMobile);
      }
    };

    const updateMobile = (nextScrollY: number) => {
      scrollY = nextScrollY;
      const visible = scrollY < viewportHeight * 2;
      heroEarth.classList.toggle('invisible', !visible);
      heroEarth.classList.toggle('visible', visible);
      heroEarth.style.visibility = visible ? 'visible' : 'hidden';
      setBackgroundVisible(visible);
      if (rafId === null) rafId = requestAnimationFrame(tickMobile);
    };

    const setDesktopElementVisible = (
      element: HTMLElement,
      visible: boolean,
      opacity: number,
      hideTimer: 'hero' | 'about',
    ) => {
      element.style.visibility = 'visible';
      element.style.opacity = visible ? String(opacity) : '0';
      if (hideTimer === 'hero') {
        if (heroHideTimer) clearTimeout(heroHideTimer);
        if (!visible) {
          heroHideTimer = setTimeout(() => {
            if (lastHeroVisible === false) element.style.visibility = 'hidden';
          }, DESKTOP_FADE_MS);
        }
      } else {
        if (aboutHideTimer) clearTimeout(aboutHideTimer);
        if (!visible) {
          aboutHideTimer = setTimeout(() => {
            if (lastAboutVisible === false) element.style.visibility = 'hidden';
          }, DESKTOP_FADE_MS);
        }
      }
    };

    const updateDesktop = (nextScrollY: number) => {
      scrollY = nextScrollY;
      const section = aboutSectionRef.current;
      const aboutTop = section?.offsetTop ?? viewportHeight * 1.5;
      const aboutHeight = section?.offsetHeight ?? viewportHeight;
      const earthSize = Math.max(280, Math.min(window.innerWidth * 0.36, 650));
      const earthTop = aboutTop + (aboutHeight - earthSize) / 2;
      const handoffStart = earthTop - viewportHeight;
      const aboutBottom = aboutTop + aboutHeight;
      const heroVisible = scrollY < handoffStart;
      const aboutVisible = scrollY >= handoffStart && scrollY < aboutBottom;
      const navSwitchY = aboutTop - viewportHeight / 2;
      const logoVisible = scrollY < navSwitchY + 24;
      const aboutEarth = aboutEarthRef.current;

      // About's Earth is breakpoint-mounted. A resize can remount it after the
      // visibility state was already computed, so reconcile its actual styles
      // as well as the cached visibility flag.
      if (aboutEarth && !aboutEarth.style.transition) {
        aboutEarth.style.transition = `opacity ${DESKTOP_FADE_MS}ms ease`;
      }

      if (heroVisible !== lastHeroVisible) {
        lastHeroVisible = heroVisible;
        setDesktopElementVisible(heroEarth, heroVisible, 1, 'hero');
      }
      if (
        aboutEarth &&
        (aboutVisible !== lastAboutVisible ||
          aboutEarth.style.opacity !== (aboutVisible ? '1' : '0') ||
          (aboutVisible && aboutEarth.style.visibility !== 'visible'))
      ) {
        lastAboutVisible = aboutVisible;
        setDesktopElementVisible(aboutEarth, aboutVisible, 1, 'about');
      }
      if (hudRef.current) hudRef.current.style.opacity = heroVisible ? '1' : '0';
      if (logoRef.current && logoVisible !== lastLogoVisible) {
        logoRef.current.style.opacity = logoVisible ? '1' : '0';
        lastLogoVisible = logoVisible;
      }
      setBackgroundVisible(scrollY < viewportHeight * 2);
    };

    const update = (nextScrollY: number) => {
      if (isMobile) updateMobile(nextScrollY);
      else updateDesktop(nextScrollY);
    };

    const onNativeScroll = () => update(window.scrollY);
    const onLenisScroll = (event: { scroll: number }) => update(event.scroll);
    const handleResize = () => {
      viewportHeight = window.innerHeight;
      const nextIsMobile = window.innerWidth < 1024;
      if (nextIsMobile !== isMobile) {
        isMobile = nextIsMobile;
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = null;
        firstMobileTick = true;
        currentY = 0;
        currentHud = 1;
        lastWrittenY = -9999;
        lastWrittenHud = -9999;
        lastHeroVisible = undefined;
        lastAboutVisible = undefined;
        lastLogoVisible = undefined;
      }
      if (isMobile) configureMobile();
      else configureDesktop();
      update(window.__lenis?.scroll ?? window.scrollY);
      // Responsive About content may mount/unmount during the same resize.
      requestAnimationFrame(() => update(window.__lenis?.scroll ?? window.scrollY));
    };

    if (isMobile) configureMobile();
    else configureDesktop();
    update(scrollY);
    requestAnimationFrame(() => update(window.__lenis?.scroll ?? window.scrollY));

    window.addEventListener('scroll', onNativeScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    const connectLenis = () => {
      const lenis = window.__lenis;
      if (!lenis || subscribedLenis) return;
      subscribedLenis = lenis;
      window.removeEventListener('scroll', onNativeScroll);
      lenis.on('scroll', onLenisScroll);
      update(lenis.scroll);
      if (lenisCheck) clearInterval(lenisCheck);
    };
    connectLenis();
    if (!subscribedLenis) {
      lenisCheck = setInterval(connectLenis, 100);
      lenisGiveUp = setTimeout(() => {
        if (lenisCheck) clearInterval(lenisCheck);
      }, 3000);
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (lenisCheck) clearInterval(lenisCheck);
      if (lenisGiveUp) clearTimeout(lenisGiveUp);
      if (heroHideTimer) clearTimeout(heroHideTimer);
      if (aboutHideTimer) clearTimeout(aboutHideTimer);
      if (subscribedLenis) subscribedLenis.off('scroll', onLenisScroll);
      window.removeEventListener('scroll', onNativeScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [aboutSectionRef, bgRef]);

  return { earthRef, aboutEarthRef, aboutSectionRef, hudRef, logoRef };
}
