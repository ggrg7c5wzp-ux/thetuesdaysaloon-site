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

  // -------------------------
  // Hotspot UX: hover/focus + long-press glow (mobile)
  // Also: stopPropagation so hero drag doesn't steal clicks
  // -------------------------
  [turntable, whiskey].forEach((el) => {
    if (!el) return;

    el.addEventListener("focus", () => setHot(el, true));
    el.addEventListener("blur", () => setHot(el, false));
    el.addEventListener("mouseenter", () => setHot(el, true));
    el.addEventListener("mouseleave", () => setHot(el, false));

    // Long press (pointer-based, works on mobile + pen)
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
        // ✅ prevent hero pointerdown from ever seeing this
        e.stopPropagation();

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

    el.addEventListener(
      "pointermove",
      () => {
        // If user starts moving finger, don't treat as long-press
        if (pressTimer) {
          window.clearTimeout(pressTimer);
          pressTimer = null;
        }
      },
      { passive: true }
    );
  });

  // -------------------------
  // Click routes
  // -------------------------
  if (turntable) {
    turntable.addEventListener("click", () => {
      window.location.href = "https://media-management-system.onrender.com/catalog/";
    });
  }

  if (whiskey) {
    whiskey.addEventListener("click", () => {
      window.location.href = "/whiskey";
    });
  }

  // -------------------------
  // Spotlight follow (no dragging logic here)
  // -------------------------
  const updateSpotlight = (clientX, clientY) => {
    if (!hero || !spotlight) return;
    const rect = hero.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    spotlight.style.setProperty("--sx", `${x}%`);
    spotlight.style.setProperty("--sy", `${y}%`);
  };

  if (hero && spotlight) {
    hero.addEventListener("mousemove", (e) => updateSpotlight(e.clientX, e.clientY));
    hero.addEventListener("pointermove", (e) => updateSpotlight(e.clientX, e.clientY), {
      passive: true,
    });
  }

  // -------------------------
  // Cinematic pan (desktop parallax + mobile drag)
  // -------------------------
  if (hero && bg) {
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;

    // Limits (mutate on resize)
    let PAN_MAX_X = isPortrait ? 40 : 18;
    let PAN_MAX_Y = 8;

    // Base framing (single source of truth)
    let BASE_PAN_X = isPortrait ? 26 : 0;
    let BASE_PAN_Y = 0;

    let panX = BASE_PAN_X;
    let panY = BASE_PAN_Y;

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startPanX = 0;
    let startPanY = 0;

    const applyPan = () => {
      hero.style.setProperty("--pan-x", `${panX}px`);
      hero.style.setProperty("--pan-y", `${panY}px`);
    };

    // Desktop parallax
    const parallaxFromPointer = (clientX, clientY) => {
      if (dragging) return;

      const rect = hero.getBoundingClientRect();
      const nx = (clientX - rect.left) / rect.width; // 0..1
      const ny = (clientY - rect.top) / rect.height;

      const dx = (nx - 0.5) * 2; // -1..1
      const dy = (ny - 0.5) * 2;

      const driftX = clamp(dx * -PAN_MAX_X * 0.35, -PAN_MAX_X, PAN_MAX_X);
      const driftY = clamp(dy * -PAN_MAX_Y * 0.45, -PAN_MAX_Y, PAN_MAX_Y);

      panX = clamp(BASE_PAN_X + driftX, -PAN_MAX_X, PAN_MAX_X);
      panY = clamp(driftY, -PAN_MAX_Y, PAN_MAX_Y);
      applyPan();
    };

    hero.addEventListener("mousemove", (e) => parallaxFromPointer(e.clientX, e.clientY));
    hero.addEventListener(
      "pointermove",
      (e) => parallaxFromPointer(e.clientX, e.clientY),
      { passive: true }
    );

    hero.addEventListener("pointerdown", (e) => {
      // ✅ Never start drag if user pressed a hotspot
      if (e.target.closest(".hotspot")) return;

      if (e.pointerType === "mouse" && e.button !== 0) return;

      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startPanX = panX;
      startPanY = panY;

      hero.setPointerCapture?.(e.pointerId);
      bg.style.transition = "none";
    });

    const endDrag = () => {
      dragging = false;
      bg.style.transition = "";
    };

    hero.addEventListener("pointerup", endDrag, { passive: true });
    hero.addEventListener("pointercancel", endDrag, { passive: true });

    hero.addEventListener(
      "pointermove",
      (e) => {
        if (!dragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        panX = clamp(startPanX + dx * -0.45, -PAN_MAX_X, PAN_MAX_X);
        panY = clamp(startPanY + dy * -0.15, -PAN_MAX_Y, PAN_MAX_Y);
        applyPan();
      },
      { passive: true }
    );

    // Initialize
    applyPan();

    // Resize/orientation
    window.addEventListener(
      "resize",
      () => {
        const portraitNow = window.matchMedia("(orientation: portrait)").matches;

        PAN_MAX_X = portraitNow ? 40 : 18;
        PAN_MAX_Y = 8;

        BASE_PAN_X = portraitNow ? 26 : 0;
        BASE_PAN_Y = 0;

        panX = BASE_PAN_X;
        panY = BASE_PAN_Y;
        applyPan();
      },
      { passive: true }
    );
  }

  // -------------------------
  // Ambient audio (autoplay-safe)
  // -------------------------
  const toggle = document.querySelector(".audio-toggle");
  if (!toggle) return;

  let audio = null;
  try {
    audio = new Audio("assets/ambient.mp3");
    audio.loop = true;
    audio.volume = 0.18;
  } catch (e) {
    console.warn("Audio init failed:", e);
  }

  let enabled = localStorage.getItem("saloon-audio") === "on";

  const updateIcon = () => {
    toggle.textContent = enabled ? "🔊" : "🔈";
  };

  const tryPlay = () => {
    if (!audio) return;
    audio.play().catch(() => {});
  };

  updateIcon();

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    enabled = !enabled;
    localStorage.setItem("saloon-audio", enabled ? "on" : "off");

    if (enabled) tryPlay();
    else if (audio) audio.pause();

    updateIcon();
  });

  const unlock = () => {
    if (enabled) tryPlay();
    document.removeEventListener("click", unlock);
    document.removeEventListener("touchstart", unlock);
    document.removeEventListener("keydown", unlock);
  };

  document.addEventListener("click", unlock);
  document.addEventListener("touchstart", unlock, { passive: true });
  document.addEventListener("keydown", unlock);
});
