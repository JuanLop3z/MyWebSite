"use strict";

// A reversible visual experiment: elements never leave their original DOM positions.
(() => {
  const root = document.documentElement;
  const lab = document.querySelector(".shake-lab");
  const toggle = lab.querySelector(".shake-toggle");
  const panel = lab.querySelector(".shake-panel");
  const sensorButton = lab.querySelector("[data-shake-enable]");
  const demoButton = lab.querySelector("[data-shake-demo]");
  const status = lab.querySelector(".shake-status");
  const runtime = document.querySelector(".shake-runtime");
  const stage = runtime.querySelector(".shake-stage");
  const restoreButton = runtime.querySelector(".shake-restore");
  const phase = runtime.querySelector("[data-shake-phase]");
  const count = runtime.querySelector("[data-shake-count]");
  const progress = runtime.querySelector("[data-shake-progress]");
  const announcement = document.querySelector(".shake-announcement");
  const mobile = window.matchMedia("(max-width: 1024px) and (pointer: coarse)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const supportsAnimation = typeof Element.prototype.animate === "function";
  const supportsSensor =
    window.isSecureContext && typeof window.DeviceMotionEvent !== "undefined";
  const content = [
    ...document.querySelectorAll(
      ".skip-link, .site-header, main, .site-footer",
    ),
  ];
  const main = document.querySelector("main");
  const animations = new Set();
  let enabled = false;
  let listening = false;
  let pendingPermission = false;
  let busy = false;
  let generation = 0;
  let cooldownUntil = 0;
  let lastSample = null;
  let peaks = [];
  let lastPeak = 0;
  let sensorTimer = 0;
  let safetyTimer = 0;
  let focusBefore = null;
  let scrollBefore = { x: 0, y: 0 };
  let inertBefore = [];
  let busyBefore = null;

  const motionPaused = () =>
    reduced.matches || root.classList.contains("is-motion-paused");
  const available = () => mobile.matches && supportsAnimation;
  const mayListen = () =>
    enabled && available() && !motionPaused() && !document.hidden;
  const announce = (message) => {
    announcement.textContent = message;
  };
  function preventScrolling(event) {
    if (event.cancelable) event.preventDefault();
  }

  function closePanel(returnFocus = false) {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    if (returnFocus && !lab.hidden) toggle.focus({ preventScroll: true });
  }

  function resetSamples() {
    lastSample = null;
    peaks = [];
    lastPeak = 0;
  }

  function syncSensor() {
    const active = mayListen();
    if (active && !listening) {
      window.addEventListener("devicemotion", onMotion, { passive: true });
      listening = true;
      resetSamples();
      clearTimeout(sensorTimer);
      sensorTimer = setTimeout(() => {
        if (listening && !lastSample)
          status.textContent =
            "Aún no recibo movimiento. También puedes usar Probar efecto.";
      }, 5000);
    } else if (!active && listening) {
      window.removeEventListener("devicemotion", onMotion);
      listening = false;
      clearTimeout(sensorTimer);
      resetSamples();
    }
  }

  function updateControls(message) {
    lab.hidden = !available() || busy;
    announcement.hidden = !available();
    sensorButton.disabled =
      !supportsSensor || motionPaused() || pendingPermission || busy;
    demoButton.disabled = motionPaused() || busy;
    sensorButton.setAttribute("aria-pressed", String(enabled));
    sensorButton.textContent = pendingPermission
      ? "Activando…"
      : enabled
        ? "Desactivar sensor"
        : "Activar al agitar";
    if (!available()) closePanel();
    if (message) status.textContent = message;
    else if (reduced.matches)
      status.textContent =
        "Tu preferencia de movimiento reducido mantiene este experimento desactivado.";
    else if (motionPaused())
      status.textContent =
        "Reanuda las animaciones en la cabecera para probar el experimento.";
    else if (!supportsSensor)
      status.textContent =
        "Este navegador no ofrece el sensor. Puedes usar Probar efecto.";
    else
      status.textContent = enabled
        ? "Sensor activo. Agita el móvil para desarmar la página."
        : "El sensor se activa solo si tú lo eliges.";
    syncSensor();
  }

  async function enableSensor() {
    if (!available() || motionPaused() || pendingPermission || busy) return;
    if (enabled) {
      enabled = false;
      updateControls(
        "Sensor desactivado. Puedes volver a activarlo cuando quieras.",
      );
      return;
    }
    pendingPermission = true;
    updateControls(
      "Activa el permiso de movimiento si el navegador lo solicita.",
    );
    let message;
    try {
      const Motion = window.DeviceMotionEvent;
      const permission =
        typeof Motion.requestPermission === "function"
          ? await Motion.requestPermission()
          : "granted";
      if (permission === "granted" && available() && !motionPaused())
        enabled = true;
      else message = "El movimiento no se activó. Puedes usar Probar efecto.";
    } catch {
      message = "No se pudo activar el movimiento. Puedes usar Probar efecto.";
    } finally {
      pendingPermission = false;
      updateControls(message);
    }
  }

  function vector(value) {
    return value && [value.x, value.y, value.z].every(Number.isFinite)
      ? value
      : null;
  }

  function onMotion(event) {
    if (!mayListen() || busy || performance.now() < cooldownUntil) return;
    const acceleration =
      vector(event.acceleration) || vector(event.accelerationIncludingGravity);
    if (!acceleration) return;
    const now = performance.now();
    if (lastSample && now - lastSample.time < 60) return;
    const previous = lastSample;
    lastSample = {
      x: acceleration.x,
      y: acceleration.y,
      z: acceleration.z,
      time: now,
    };
    clearTimeout(sensorTimer);
    if (!previous || now - previous.time > 500) {
      peaks = [];
      return;
    }
    const change = Math.hypot(
      acceleration.x - previous.x,
      acceleration.y - previous.y,
      acceleration.z - previous.z,
    );
    peaks = peaks.filter((time) => now - time < 900);
    if (change >= 14 && now - lastPeak >= 110) {
      peaks.push(now);
      lastPeak = now;
      if (peaks.length >= 3) {
        resetSamples();
        play();
      }
    }
  }

  function visiblePieces(viewport) {
    const selectors = [
      ".site-header",
      ".hero-copy > *",
      ".code-window",
      ".floating-note",
      ".floating-token",
      ".visual-caption",
      ".hero-bottom",
      ".tech-ribbon",
      "main .section-heading",
      ".about-story",
      ".principles-card",
      ".impact-grid",
      ".career-entry",
      ".education-card",
      ".project-toolbar",
      ".project-card",
      ".projects-bottom",
      ".stack-group",
      ".contact-panel",
      ".footer-inner",
    ];
    const candidates = [...document.querySelectorAll(selectors.join(","))];
    return candidates
      .filter(
        (element) =>
          !candidates.some(
            (other) => other !== element && other.contains(element),
          ),
      )
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          rect.width > 10 &&
          rect.height > 10 &&
          rect.bottom > 0 &&
          rect.top < viewport.height &&
          rect.right > 0 &&
          rect.left < viewport.width &&
          style.visibility !== "hidden" &&
          style.display !== "none"
        );
      })
      .slice(0, 22)
      .map((element) => {
        element.classList.remove("is-waiting");
        const style = getComputedStyle(element);
        return {
          element,
          rect: element.getBoundingClientRect(),
          base: style.transform === "none" ? "" : style.transform,
          opacity: style.opacity,
          slot: null,
        };
      });
  }

  function animate(piece, frames, options) {
    const animation = piece.element.animate(frames, {
      ...options,
      fill: "both",
    });
    animations.add(animation);
    return animation.finished.catch(() => {});
  }

  function restore(message = "Página reconstruida. Todo sigue en su sitio.") {
    if (!busy) return;
    generation += 1;
    clearTimeout(safetyTimer);
    document.removeEventListener("touchmove", preventScrolling);
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    content.forEach((element, index) => {
      element.inert = inertBefore[index];
    });
    if (busyBefore === null) main.removeAttribute("aria-busy");
    else main.setAttribute("aria-busy", busyBefore);
    window.scrollTo(scrollBefore.x, scrollBefore.y);
    root.classList.remove("is-shake-playing");
    stage.classList.remove("is-rebuilding");
    stage.replaceChildren();
    runtime.hidden = true;
    root.style.removeProperty("--shake-width");
    root.style.removeProperty("--shake-height");
    busy = false;
    resetSamples();
    window.dispatchEvent(
      new CustomEvent("portfolio:shakechange", { detail: { active: false } }),
    );
    updateControls(message);
    announce(message);
    if (
      focusBefore &&
      focusBefore !== document.body &&
      focusBefore.isConnected
    ) {
      const rect = focusBefore.getBoundingClientRect();
      (rect.width && rect.height ? focusBefore : toggle).focus({
        preventScroll: true,
      });
    }
  }

  async function play() {
    if (busy || !available() || motionPaused() || document.hidden) return;
    const menu = document.querySelector(".menu-toggle");
    if (menu.getAttribute("aria-expanded") === "true") menu.click();
    focusBefore = document.activeElement;
    closePanel();
    scrollBefore = { x: scrollX, y: scrollY };
    const viewport = {
      width: window.visualViewport?.width || root.clientWidth,
      height: window.visualViewport?.height || innerHeight,
    };
    root.style.setProperty("--shake-width", `${viewport.width}px`);
    root.style.setProperty("--shake-height", `${viewport.height}px`);
    busyBefore = main.getAttribute("aria-busy");
    inertBefore = content.map((element) => element.inert);
    busy = true;
    const token = ++generation;
    cooldownUntil = performance.now() + 8000;
    root.classList.add("is-shake-playing");
    window.dispatchEvent(
      new CustomEvent("portfolio:shakechange", { detail: { active: true } }),
    );
    content.forEach((element) => {
      element.inert = true;
    });
    main.setAttribute("aria-busy", "true");
    updateControls();
    runtime.hidden = false;
    phase.textContent = "Desarmando la página…";
    count.textContent = "Todo volverá a su sitio.";
    progress.style.transform = "scaleX(0)";
    announce("La página se desarma y volverá a reconstruirse.");
    restoreButton.focus({ preventScroll: true });
    safetyTimer = setTimeout(() => restore("Página restaurada."), 7500);
    document.addEventListener("touchmove", preventScrolling, {
      passive: false,
    });
    try {
      const pieces = visiblePieces(viewport);
      if (!pieces.length) return;
      pieces.forEach((piece) => {
        const slot = document.createElement("span");
        slot.className = "shake-slot";
        const top = Math.max(0, piece.rect.top);
        const left = Math.max(0, piece.rect.left);
        Object.assign(slot.style, {
          top: `${top}px`,
          left: `${left}px`,
          width: `${Math.min(viewport.width, piece.rect.right) - left}px`,
          height: `${Math.min(viewport.height, piece.rect.bottom) - top}px`,
        });
        stage.append(slot);
        piece.slot = slot;
      });
      const falling = [...pieces].sort((a, b) => b.rect.top - a.rect.top);
      await Promise.all(
        falling.map((piece, index) => {
          const x = (Math.random() - 0.5) * 150;
          const y = viewport.height - piece.rect.top + piece.rect.height + 80;
          const turn = (Math.random() - 0.5) * 65;
          return animate(
            piece,
            [
              {
                transform: `${piece.base} translate3d(0,0,0) rotate(0deg)`,
                opacity: piece.opacity,
                offset: 0,
              },
              {
                transform: `${piece.base} translate3d(${x * 0.08}px,-8px,0) rotate(${turn * 0.08}deg)`,
                opacity: piece.opacity,
                offset: 0.16,
              },
              {
                transform: `${piece.base} translate3d(${x}px,${y}px,0) rotate(${turn}deg)`,
                opacity: 0,
                offset: 1,
              },
            ],
            {
              duration: 780,
              delay: index * 25,
              easing: "cubic-bezier(.5,.02,.9,.5)",
            },
          );
        }),
      );
      if (token !== generation) return;
      stage.classList.add("is-rebuilding");
      phase.textContent = "Reconstruyendo…";
      count.textContent = `0 / ${pieces.length} piezas`;
      announce("Reconstruyendo la página, pieza por pieza.");
      const ordered = [...pieces].sort(
        (a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left,
      );
      let completed = 0;
      await Promise.all(
        ordered.map(async (piece, index) => {
          await animate(
            piece,
            [
              {
                transform: `${piece.base} translate3d(0,55px,0) scale(.92)`,
                opacity: 0,
              },
              {
                transform: `${piece.base} translate3d(0,-3px,0) scale(1.015)`,
                opacity: piece.opacity,
                offset: 0.75,
              },
              {
                transform: `${piece.base} translate3d(0,0,0) scale(1)`,
                opacity: piece.opacity,
              },
            ],
            {
              duration: 580,
              delay: 220 + index * 90,
              easing: "cubic-bezier(.2,.7,.3,1)",
            },
          );
          if (token !== generation) return;
          piece.slot.classList.add("is-rebuilt");
          completed += 1;
          count.textContent = `${completed} / ${pieces.length} piezas`;
          progress.style.transform = `scaleX(${completed / pieces.length})`;
        }),
      );
    } catch {
      // The finally block restores all original state if an animation is unavailable.
    } finally {
      if (token === generation) restore();
    }
  }

  toggle.addEventListener("click", () => {
    const open = panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  });
  sensorButton.addEventListener("click", enableSensor);
  demoButton.addEventListener("click", play);
  restoreButton.addEventListener("click", () =>
    restore("Página restaurada al instante."),
  );
  document.addEventListener("pointerdown", (event) => {
    if (!lab.contains(event.target)) closePanel();
  });
  document.addEventListener("keydown", (event) => {
    if (busy && event.key === "Tab") {
      event.preventDefault();
      restoreButton.focus({ preventScroll: true });
      return;
    }
    if (event.key !== "Escape") return;
    if (busy) {
      event.preventDefault();
      restore("Página restaurada al instante.");
    } else if (!panel.hidden) closePanel(true);
  });
  function environmentChanged() {
    if (busy) restore("Página restaurada para adaptar la vista.");
    if (!available()) enabled = false;
    updateControls();
  }
  window.addEventListener("resize", environmentChanged, { passive: true });
  mobile.addEventListener("change", environmentChanged);
  reduced.addEventListener("change", environmentChanged);
  window.addEventListener("portfolio:motionchange", (event) => {
    if (event.detail.paused && busy)
      restore("Página restaurada. Animaciones pausadas.");
    updateControls();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && busy) restore("Página restaurada.");
    syncSensor();
  });
  window.addEventListener("pagehide", () => {
    if (busy) restore("Página restaurada.");
    window.removeEventListener("devicemotion", onMotion);
    listening = false;
    clearTimeout(sensorTimer);
  });
  window.addEventListener("pageshow", () => updateControls());
  updateControls();
})();
