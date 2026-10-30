"use strict";

// Decorative interactions stay separate from navigation and portfolio content.
(() => {
  const root = document.documentElement;
  const hero = document.querySelector(".hero");
  const canvas = document.querySelector(".ambient-canvas");
  const motionToggle = document.querySelector(".motion-toggle");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const resets = [];
  let userPaused = false;
  let heroVisible = false;
  let animationFrame = 0;
  let scrollFrame = 0;
  let lastPaint = 0;
  let elapsed = 0;
  let width = 0;
  let height = 0;
  let pointer = null;

  try {
    userPaused = localStorage.getItem("juan-portfolio-motion") === "paused";
  } catch {
    /* The pause control also works without persistent storage. */
  }

  const paused = () => reducedMotion.matches || userPaused;
  const pointerEnabled = () => finePointer.matches && !paused();
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

  // One animation frame per pointer update, with bounded movement and no scroll listener per card.
  function trackPointer(element, depth = false) {
    if (!element) return;
    let frame = 0;
    let clientX = 0;
    let clientY = 0;
    const properties = [
      "--pointer-x",
      "--pointer-y",
      "--depth-rx",
      "--depth-ry",
      "--depth-tx",
      "--depth-ty",
    ];
    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      element.classList.remove("is-pointer-active");
      properties.forEach((property) => element.style.removeProperty(property));
    }
    element.addEventListener(
      "pointermove",
      (event) => {
        if (!pointerEnabled() || event.pointerType === "touch") return;
        clientX = event.clientX;
        clientY = event.clientY;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (!pointerEnabled()) return reset();
          const rect = element.getBoundingClientRect();
          const x = clamp((clientX - rect.left) / rect.width, 0, 1);
          const y = clamp((clientY - rect.top) / rect.height, 0, 1);
          element.style.setProperty(
            "--pointer-x",
            `${(clientX - rect.left).toFixed(2)}px`,
          );
          element.style.setProperty(
            "--pointer-y",
            `${(clientY - rect.top).toFixed(2)}px`,
          );
          if (depth) {
            element.style.setProperty(
              "--depth-rx",
              `${((0.5 - y) * 8).toFixed(2)}deg`,
            );
            element.style.setProperty(
              "--depth-ry",
              `${((x - 0.5) * 10).toFixed(2)}deg`,
            );
            element.style.setProperty(
              "--depth-tx",
              `${((x - 0.5) * 15).toFixed(2)}px`,
            );
            element.style.setProperty(
              "--depth-ty",
              `${((y - 0.5) * 12).toFixed(2)}px`,
            );
          }
          element.classList.add("is-pointer-active");
        });
      },
      { passive: true },
    );
    element.addEventListener("pointerleave", reset);
    element.addEventListener("pointercancel", reset);
    resets.push(reset);
  }

  trackPointer(document.querySelector(".hero-visual"), true);
  trackPointer(document.querySelector(".contact-panel"), true);
  document
    .querySelectorAll(".project-card, .principles-card, .education-card")
    .forEach((card) => trackPointer(card));

  function updateReadingProgress() {
    scrollFrame = 0;
    const distance = root.scrollHeight - innerHeight;
    root.style.setProperty(
      "--reading-progress",
      distance > 0 ? clamp(scrollY / distance, 0, 1).toFixed(4) : "0",
    );
  }
  function scheduleProgress() {
    if (!scrollFrame && !document.hidden)
      scrollFrame = requestAnimationFrame(updateReadingProgress);
  }
  window.addEventListener("scroll", scheduleProgress, { passive: true });
  window.addEventListener("resize", scheduleProgress, { passive: true });
  // Filtering projects also changes the document's scrollable height.
  if ("ResizeObserver" in window)
    new ResizeObserver(scheduleProgress).observe(
      document.querySelector("main"),
    );
  updateReadingProgress();

  // A small, low-frequency canvas scene; it renders only while the hero is visible.
  const context = canvas.getContext("2d");
  const particles = Array.from({ length: 26 }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    speed: (Math.random() - 0.5) * 0.012,
    phase: Math.random() * Math.PI * 2,
    radius: index % 6 === 0 ? 2.4 : 1.4,
  }));

  function resizeCanvas() {
    if (!context) return;
    // CSS media preferences also change the canvas box; keep the control in sync.
    if (root.classList.contains("is-motion-paused") !== paused())
      updateMotion();
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
  }

  function draw(time) {
    animationFrame = 0;
    if (paused() || document.hidden || !heroVisible || !context) return;
    animationFrame = requestAnimationFrame(draw);
    if (lastPaint && time - lastPaint < 40) return;
    if (lastPaint) elapsed += Math.min((time - lastPaint) / 1000, 0.1);
    lastPaint = time;
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    const dark = root.dataset.theme === "dark";
    const green = dark ? "188, 225, 119" : "103, 135, 67";
    const purple = dark ? "181, 153, 224" : "143, 112, 192";
    const count = innerWidth < 701 ? 13 : particles.length;
    const reach = innerWidth < 701 ? 95 : 140;
    for (let i = 0; i < count; i++) {
      const particle = particles[i];
      particle.px = ((particle.x + elapsed * particle.speed + 10) % 1) * width;
      particle.py =
        (particle.y + Math.sin(elapsed * 0.25 + particle.phase) * 0.035) *
        height;
    }
    for (let i = 0; i < count; i++) {
      const particle = particles[i];
      for (let j = i + 1; j < count; j++) {
        const next = particles[j];
        const distance = Math.hypot(
          particle.px - next.px,
          particle.py - next.py,
        );
        if (distance >= reach) continue;
        context.strokeStyle = `rgba(${green}, ${(1 - distance / reach) * 0.22})`;
        context.lineWidth = 0.8;
        context.beginPath();
        context.moveTo(particle.px, particle.py);
        context.lineTo(next.px, next.py);
        context.stroke();
      }
      if (pointer) {
        const distance = Math.hypot(
          particle.px - pointer.x,
          particle.py - pointer.y,
        );
        if (distance < 170) {
          context.strokeStyle = `rgba(${purple}, ${(1 - distance / 170) * 0.3})`;
          context.beginPath();
          context.moveTo(pointer.x, pointer.y);
          context.lineTo(particle.px, particle.py);
          context.stroke();
        }
      }
      context.fillStyle = `rgba(${i % 3 === 0 ? purple : green}, ${0.35 + Math.sin(elapsed + particle.phase) * 0.12})`;
      context.beginPath();
      context.arc(particle.px, particle.py, particle.radius, 0, Math.PI * 2);
      context.fill();
    }
  }

  function reconcileCanvas() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    lastPaint = 0;
    if (!paused() && !document.hidden && heroVisible && context) {
      resizeCanvas();
      animationFrame = requestAnimationFrame(draw);
    }
  }

  function updateMotion() {
    const stopped = paused();
    root.classList.toggle("is-motion-paused", stopped);
    root.classList.toggle("has-pointer-effects", pointerEnabled());
    motionToggle.hidden = reducedMotion.matches;
    motionToggle.setAttribute("aria-pressed", String(stopped));
    const label = stopped ? "Reanudar animaciones" : "Pausar animaciones";
    motionToggle.setAttribute("aria-label", label);
    motionToggle.title = label;
    pointer = null;
    resets.forEach((reset) => reset());
    window.dispatchEvent(
      new CustomEvent("portfolio:motionchange", {
        detail: { paused: stopped },
      }),
    );
    reconcileCanvas();
  }

  motionToggle.addEventListener("click", () => {
    userPaused = !userPaused;
    try {
      localStorage.setItem(
        "juan-portfolio-motion",
        userPaused ? "paused" : "running",
      );
    } catch {
      /* Optional persistence. */
    }
    updateMotion();
  });
  reducedMotion.addEventListener("change", updateMotion);
  finePointer.addEventListener("change", updateMotion);

  // Pointer movement never starts a canvas loop by itself.
  hero.addEventListener(
    "pointermove",
    (event) => {
      if (!pointerEnabled() || event.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    },
    { passive: true },
  );
  hero.addEventListener("pointerleave", () => {
    pointer = null;
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0].isIntersecting;
        hero.classList.toggle("is-in-view", heroVisible);
        reconcileCanvas();
      },
      { threshold: 0.02 },
    ).observe(hero);
  }
  if ("ResizeObserver" in window)
    new ResizeObserver(resizeCanvas).observe(canvas);
  else window.addEventListener("resize", resizeCanvas, { passive: true });

  document.addEventListener("visibilitychange", () => {
    root.classList.toggle("is-page-hidden", document.hidden);
    if (document.hidden) resets.forEach((reset) => reset());
    else scheduleProgress();
    reconcileCanvas();
  });
  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(animationFrame);
    cancelAnimationFrame(scrollFrame);
    resets.forEach((reset) => reset());
  });
  window.addEventListener("pageshow", () => {
    scheduleProgress();
    reconcileCanvas();
  });

  root.classList.add("fx-ready");
  updateMotion();
})();
