document.addEventListener("DOMContentLoaded", () => {
  // -------------------------
  // Elements
  // -------------------------
  const hero = document.querySelector(".hero");
  const bg = document.querySelector(".hero-bg");
  const spotlight = document.querySelector(".spotlight");

  const turntable = document.querySelector(".hotspot-turntable");
  const whiskey = document.querySelector(".hotspot-whiskey");

  // -------------------------
  // Helpers
  // -------------------------
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const setHot = (el, isHot) => {
    if (!el) return;
    el.classList.toggle("is-hot", isHot);
  };

  const go = (url) => {
    // Hard navigation (works reliably even if SPA-ish things appear later)
    window.location.assign(url);
  };

  // -------------------------
  // Hotspot UX: hover/focus + long-press glow (mobile)
  // -------------------------
  [turntable, whiskey].forEach((el) => {
    if (!el) return;

    el.addEventListener("focus", () => setHot(el, true));
    el.addEventListener("blur", () => setHot(el, false));
    el.addEventListener("mouseenter", () => setHot(el, true));
    el.addEventListener("mouseleave", () => setHot(el, false));

    // Long-press glow (pointer-based, works on mobile + pen)
    let pressTimer = null;
    let pressed = false;

    const clearPress = () => {
      if (pressTimer) window.clearTimeout(pressTimer);
      pressTimer = null;
      pressed = false;
      setHot(el, false);
    };

    el.addEventListener(
      "pointerdown",
      (e) => {
        // Only primary button for mouse
        if (e.pointerType === "mouse" && e.button !== 0) return;

        pressed = true;
        pressTimer = window.setTimeout(() => {
          if (pressed) setHot(el, true);
        }, 220);
      },
      { passive: true }
    );

    el.addEventListener("pointerup", clearPress, { passive: true });
    el.addEventListener("pointercancel", clearPress, { passive: true });
    el.addEventListener("pointerleave", clearPress, { passive: true });

    // If user moves finger significantly, don't treat it as long-press
    el.addEventListener(
      "pointermove",
      () => {
        if (pressTimer) {
          window.clearTimeout(pressTimer);
          pressTimer = null;
        }
      },
      { passive: true }
    );
  });

  // -------------------------
  // Click routes (Option A)
  // -------------------------
  if (turntable) {
    turntable.addEventListener("click", () => {
      go("https://media-management-system.onrender.com/catalog/");
    });
  }

  if (whiskey) {
    whiskey.addEventListener("click", () => {
      go("/whiskey/");
    });
  }

  // -------------------------
  // Spotlight follow (desktop)
  // -------------------------
  const updateSpotlight = (clientX, clientY) => {
    if (!hero || !spotlight) return;
    const rect = hero.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    spotlight.style.setProperty("--sx", `${clamp(x, 0, 100)}%`);
    spotlight.style.setProperty("--sy", `${clamp(y, 0, 100)}%`);
  };

  if (hero && spotlight) {
    hero.addEventListener("mouseenter", () => (spotlight.style.opacity = "1"));
    hero.addEventListener("mouseleave", () => (spotlight.style.opacity = "0"));
    hero.addEventListener("mousemove", (e) => updateSpotlight(e.clientX, e.clientY));
  }

  // -------------------------
  // Background pan (subtle parallax)
  // -------------------------
  let panX = 0;
  let panY = 0;

  const setPan = (x, y) => {
    panX = x;
    panY = y;
    if (!bg) return;
    bg.style.setProperty("--pan-x", `${panX}px`);
    bg.style.setProperty("--pan-y", `${panY}px`);
  };

  // Desktop parallax
  if (hero && bg) {
    hero.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      setPan(clamp(nx * 14, -14, 14), clamp(ny * 10, -10, 10));
    });
  }
});
