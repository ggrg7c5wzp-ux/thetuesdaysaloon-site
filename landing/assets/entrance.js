document.addEventListener("DOMContentLoaded", () => {
  // -------------------------
  // Hotspots
  // -------------------------
  const turntable = document.querySelector(".hotspot-turntable");
  const whiskey = document.querySelector(".hotspot-whiskey");

  const setHot = (el, isHot) => {
    if (!el) return;
    el.classList.toggle("is-hot", isHot);
  };

  [turntable, whiskey].forEach((el) => {
    if (!el) return;
    el.addEventListener("focus", () => setHot(el, true));
    el.addEventListener("blur", () => setHot(el, false));
  });

  const bindLongPress = (el) => {
    if (!el) return;
    let pressTimer = null;

    el.addEventListener(
      "touchstart",
      () => {
        pressTimer = window.setTimeout(() => setHot(el, true), 200);
      },
      { passive: true }
    );

    const clear = () => {
      if (pressTimer) window.clearTimeout(pressTimer);
      pressTimer = null;
      setHot(el, false);
    };

    el.addEventListener("touchend", clear);
    el.addEventListener("touchcancel", clear);
  };

  bindLongPress(turntable);
  bindLongPress(whiskey);

  // NOTE: keep as-is for now; these will 404 until you add routes/pages
  if (turntable) turntable.addEventListener("click", () => (window.location.href = "https://media-management-system.onrender.com/catalog/"));
  if (whiskey) whiskey.addEventListener("click", () => (window.location.href = "/whiskey"));

  // -------------------------
  // Spotlight follow (mouse + touch)
  // -------------------------
const hero = document.querySelector(".hero");
const spotlight = document.querySelector(".spotlight");

if (hero && spotlight) {
  hero.classList.add("js-active");
    const updateSpotlight = (clientX, clientY) => {
      const rect = hero.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      spotlight.style.setProperty("--sx", `${x}%`);
      spotlight.style.setProperty("--sy", `${y}%`);
      spotlight.style.opacity = "0.55"; // helps if CSS relies on :hover
    };
  // -------------------------
  // Cinematic pan (desktop parallax + mobile drag)
  // -------------------------
  const bg = document.querySelector(".hero-bg");

  if (hero && bg) {
    // Clamp helper
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    // These are the max pan offsets in pixels.
    // Bigger = more ability to slide the scene in portrait.
    const PAN_MAX_X = 90;
    const PAN_MAX_Y = 40;

    // Current pan
    let panX = 0;
    let panY = 0;

    // Drag state
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startPanX = 0;
    let startPanY = 0;

    const applyPan = () => {
      hero.style.setProperty("--pan-x", `${panX}px`);
      hero.style.setProperty("--pan-y", `${panY}px`);
    };

    // Desktop parallax (mouse/pointer move)
    const parallaxFromPointer = (clientX, clientY) => {
      const rect = hero.getBoundingClientRect();
      const nx = (clientX - rect.left) / rect.width;  // 0..1
      const ny = (clientY - rect.top) / rect.height;  // 0..1

      // Convert to -1..1
      const dx = (nx - 0.5) * 2;
      const dy = (ny - 0.5) * 2;

      // Only apply if not dragging (mobile)
      if (!dragging) {
        panX = clamp(dx * -PAN_MAX_X, -PAN_MAX_X, PAN_MAX_X);
        panY = clamp(dy * -PAN_MAX_Y, -PAN_MAX_Y, PAN_MAX_Y);
        applyPan();
      }
    };

    hero.addEventListener("mousemove", (e) => parallaxFromPointer(e.clientX, e.clientY));
    hero.addEventListener("pointermove", (e) => parallaxFromPointer(e.clientX, e.clientY), { passive: true });

    // Mobile/Touch drag-to-pan
    hero.addEventListener("pointerdown", (e) => {
      // Ignore right click, etc.
      if (e.pointerType === "mouse" && e.button !== 0) return;

      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startPanX = panX;
      startPanY = panY;

      // Captures pointer so drag continues even if finger drifts
      hero.setPointerCapture?.(e.pointerId);
      bg.style.transition = "none";
    });

    hero.addEventListener("pointerup", () => {
      dragging = false;
      bg.style.transition = "";
    });

    hero.addEventListener("pointercancel", () => {
      dragging = false;
      bg.style.transition = "";
    });

    hero.addEventListener("pointermove", (e) => {
      if (!dragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // Drag direction feels natural if we invert X (like moving a camera window)
      panX = clamp(startPanX + dx * 0.35, -PAN_MAX_X, PAN_MAX_X);
      panY = clamp(startPanY + dy * 0.20, -PAN_MAX_Y, PAN_MAX_Y);
      applyPan();
    }, { passive: true });

    // Initialize
    applyPan();
  }

    hero.addEventListener("mousemove", (e) => updateSpotlight(e.clientX, e.clientY));

    hero.addEventListener(
      "pointermove",
      (e) => updateSpotlight(e.clientX, e.clientY),
      { passive: true }
    );

    hero.addEventListener(
      "pointerdown",
      (e) => updateSpotlight(e.clientX, e.clientY),
      { passive: true }
    );
  }

  // -------------------------
  // Subtle flicker (safe)
  // -------------------------
  // Your HTML uses .flicker-overlay (not .flicker)
  const flicker = document.querySelector(".flicker-overlay");
  if (flicker) {
    setInterval(() => {
      if (Math.random() < 0.10) {
        flicker.classList.add("is-flickering");
        setTimeout(() => flicker.classList.remove("is-flickering"), 120);
      }
    }, 600);
  }

  // -------------------------
  // Ambient audio (autoplay-safe + failure-safe)
  // -------------------------
  const toggle = document.querySelector(".audio-toggle");
  if (!toggle) return; // if the button isn't in the HTML, don't crash

  let audio = null;
  try {
    audio = new Audio("assets/ambient.mp3"); // relative path, no leading slash
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

  // Start audio on first interaction (mobile + autoplay rules)
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
