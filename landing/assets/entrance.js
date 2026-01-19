document.addEventListener("DOMContentLoaded", () => {
  const turntable = document.querySelector(".hotspot-turntable");
  const whiskey = document.querySelector(".hotspot-whiskey");

  const setHot = (el, isHot) => {
    if (!el) return;
    el.classList.toggle("is-hot", isHot);
  };

  // Desktop hover: handled by CSS, but we keep focus/keyboard friendly
  [turntable, whiskey].forEach((el) => {
    if (!el) return;
    el.addEventListener("focus", () => setHot(el, true));
    el.addEventListener("blur", () => setHot(el, false));
  });

  // Mobile long-press: touchstart -> highlight, touchend/cancel -> unhighlight
  const bindLongPress = (el) => {
    if (!el) return;

    let pressTimer = null;

    el.addEventListener("touchstart", () => {
      pressTimer = window.setTimeout(() => setHot(el, true), 200);
    }, { passive: true });

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

  // Click routes (works for desktop + tap)
  if (turntable) turntable.addEventListener("click", () => (window.location.href = "/music"));
  if (whiskey) whiskey.addEventListener("click", () => (window.location.href = "/whiskey"));
});
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

    el.addEventListener("touchstart", () => {
      pressTimer = window.setTimeout(() => setHot(el, true), 200);
    }, { passive: true });

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

  if (turntable) turntable.addEventListener("click", () => (window.location.href = "/music"));
  if (whiskey) whiskey.addEventListener("click", () => (window.location.href = "/whiskey"));

  // -------------------------
  // Ambient audio
  // -------------------------
  const audio = new Audio("./assets/ambient.mp3");
  audio.loop = true;
  audio.volume = 0.18;

  const toggle = document.querySelector(".audio-toggle");
  let enabled = localStorage.getItem("saloon-audio") === "on";

  const updateIcon = () => {
    toggle.textContent = enabled ? "🔊" : "🔈";
  };

  const startAudio = () => {
    if (enabled && audio.paused) {
      audio.play().catch(() => {});
    }
  };

  updateIcon();

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    enabled = !enabled;
    localStorage.setItem("saloon-audio", enabled ? "on" : "off");

    if (enabled) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }

    updateIcon();
  });

  // Start audio on first interaction (mobile-safe)
  const unlock = () => {
    startAudio();
    document.removeEventListener("click", unlock);
    document.removeEventListener("touchstart", unlock);
  };

  document.addEventListener("click", unlock);
  document.addEventListener("touchstart", unlock);
});
