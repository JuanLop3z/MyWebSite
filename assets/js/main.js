"use strict";

(() => {
  const root = document.documentElement;
  root.classList.add("js-enabled");
  const themeToggle = document.querySelector(".theme-toggle");
  const themePreference = window.matchMedia("(prefers-color-scheme: dark)");
  const motionPreference = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  let savedTheme = null;

  // Storage may be unavailable in private browsing or when opening a local file.
  try {
    const value = localStorage.getItem("juan-portfolio-theme");
    if (value === "light" || value === "dark") savedTheme = value;
  } catch {
    /* The theme still works for this visit. */
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    const dark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(dark));
    themeToggle.setAttribute(
      "aria-label",
      `Activar tema ${dark ? "claro" : "oscuro"}`,
    );
    document.querySelector('meta[name="theme-color"]').content = dark
      ? "#161b18"
      : "#f7f8f2";
  }

  setTheme(savedTheme || (themePreference.matches ? "dark" : "light"));
  themeToggle.addEventListener("click", () => {
    savedTheme = root.dataset.theme === "dark" ? "light" : "dark";
    setTheme(savedTheme);
    try {
      localStorage.setItem("juan-portfolio-theme", savedTheme);
    } catch {
      /* Optional persistence. */
    }
  });
  themePreference.addEventListener("change", (event) => {
    if (!savedTheme) setTheme(event.matches ? "dark" : "light");
  });

  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".main-nav");
  const mobileBreakpoint = window.matchMedia("(max-width: 700px)");
  function closeMenu(returnFocus = false) {
    navigation.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    if (returnFocus) menuToggle.focus();
  }
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    navigation.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menuToggle.getAttribute("aria-expanded") === "true"
    )
      closeMenu(true);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) closeMenu();
  });
  mobileBreakpoint.addEventListener("change", () => closeMenu());
  // When tabbing out of the mobile navigation, collapse it naturally.
  document
    .querySelector(".site-header")
    .addEventListener("focusout", (event) => {
      if (
        event.relatedTarget &&
        !event.currentTarget.contains(event.relatedTarget)
      )
        closeMenu();
    });

  const projects = [...document.querySelectorAll(".project-card")];
  const filters = [...document.querySelectorAll(".filter-button")];
  const projectCount = document.querySelector(".project-count");
  document.querySelector("[data-project-total]").textContent = String(
    projects.length,
  ).padStart(2, "0");
  function updateProjectCount(visible) {
    projectCount.textContent = `${String(visible).padStart(2, "0")} ${visible === 1 ? "PROYECTO" : "PROYECTOS"}`;
  }
  updateProjectCount(projects.length);
  filters.forEach((button) =>
    button.addEventListener("click", () => {
      const category = button.dataset.filter;
      filters.forEach((filter) => {
        const active = filter === button;
        filter.classList.toggle("is-active", active);
        filter.setAttribute("aria-pressed", String(active));
      });
      let visible = 0;
      projects.forEach((project) => {
        const show =
          category === "all" || category === project.dataset.category;
        project.hidden = !show;
        if (show) {
          visible += 1;
          project.classList.remove("is-waiting");
        }
      });
      updateProjectCount(visible);
    }),
  );

  if ("IntersectionObserver" in window) {
    const reveals = [...document.querySelectorAll(".reveal")];
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("is-waiting");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    if (!motionPreference.matches) {
      reveals.forEach((element) => {
        element.classList.add("is-waiting");
        revealObserver.observe(element);
      });
    }
    motionPreference.addEventListener("change", (event) => {
      if (event.matches) {
        reveals.forEach((element) => element.classList.remove("is-waiting"));
        revealObserver.disconnect();
      }
    });

    const sectionLinks = [...navigation.querySelectorAll('a[href^="#"]')];
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            sectionLinks.forEach((link) => {
              if (link.hash === `#${entry.target.id}`)
                link.setAttribute("aria-current", "location");
              else link.removeAttribute("aria-current");
            });
          }
        });
      },
      { rootMargin: "-15% 0px -50% 0px", threshold: 0 },
    );
    document
      .querySelectorAll("main > section[id]")
      .forEach((section) => sectionObserver.observe(section));
    const heroObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting)
        sectionLinks.forEach((link) => link.removeAttribute("aria-current"));
    });
    heroObserver.observe(document.querySelector(".hero"));
  }

  document.querySelector("#year").textContent = new Date().getFullYear();
})();
