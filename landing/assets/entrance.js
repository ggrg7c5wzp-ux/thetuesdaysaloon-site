document.addEventListener("DOMContentLoaded", () => {
  const turntable = document.querySelector(".hotspot-turntable");
  const whiskey = document.querySelector(".hotspot-whiskey");

  if (turntable) turntable.addEventListener("click", () => {
    window.location.href = "/music";
  });

  if (whiskey) whiskey.addEventListener("click", () => {
    window.location.href = "/whiskey";
  });
});
