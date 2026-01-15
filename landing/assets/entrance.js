document.addEventListener("DOMContentLoaded", () => {
  const sign = document.getElementById("signWrap");
  const loreHint = document.getElementById("loreHint");
  const music = document.getElementById("musicHotspot");
  const whiskey = document.getElementById("whiskeyHotspot");
  const labels = document.getElementById("labels");
  const sr = document.getElementById("srStatus");

  const goMusic = () => (window.location.href = "/music");
  const goWhiskey = () => (window.location.href = "/whiskey");

  // Neon hover vibe
  sign.addEventListener("mouseenter", () => sign.classList.add("active"));
  sign.addEventListener("mouseleave", () => sign.classList.remove("active"));

  // “Linger” reveal after a moment
  const reveal = () => {
    music.hidden = false;
    whiskey.hidden = false;
    labels.hidden = false;
    sign.classList.add("ready");
    if (sr) sr.textContent = "Choose a path: Music on the left, Whiskey on the right.";
  };

  // Reveal after 1.2 seconds on load (works on mobile too)
  setTimeout(reveal, 1200);

  // Clicking halves
  music?.addEventListener("click", goMusic);
  whiskey?.addEventListener("click", goWhiskey);

  // Optional: long-press hint (mobile)
  let pressTimer = null;
  sign.addEventListener("touchstart", () => {
    pressTimer = setTimeout(() => {
      loreHint && (loreHint.textContent = "choose…");
      sign.classList.add("active");
    }, 450);
  }, { passive: true });

  sign.addEventListener("touchend", () => {
    if (pressTimer) clearTimeout(pressTimer);
    pressTimer = null;
  });

  // Keyboard accessibility
  sign.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goMusic();
    if (e.key === "ArrowRight") goWhiskey();
  });
  sign.tabIndex = 0;
});
