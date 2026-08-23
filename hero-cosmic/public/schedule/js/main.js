import { init as initStarfield } from './background/starfield.js?v=4';
import { init as initScroll } from './scroll/scroll-controller.js?v=5';
import { init as initTransition } from './transition/details-transition.js?v=4';
import { init as initDynamicIsland } from './scroll/dynamic-island.js?v=5';

// Top-level orchestration
function bootstrap() {
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Initialize subsystems
  initStarfield();
  initScroll();
  initTransition();
  initDynamicIsland();

  // Initialize Lenis Smooth Scrolling
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
    
    window.lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

