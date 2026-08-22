(function () {
  if (document.getElementById("coming-soon-media-style")) return;

  var style = document.createElement("style");
  style.id = "coming-soon-media-style";
  style.textContent =
    ".coming-soon-media{position:relative;display:block;overflow:hidden;max-width:100%}" +
    ".coming-soon-media--fill{width:100%;height:100%}" +
    ".coming-soon-media--abs{position:absolute;inset:0;width:auto;height:auto;max-width:none}" +
    ".coming-soon-veil{position:absolute;inset:0;z-index:6;display:flex;align-items:center;justify-content:center;pointer-events:none;background:linear-gradient(105deg,rgba(10,22,17,.82) 0%,rgba(20,41,33,.74) 38%,rgba(14,29,23,.64) 100%),linear-gradient(to top,rgba(10,22,17,.78),rgba(14,29,23,.42) 46%)}" +
    ".coming-soon-label{font-family:'Hanken Grotesk',system-ui,sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:#a88750;text-align:center;padding:0 .75rem;line-height:1.3}" +
    ".coming-soon-page-veil{position:fixed;top:6rem;right:0;bottom:0;left:0;z-index:45;display:flex;align-items:center;justify-content:center;background:linear-gradient(105deg,rgba(6,14,11,.97) 0%,rgba(14,29,23,.96) 42%,rgba(8,18,14,.95) 100%)}" +
    ".coming-soon-page-label{font-family:'Hanken Grotesk',system-ui,sans-serif;font-size:clamp(.9rem,2.2vw,1.15rem);font-weight:700;letter-spacing:.32em;text-transform:uppercase;color:#a88750;margin:0}";
  document.head.appendChild(style);

  function isChrome(el) {
    return !!(
      el.closest("#site-header, #mobile-nav, footer") ||
      el.closest("header.fixed")
    );
  }

  function isPageHero(el) {
    return !!el.closest("#room-hero-slider, .about-hero-section");
  }

  function isGalleryPage() {
    return /gallery_the_hill_station_jos\.html/i.test(window.location.pathname);
  }

  function isLogo(img) {
    var src = (img.getAttribute("src") || "") + " " + (img.getAttribute("alt") || "");
    return /logo/i.test(src) && !/logo-window/i.test(src);
  }

  function addVeil(host) {
    if (!host || host.querySelector(":scope > .coming-soon-veil")) return;
    host.classList.add("coming-soon-media");
    var pos = window.getComputedStyle(host).position;
    if (pos === "static") host.style.position = "relative";
    var veil = document.createElement("span");
    veil.className = "coming-soon-veil";
    veil.setAttribute("aria-hidden", "true");
    var label = document.createElement("span");
    label.className = "coming-soon-label";
    label.textContent = "Coming soon";
    veil.appendChild(label);
    host.appendChild(veil);
  }

  function wrapImage(img) {
    if (img.closest(".coming-soon-media")) return;

    var cs = window.getComputedStyle(img);
    var isAbs = cs.position === "absolute" || cs.position === "fixed";
    var fills =
      isAbs ||
      img.classList.contains("h-full") ||
      img.classList.contains("absolute") ||
      cs.height === "100%";

    var wrap = document.createElement("span");
    wrap.className = "coming-soon-media" + (fills ? " coming-soon-media--fill" : "");
    if (isAbs) wrap.classList.add("coming-soon-media--abs");

    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);

    if (isAbs) {
      img.style.position = "static";
      img.style.inset = "auto";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = img.style.objectFit || "cover";
      img.classList.remove("absolute", "inset-0");
    }

    addVeil(wrap);
  }

  function applyGalleryPage() {
    if (document.querySelector(".coming-soon-page-veil")) return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    var overlay = document.createElement("div");
    overlay.className = "coming-soon-page-veil";
    overlay.setAttribute("role", "status");
    var label = document.createElement("p");
    label.className = "coming-soon-page-label";
    label.textContent = "Coming soon";
    overlay.appendChild(label);
    document.body.appendChild(overlay);
  }

  function apply() {
    if (isGalleryPage()) {
      applyGalleryPage();
      return;
    }

    document.querySelectorAll(".logo-window").forEach(function (windowEl) {
      if (isChrome(windowEl) || isPageHero(windowEl)) return;
      addVeil(windowEl);
    });

    document.querySelectorAll("img").forEach(function (img) {
      if (isChrome(img) || isLogo(img) || isPageHero(img)) return;
      if (img.classList.contains("logo-window-segment")) return;
      if (img.closest(".coming-soon-media")) return;
      wrapImage(img);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply, { once: true });
  } else {
    apply();
  }
})();
