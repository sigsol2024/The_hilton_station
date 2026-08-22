(function () {
  if (!document.getElementById("hill-icons-style")) {
    var style = document.createElement("style");
    style.id = "hill-icons-style";
    style.textContent =
      ".material-symbols-outlined{display:inline-flex;align-items:center;justify-content:center;width:1em;height:1em;flex-shrink:0;vertical-align:middle;line-height:1;overflow:hidden;font-size:inherit;font-family:inherit}" +
      ".material-symbols-outlined svg{width:1em;height:1em;display:block;overflow:visible}" +
      "@keyframes hill-icon-spin{to{transform:rotate(360deg)}}" +
      ".material-symbols-outlined.animate-spin,.material-symbols-outlined.animate-spin svg{animation:hill-icon-spin .8s linear infinite;transform-origin:center}";
    (document.head || document.documentElement).appendChild(style);
  }

  var stroke =
    'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
  var fill = 'fill="currentColor" stroke="none"';

  function icon(inner, filled) {
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" ' +
      (filled ? fill : stroke) +
      ">" +
      inner +
      "</svg>"
    );
  }

  var ICONS = {
    expand_more: icon('<path d="M6 9l6 6 6-6"/>'),
    keyboard_arrow_down: icon('<path d="M6 9l6 6 6-6"/>'),
    menu: icon('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    close: icon('<path d="M6 6l12 12M18 6L6 18"/>'),
    chevron_left: icon('<path d="M15 6l-6 6 6 6"/>'),
    chevron_right: icon('<path d="M9 6l6 6-6 6"/>'),
    arrow_back: icon('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
    arrow_forward: icon('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    arrow_right_alt: icon('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    wifi: icon(
      '<path d="M5 12.6c3.7-3.5 10.3-3.5 14 0"/><path d="M8.5 15.8c2-1.9 5-1.9 7 0"/><path d="M12 19h.01"/>'
    ),
    shower: icon(
      '<path d="M4 17h.01M8 17h.01M12 17h.01M16 17h.01M6 20h.01M10 20h.01M14 20h.01M4 4h10a4 4 0 0 1 4 4v3H8V8a4 4 0 0 1 4-4"/>'
    ),
    hotel: icon(
      '<path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-6h6v6"/><path d="M3 21h18"/>'
    ),
    bed: icon(
      '<path d="M3 18v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5"/><path d="M3 18h18"/><path d="M7 11V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"/><path d="M3 21v-3M21 21v-3"/>'
    ),
    king_bed: icon(
      '<path d="M3 18v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5"/><path d="M3 18h18M3 21v-3M21 21v-3"/><path d="M7 11V7h4v4M13 11V7h4v4"/>'
    ),
    weekend: icon(
      '<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M2 14v4h20v-4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M6 18v2M18 18v2"/>'
    ),
    desk: icon(
      '<path d="M4 10h16v8H4z"/><path d="M8 10V6h8v4"/><path d="M7 18v2M17 18v2"/>'
    ),
    countertops: icon(
      '<path d="M4 10h16v2H4z"/><path d="M6 12v6h4v-6"/><path d="M14 12v6h4v-6"/><path d="M4 8h7a3 3 0 0 0 6 0h3"/>'
    ),
    restaurant: icon(
      '<path d="M8 3v8M6 3v4a2 2 0 0 0 4 0V3"/><path d="M8 11v10"/><path d="M16 3v18"/><path d="M16 8h3a2 2 0 0 0 0-4h-3"/>'
    ),
    local_bar: icon(
      '<path d="M8 3h8l-1.5 7h-5L8 3z"/><path d="M12 10v11"/><path d="M8 21h8"/><path d="M7 8h10"/>'
    ),
    inventory_2: icon(
      '<path d="M4 8h16v12H4z"/><path d="M4 8l2-4h12l2 4"/><path d="M10 12h4"/>'
    ),
    luggage: icon(
      '<path d="M8 7h8v12H8z"/><path d="M10 7V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/><path d="M8 12h8M6 10v6M18 10v6"/>'
    ),
    call: icon(
      '<path d="M6.5 4.5h3l1.5 4-2 1.5a12 12 0 0 0 5 5l1.5-2 4 1.5v3A2 2 0 0 1 17.5 19 15 15 0 0 1 5 6.5a2 2 0 0 1 1.5-2z"/>'
    ),
    mail: icon(
      '<path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/>'
    ),
    send: icon('<path d="M4 12l16-8-6 16-2-7-8-1z"/>'),
    location_on: icon(
      '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'
    ),
    format_quote: icon(
      '<path d="M7 11h4V7H7v4zm0 6 4-4h-4v4zm6-6h4V7h-4v4zm0 6 4-4h-4v4z"/>',
      true
    ),
    check_circle: icon(
      '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>'
    ),
    progress_activity: icon('<path d="M12 3a9 9 0 1 1-9 9"/>'),
    fitness_center: icon(
      '<path d="M6 8v8M18 8v8M4 10v4M20 10v4M6 12h12M9 9v6M15 9v6"/>'
    ),
    spa: icon(
      '<path d="M12 20c-4-3.5-6-6.5-6-9a4 4 0 0 1 8 0c0-2.5 2-6 6-9-4 3-6 6.5-6 9a4 4 0 0 1-2 9z"/>'
    ),
    pool: icon(
      '<path d="M4 18c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0"/><path d="M4 21c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0"/><path d="M8 6a3 3 0 0 1 6 0c0 3-3 4-3 7"/><path d="M16 4v1"/>'
    ),
    group: icon(
      '<circle cx="9" cy="8" r="3"/><path d="M3 19a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 19a4.5 4.5 0 0 1 5 0"/>'
    ),
    groups: icon(
      '<circle cx="9" cy="8" r="3"/><path d="M3 19a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 19a4.5 4.5 0 0 1 5 0"/>'
    ),
    meeting_room: icon(
      '<path d="M4 4h10v16H4z"/><path d="M14 8h6v12h-6"/><path d="M17 13h.01"/>'
    ),
    celebration: icon(
      '<path d="M8 21l4-10 4 10"/><path d="M5 11l2 2M17 8l2 1M12 4v2M18 14l1.5 1.5M6 16l-1.5 1.5"/>'
    ),
    location_city: icon(
      '<path d="M4 21V9l6-4 6 4v12"/><path d="M16 21V11h4v10"/><path d="M8 13h2M8 17h2M14 13h2M14 17h2"/>'
    ),
    castle: icon(
      '<path d="M4 21V9l4-2 4 3 4-3 4 2v12"/><path d="M4 9V5h2v2h2V5h2"/><path d="M14 7V5h2v2h2V5h2v4"/><path d="M10 21v-5h4v5"/>'
    ),
    volunteer_activism: icon(
      '<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10z"/>'
    ),
    eco: icon(
      '<path d="M12 21a8 8 0 0 1-8-8c0-6 8-10 8-10s8 4 8 10a8 8 0 0 1-8 8z"/><path d="M12 21V11"/>',
      true
    ),
    water_drop: icon(
      '<path d="M12 3s7 7 7 11a7 7 0 1 1-14 0c0-4 7-11 7-11z"/>',
      true
    ),
    schedule: icon(
      '<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>'
    ),
    smoke_free: icon(
      '<path d="M4 18h10"/><path d="M16 10c1.5 0 2-1 2-2s.5-2 2-2"/><path d="M4 4l16 16"/>'
    ),
    pets: icon(
      '<circle cx="12" cy="14" r="4"/><circle cx="7" cy="9" r="1.6"/><circle cx="17" cy="9" r="1.6"/><circle cx="9" cy="6.5" r="1.4"/><circle cx="15" cy="6.5" r="1.4"/>'
    ),
    payments: icon(
      '<path d="M3 8h18v10H3z"/><path d="M3 8l2-3h14l2 3"/><path d="M7 14h4"/>'
    ),
    bakery_dining: icon(
      '<path d="M4 16c0-2 1.5-4 4-5 1-2 3-3 4-3s3 1 4 3c2.5 1 4 3 4 5H4z"/><path d="M8 16v2M12 16v2M16 16v2"/>'
    ),
    brunch_dining: icon(
      '<path d="M5 10h14v3H5z"/><path d="M8 13v6h8v-6"/><path d="M9 7h6"/><path d="M12 4v3"/>'
    ),
    breakfast_dining: icon(
      '<path d="M5 11h14v8H5z"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
    ),
    dinner_dining: icon(
      '<path d="M4 20h16"/><path d="M6 20V10a6 6 0 0 1 12 0v10"/><path d="M9 10v4M15 10v4"/>'
    ),
    coffee: icon(
      '<path d="M5 8h10v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8z"/><path d="M15 10h2a3 3 0 0 1 0 6h-2"/><path d="M8 4v2M12 4v2"/>'
    ),
    room_service: icon(
      '<path d="M4 14a8 8 0 0 1 16 0H4z"/><path d="M4 17h16"/><path d="M12 6v2"/>'
    ),
    directions_run: icon(
      '<circle cx="14" cy="5" r="2"/><path d="M8 21l3-6 3 2 3-5"/><path d="M10 9l3 2 3-1"/>'
    ),
    self_improvement: icon(
      '<circle cx="12" cy="6" r="2.5"/><path d="M8 21v-6l4-3 4 3v6"/><path d="M9 12h6"/>'
    ),
    music_note: icon(
      '<path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2.5"/><circle cx="17" cy="16" r="2.5"/>'
    ),
    cast: icon(
      '<path d="M3 8V6h18v12h-8"/><path d="M3 18a3 3 0 0 1 3-3"/><path d="M3 18h.01"/><path d="M3 14a7 7 0 0 1 7-7"/>'
    )
  };

  function nameFrom(el) {
    return (
      (el.getAttribute("data-icon") || el.textContent || "")
        .trim()
        .toLowerCase()
    );
  }

  function paint(el) {
    if (!el || el.dataset.iconReady === "1") return;
    var name = nameFrom(el);
    var svg = ICONS[name];
    if (!svg) return;
    el.setAttribute("data-icon", name);
    el.innerHTML = svg;
    el.dataset.iconReady = "1";
  }

  function paintAll(root) {
    (root || document)
      .querySelectorAll(".material-symbols-outlined")
      .forEach(paint);
  }

  function start() {
    paintAll(document);
    var obs = new MutationObserver(function (records) {
      records.forEach(function (record) {
        record.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.classList && node.classList.contains("material-symbols-outlined")) {
            paint(node);
          }
          if (node.querySelectorAll) paintAll(node);
        });
      });
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
