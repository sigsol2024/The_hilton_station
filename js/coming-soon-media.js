(function () {
  if (document.getElementById("coming-soon-media-style")) return;

  var style = document.createElement("style");
  style.id = "coming-soon-media-style";
  style.textContent =
    ".coming-soon-media{position:relative;display:block;overflow:hidden;max-width:100%;z-index:0;isolation:isolate}" +
    ".coming-soon-media--fill{width:100%;height:100%}" +
    ".coming-soon-media--abs{position:absolute;inset:0;width:auto;height:auto;max-width:none}" +
    ".coming-soon-veil{position:absolute;inset:0;z-index:1;display:flex;align-items:center;justify-content:center;pointer-events:none;background:linear-gradient(105deg,rgba(10,22,17,.82) 0%,rgba(20,41,33,.74) 38%,rgba(14,29,23,.64) 100%),linear-gradient(to top,rgba(10,22,17,.78),rgba(14,29,23,.42) 46%)}" +
    ".coming-soon-veil--quiet{background:linear-gradient(105deg,rgba(6,14,11,.9) 0%,rgba(14,29,23,.86) 38%,rgba(8,18,14,.82) 100%),linear-gradient(to top,rgba(6,14,11,.88),rgba(14,29,23,.62) 46%)}" +
    "#room-hero-slider .room-slide-panel-wrap{z-index:10}" +
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

  function isFillImage(img) {
    var cs = window.getComputedStyle(img);
    return (
      cs.position === "absolute" ||
      cs.position === "fixed" ||
      img.classList.contains("absolute") ||
      img.classList.contains("inset-0")
    );
  }

  function makeVeil(options) {
    options = options || {};
    var veil = document.createElement("span");
    veil.className = "coming-soon-veil" + (options.quiet ? " coming-soon-veil--quiet" : "");
    veil.setAttribute("aria-hidden", "true");
    if (!options.quiet) {
      var label = document.createElement("span");
      label.className = "coming-soon-label";
      label.textContent = "Coming soon";
      veil.appendChild(label);
    }
    return veil;
  }

  function raiseContentAfter(marker) {
    var parent = marker.parentElement;
    if (!parent) return;
    var seen = false;
    Array.prototype.forEach.call(parent.children, function (child) {
      if (child === marker) {
        seen = true;
        return;
      }
      if (!seen) return;
      if (child.tagName === "IMG") return;
      if (child.classList.contains("coming-soon-veil")) return;
      if (child.classList.contains("coming-soon-media")) return;
      var pos = window.getComputedStyle(child).position;
      if (pos === "static") child.style.position = "relative";
      var z = window.getComputedStyle(child).zIndex;
      if (z === "auto" || Number(z) < 2) child.style.zIndex = "2";
    });
  }

  function overlaySharedParent(parent, options) {
    if (!parent || parent.querySelector(":scope > .coming-soon-veil")) return;
    var pos = window.getComputedStyle(parent).position;
    if (pos === "static") parent.style.position = "relative";
    var veil = makeVeil(options);
    var lastImg = null;
    Array.prototype.forEach.call(parent.children, function (child) {
      if (child.tagName === "IMG") lastImg = child;
    });
    if (lastImg && lastImg.nextSibling) parent.insertBefore(veil, lastImg.nextSibling);
    else parent.appendChild(veil);
    raiseContentAfter(veil);
  }

  function wrapInFlowImage(img, options) {
    if (img.closest(".coming-soon-media")) return;
    var fills = img.classList.contains("h-full") || img.classList.contains("w-full");
    var wrap = document.createElement("span");
    wrap.className = "coming-soon-media" + (fills ? " coming-soon-media--fill" : "");
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);
    wrap.appendChild(makeVeil(options));
    raiseContentAfter(wrap);
  }

  function applyToImage(img, options) {
    if (isChrome(img) || isLogo(img) || isPageHero(img)) return;
    if (img.classList.contains("logo-window-segment")) return;
    if (img.closest(".coming-soon-media")) return;
    if (img.parentElement && img.parentElement.querySelector(":scope > .coming-soon-veil")) return;

    if (isFillImage(img)) {
      overlaySharedParent(img.parentElement, options);
      return;
    }

    wrapInFlowImage(img, options);
  }

  function applyHomeHeroRoomOverlays() {
    var slides = document.querySelectorAll(
      "#room-hero-slider .room-hero-slide:not(.about-hero-slide)"
    );
    slides.forEach(function (slide) {
      var img = slide.querySelector(":scope > img");
      if (!img || img.closest(".coming-soon-media")) return;
      wrapInFlowImage(img, { quiet: true });
    });
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

    applyHomeHeroRoomOverlays();

    document.querySelectorAll(".logo-window").forEach(function (windowEl) {
      if (isChrome(windowEl) || isPageHero(windowEl)) return;
      overlaySharedParent(windowEl);
    });

    document.querySelectorAll("img").forEach(function (img) {
      applyToImage(img);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply, { once: true });
  } else {
    apply();
  }
})();
