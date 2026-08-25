(function () {

  var ENDPOINT = "/api/newsletter-signup.php";

  var SETTINGS_ENDPOINT = "/api/newsletter-settings.php";

  var DISMISS_KEY = "hs_launch_popup_dismissed_day";

  var MIN_SPINNER_MS = 600;

  var POPUP_DELAY_MS = 10000;

  var LAUNCH_TITLE = "Get 10% off Your first reservation at The Hill Station launch";

  var DEFAULT_SUCCESS_MSG =

    "Hooray — you're among the first guests to claim 10% off at The Hill Station's official launch.";

  var FULL_FORM_SOURCES = ["popup", "home", "landing"];

  var CELEBRATION_AUTO_CLOSE_MS = 5500;



  function todayKey() {

    var d = new Date();

    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

  }



  function isDismissedToday() {

    try {

      return localStorage.getItem(DISMISS_KEY) === todayKey();

    } catch (e) {

      return false;

    }

  }



  function dismissForToday() {

    try {

      localStorage.setItem(DISMISS_KEY, todayKey());

    } catch (e) {}

  }



  function clearDismiss() {

    try {

      localStorage.removeItem(DISMISS_KEY);

    } catch (e) {}

  }



  function popupQueryFlag() {

    try {

      var params = new URLSearchParams(window.location.search || "");

      return (params.get("hs_popup") || "").toLowerCase();

    } catch (e) {

      return "";

    }

  }



  function isFullFormSource(source) {

    return FULL_FORM_SOURCES.indexOf(source) !== -1;

  }



  function setStatus(el, message, type) {

    if (!el) return;

    el.hidden = !message;

    el.textContent = message || "";

    el.classList.remove("is-success", "is-error");

    if (type) el.classList.add(type);

  }



  function setLoading(btn, loading, idleLabel) {

    if (!btn) return;

    if (loading) {

      btn.disabled = true;

      btn.classList.add("is-loading");

      btn.dataset.idleLabel = idleLabel || btn.textContent;

      btn.innerHTML = '<span class="hs-spin" aria-hidden="true"></span>Sending…';

    } else {

      btn.disabled = false;

      btn.classList.remove("is-loading");

      btn.textContent = btn.dataset.idleLabel || idleLabel || "Subscribe";

    }

  }



  function validate(form, source) {

    var email = (form.querySelector('[name="email"]') || {}).value || "";

    email = email.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

      return "Please enter a valid email address.";

    }

    if (isFullFormSource(source)) {

      var name = ((form.querySelector('[name="full_name"]') || {}).value || "").trim();

      var phone = ((form.querySelector('[name="phone"]') || {}).value || "").trim();

      if (!name) return "Please enter your full name.";

      if (!phone) return "Please enter your phone number.";

    }

    return "";

  }



  function payloadFromForm(form, source) {

    return {

      source: source,

      email: ((form.querySelector('[name="email"]') || {}).value || "").trim(),

      full_name: ((form.querySelector('[name="full_name"]') || {}).value || "").trim(),

      phone: ((form.querySelector('[name="phone"]') || {}).value || "").trim(),

      website: ((form.querySelector('[name="website"]') || {}).value || "").trim()

    };

  }



  function buildConfettiMarkup() {

    var html = '<div class="hs-celebration__confetti" aria-hidden="true">';

    for (var i = 0; i < 28; i++) {

      html += '<span class="hs-celebration__particle" style="--i:' + i + '"></span>';

    }

    return html + "</div>";

  }



  function refreshIcons(scope) {

    document.dispatchEvent(new CustomEvent("hs:icons-refresh"));

    if (window.HillIcons && typeof window.HillIcons.paintAll === "function") {

      window.HillIcons.paintAll(scope);

    }

  }



  function hideCelebrationTargets(root, selectors) {

    selectors.forEach(function (sel) {

      root.querySelectorAll(sel).forEach(function (el) {

        el.setAttribute("data-hs-celebration-hidden", "1");

        el.hidden = true;

      });

    });

  }



  function showCelebrationSuccess(root, message, options) {

    options = options || {};

    if (!root) return;



    var existing = root.querySelector(".hs-celebration");

    if (existing) existing.parentNode.removeChild(existing);



    var hideSelectors = options.hideSelectors || [

      "form",

      ".hs-popup__consent",

      ".hs-popup__dismiss",

      ".hs-popup__status",

      ".hs-newsletter-status",

      ".hs-launch-form__consent"

    ];

    hideCelebrationTargets(root, hideSelectors);



    if (options.hideTitle) {

      root.querySelectorAll(".hs-popup__kicker, .hs-popup__title").forEach(function (el) {

        el.hidden = true;

      });

    }



    var panel = document.createElement("div");

    panel.className = "hs-celebration" + (options.compact ? " hs-celebration--compact" : "");

    panel.setAttribute("role", "status");

    panel.innerHTML =

      buildConfettiMarkup() +

      '<div class="hs-celebration__icon" aria-hidden="true">🎉</div>' +

      '<h3 class="hs-celebration__headline">You\'re on the list!</h3>' +

      '<p class="hs-celebration__message">' +

      (message || DEFAULT_SUCCESS_MSG) +

      "</p>" +

      (options.showCloseButton && options.onClose

        ? '<button type="button" class="hs-celebration__close-btn" data-hs-celebration-close>Continue exploring</button>'

        : "");



    root.appendChild(panel);

    refreshIcons(panel);



    if (typeof options.onClose === "function") {

      var closeBtn = panel.querySelector("[data-hs-celebration-close]");

      if (closeBtn) {

        closeBtn.addEventListener("click", options.onClose);

      }

      if (options.autoCloseMs) {

        setTimeout(options.onClose, options.autoCloseMs);

      }

    }

  }



  function celebrationRootForForm(form, source) {

    if (source === "popup") {

      return form.closest(".hs-popup");

    }

    if (source === "home") {

      return form.closest(".hs-launch-section__inner");

    }

    if (source === "landing") {

      return form.closest(".hs-launch-landing__card");

    }

    return form.parentElement;

  }



  function submitIdleLabel(source) {

    if (isFullFormSource(source)) return "Claim 10% off";

    return "Subscribe";

  }



  function submitForm(form, options) {

    options = options || {};

    var source = form.getAttribute("data-newsletter-source") || options.source || "footer";

    var statusEl = options.statusEl || form.parentElement.querySelector(".hs-newsletter-status, .hs-popup__status");

    var btn = form.querySelector('button[type="submit"]');

    var idleLabel = options.idleLabel || submitIdleLabel(source);

    var err = validate(form, source);

    if (err) {

      setStatus(statusEl, err, "is-error");

      return;

    }



    setStatus(statusEl, "", null);

    setLoading(btn, true, idleLabel);

    var started = Date.now();

    var body = JSON.stringify(payloadFromForm(form, source));



    fetch(ENDPOINT, {

      method: "POST",

      headers: { "Content-Type": "application/json", Accept: "application/json" },

      body: body

    })

      .then(function (res) {

        return res.json().then(function (data) {

          return { res: res, data: data };

        });

      })

      .then(function (result) {

        var wait = Math.max(0, MIN_SPINNER_MS - (Date.now() - started));

        return new Promise(function (resolve) {

          setTimeout(function () {

            resolve(result);

          }, wait);

        });

      })

      .then(function (result) {

        setLoading(btn, false, idleLabel);

        if (!result.data || !result.data.ok) {

          setStatus(

            statusEl,

            (result.data && result.data.error) || "Something went wrong. Please try again.",

            "is-error"

          );

          return;

        }

        var msg = result.data.message || DEFAULT_SUCCESS_MSG;

        form.reset();



        if (isFullFormSource(source)) {

          var root = celebrationRootForForm(form, source);

          showCelebrationSuccess(root, msg, {

            hideTitle: source === "popup",

            showCloseButton: source === "popup",

            compact: source === "popup",

            onClose: typeof options.onSuccess === "function" ? options.onSuccess : null,

            autoCloseMs: options.autoCloseMs

          });

          if (typeof options.onCelebration === "function") {

            options.onCelebration(msg);

          }

          return;

        }



        setStatus(statusEl, msg, "is-success");

        if (typeof options.onSuccess === "function") options.onSuccess(msg);

      })

      .catch(function () {

        var wait = Math.max(0, MIN_SPINNER_MS - (Date.now() - started));

        setTimeout(function () {

          setLoading(btn, false, idleLabel);

          setStatus(statusEl, "Unable to reach the server. Please try again.", "is-error");

        }, wait);

      });

  }



  function bindFooterForms(root) {

    (root || document).querySelectorAll("form[data-newsletter-source]").forEach(function (form) {

      if (form.dataset.bound === "1") return;

      form.dataset.bound = "1";

      var source = form.getAttribute("data-newsletter-source") || "footer";

      form.addEventListener("submit", function (e) {

        e.preventDefault();

        submitForm(form, {

          idleLabel: submitIdleLabel(source),

          statusEl: form.parentElement.querySelector(".hs-newsletter-status, .hs-popup__status")

        });

      });

    });

  }



  function buildPopup() {

    var overlay = document.createElement("div");

    overlay.className = "hs-popup-overlay";

    overlay.setAttribute("role", "dialog");

    overlay.setAttribute("aria-modal", "true");

    overlay.setAttribute("aria-labelledby", "hs-popup-title");

    overlay.innerHTML =

      '<div class="hs-popup">' +

      '<button class="hs-popup__close" type="button" aria-label="Close" data-hs-popup-close>' +

      '<span class="material-symbols-outlined" data-icon="close"></span>' +

      "</button>" +

      '<p class="hs-popup__kicker">Official launch</p>' +

      '<h2 class="hs-popup__title" id="hs-popup-title">' +

      LAUNCH_TITLE +

      "</h2>" +

      '<form data-newsletter-source="popup" novalidate>' +

      '<input type="text" name="website" value="" tabindex="-1" autocomplete="off" class="hs-honeypot" aria-hidden="true"/>' +

      '<label for="hs-popup-name">Full name</label>' +

      '<input id="hs-popup-name" name="full_name" type="text" required autocomplete="name"/>' +

      '<label for="hs-popup-email">Email</label>' +

      '<input id="hs-popup-email" name="email" type="email" required autocomplete="email"/>' +

      '<label for="hs-popup-phone">Phone</label>' +

      '<input id="hs-popup-phone" name="phone" type="tel" required autocomplete="tel"/>' +

      '<button class="hs-popup__submit" type="submit">Claim 10% off</button>' +

      "</form>" +

      '<p class="hs-popup__consent">By submitting, you agree to receive Hill Station news and launch updates.</p>' +

      '<p class="hs-popup__status" aria-live="polite" hidden></p>' +

      '<button class="hs-popup__dismiss" type="button" data-hs-popup-dismiss>Dismiss for 24 hours</button>' +

      "</div>";

    document.body.appendChild(overlay);

    return overlay;

  }



  function startPopup(options) {

    options = options || {};

    var force = !!options.force;

    var delay = typeof options.delay === "number" ? options.delay : POPUP_DELAY_MS;



    if ((document.body.getAttribute("data-page") || "") !== "home") return;

    if (!force && isDismissedToday()) return;



    var overlay = buildPopup();

    var form = overlay.querySelector("form");

    var statusEl = overlay.querySelector(".hs-popup__status");



    function closePopup() {

      overlay.classList.remove("is-open");

      setTimeout(function () {

        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);

      }, 300);

    }



    function dismissAndClose() {

      dismissForToday();

      closePopup();

    }



    overlay.querySelectorAll("[data-hs-popup-close]").forEach(function (btn) {

      btn.addEventListener("click", closePopup);

    });

    overlay.querySelectorAll("[data-hs-popup-dismiss]").forEach(function (btn) {

      btn.addEventListener("click", dismissAndClose);

    });

    overlay.addEventListener("click", function (e) {

      if (e.target === overlay) closePopup();

    });



    form.addEventListener("submit", function (e) {

      e.preventDefault();

      submitForm(form, {

        idleLabel: "Claim 10% off",

        statusEl: statusEl,

        autoCloseMs: CELEBRATION_AUTO_CLOSE_MS,

        onSuccess: function () {

          dismissForToday();

          closePopup();

        }

      });

    });



    setTimeout(function () {

      if (!force && isDismissedToday()) return;

      overlay.classList.add("is-open");

      refreshIcons(overlay);

    }, delay);

  }



  function loadForcePopupSetting() {
    try {
      var cached = sessionStorage.getItem("hs_force_popup");
      if (cached === "0" || cached === "1") {
        return Promise.resolve(cached === "1");
      }
    } catch (e) {}

    return fetch(SETTINGS_ENDPOINT, { headers: { Accept: "application/json" }, cache: "no-store" })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        var force = !!(data && data.forcePopup);
        try {
          sessionStorage.setItem("hs_force_popup", force ? "1" : "0");
        } catch (e) {}
        return force;
      })
      .catch(function () {
        return false;
      });
  }



  function initPopup() {

    if ((document.body.getAttribute("data-page") || "") !== "home") return;



    var q = popupQueryFlag();

    if (q === "reset") {

      clearDismiss();

    }



    if (q === "1" || q === "force" || q === "reset" || q === "show") {

      clearDismiss();

      startPopup({ force: true, delay: 500 });

      return;

    }



    loadForcePopupSetting().then(function (forceFromConfig) {

      startPopup({

        force: forceFromConfig,

        delay: forceFromConfig ? 1500 : POPUP_DELAY_MS

      });

    });

  }



  function boot() {

    bindFooterForms(document);

    initPopup();

  }



  document.addEventListener("hs:chrome-ready", function () {

    bindFooterForms(document);

  });



  if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", boot, { once: true });

  } else {

    boot();

  }

})();


