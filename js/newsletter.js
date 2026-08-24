(function () {
  var ENDPOINT = "/api/newsletter-signup.php";
  var SETTINGS_ENDPOINT = "/api/newsletter-settings.php";
  var DISMISS_KEY = "hs_launch_popup_dismissed_day";
  var MIN_SPINNER_MS = 2000;
  var POPUP_DELAY_MS = 10000;

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
    if (source === "popup") {
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

  function submitForm(form, options) {
    options = options || {};
    var source = form.getAttribute("data-newsletter-source") || options.source || "footer";
    var statusEl = options.statusEl || form.parentElement.querySelector(".hs-newsletter-status, .hs-popup__status");
    var btn = form.querySelector('button[type="submit"]');
    var err = validate(form, source);
    if (err) {
      setStatus(statusEl, err, "is-error");
      return;
    }

    setStatus(statusEl, "", null);
    setLoading(btn, true, options.idleLabel || "Subscribe");
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
        setLoading(btn, false, options.idleLabel || "Subscribe");
        if (!result.data || !result.data.ok) {
          setStatus(
            statusEl,
            (result.data && result.data.error) || "Something went wrong. Please try again.",
            "is-error"
          );
          return;
        }
        var msg =
          result.data.message ||
          "Hooray — you’re among the first guests to claim 10% off at The Hill Station’s official launch.";
        setStatus(statusEl, msg, "is-success");
        form.reset();
        if (typeof options.onSuccess === "function") options.onSuccess(msg);
      })
      .catch(function () {
        var wait = Math.max(0, MIN_SPINNER_MS - (Date.now() - started));
        setTimeout(function () {
          setLoading(btn, false, options.idleLabel || "Subscribe");
          setStatus(statusEl, "Unable to reach the server. Please try again.", "is-error");
        }, wait);
      });
  }

  function bindFooterForms(root) {
    (root || document).querySelectorAll("form[data-newsletter-source]").forEach(function (form) {
      if (form.dataset.bound === "1") return;
      form.dataset.bound = "1";
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        submitForm(form, {
          idleLabel: "Subscribe",
          statusEl: form.parentElement.querySelector(".hs-newsletter-status")
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
      '<h2 class="hs-popup__title" id="hs-popup-title">Get 10% off at The Hill Station launch</h2>' +
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
        onSuccess: function () {
          dismissForToday();
          setTimeout(closePopup, 2200);
        }
      });
    });

    setTimeout(function () {
      if (!force && isDismissedToday()) return;
      overlay.classList.add("is-open");
      document.dispatchEvent(new CustomEvent("hs:icons-refresh"));
      if (window.HillIcons && typeof window.HillIcons.paintAll === "function") {
        window.HillIcons.paintAll(overlay);
      }
    }, delay);
  }

  function loadForcePopupSetting() {
    return fetch(SETTINGS_ENDPOINT, { headers: { Accept: "application/json" }, cache: "no-store" })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        return !!(data && data.forcePopup);
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

    // Instant test: /?hs_popup=1 or /?hs_popup=force or /?hs_popup=reset
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
