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
