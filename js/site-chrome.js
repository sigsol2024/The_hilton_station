(function () {
  var LOGO =
    "/assets/HILL STATION LOGO/Secondary logo/PNG-20240523T131423Z-001/SECONDARY LOGO.png";
  var HILLSIDE =
    "/assets/HILL STATION LOGO/HILLSIDE_LOGO_FULL COLOUR.png";
  var PATTERN =
    "/assets/hill-station-brand-pattern-crop-greenbackground.png";

  function isRooms(page) {
    return (
      page === "rooms" ||
      page === "room-list" ||
      page === "suites" ||
      page === "deluxe" ||
      page === "standard"
    );
  }

  function isAmenities(page) {
    return (
      page === "dining" ||
      page === "meetings-events" ||
      page === "leisure" ||
      page === "facilities" ||
      page === "gym" ||
      page === "laundry-cafe" ||
      page === "restaurant"
    );
  }

  function isAbout(page) {
    return page === "about" || page === "estate-experiences" || page === "experiences";
  }

  function navClass(active) {
    var base =
      "relative inline-flex h-12 items-center text-[14px] font-label-caps uppercase transition-colors duration-300 leading-none";
    if (active) return base + " text-primary";
    return base + " text-[#181818] hover:text-primary";
  }

  function renderHeader(page) {
    var roomsOn = isRooms(page);
    var amenitiesOn = isAmenities(page);
    var aboutOn = isAbout(page);
    return (
      '<header class="fixed top-0 left-0 w-full z-50 bg-white border-b border-primary/10 shadow-[0_8px_30px_rgba(24,24,24,0.05)]" id="site-header" style="background-image: linear-gradient(rgba(255,255,255,0.88), rgba(255,255,255,0.88)), url(\'' +
      PATTERN +
      "'); background-size: 620px auto; background-position: center;\">" +
      '<div class="mx-auto flex h-24 max-w-container-max items-center justify-between px-margin-mobile md:px-margin-desktop">' +
      '<a class="flex shrink-0 items-center" href="/" aria-label="The Hill Station home">' +
      '<img alt="The Hill Station" class="w-[200px] md:w-[220px] h-auto" src="' +
      LOGO +
      '"/>' +
      "</a>" +
      '<nav class="hidden lg:flex items-center gap-7" aria-label="Primary navigation">' +
      '<a class="' +
      navClass(page === "home") +
      '" href="/"' +
      (page === "home" ? ' aria-current="page"' : "") +
      ">Home</a>" +
      '<a class="' +
      navClass(roomsOn) +
      '" href="/rooms"' +
      (roomsOn ? ' aria-current="page"' : "") +
      ">Room</a>" +
      '<div class="relative group h-12 flex items-center">' +
      '<a class="' +
      navClass(amenitiesOn) +
      ' gap-1" href="/facilities"' +
      (amenitiesOn ? ' aria-current="page"' : "") +
      ">" +
      'Amenities <span class="material-symbols-outlined text-[18px] leading-none" data-icon="expand_more"></span>' +
      "</a>" +
      '<div class="absolute left-0 top-full hidden min-w-60 border border-primary/10 bg-white py-2 shadow-xl group-hover:block group-focus-within:block">' +
      '<a class="block px-5 py-3 text-[14px] font-label-caps uppercase text-[#181818] hover:text-primary hover:bg-primary/5 transition-colors leading-none" href="/dining">Dining</a>' +
      '<a class="block px-5 py-3 text-[14px] font-label-caps uppercase text-[#181818] hover:text-primary hover:bg-primary/5 transition-colors leading-none" href="/meetings-events">Meeting &amp; Event</a>' +
      '<a class="block px-5 py-3 text-[14px] font-label-caps uppercase text-[#181818] hover:text-primary hover:bg-primary/5 transition-colors leading-none" href="/leisure">Wellness</a>' +
      "</div></div>" +
      '<a class="' +
      navClass(page === "contact") +
      '" href="/contact"' +
      (page === "contact" ? ' aria-current="page"' : "") +
      ">Contact Us</a>" +
      '<a class="' +
      navClass(page === "gallery") +
      '" href="/gallery"' +
      (page === "gallery" ? ' aria-current="page"' : "") +
      ">Gallery</a>" +
      '<div class="relative group h-12 flex items-center">' +
      '<a class="' +
      navClass(aboutOn) +
      ' gap-1" href="/about"' +
      (aboutOn ? ' aria-current="page"' : "") +
      ">" +
      'About Us <span class="material-symbols-outlined text-[18px] leading-none" data-icon="expand_more"></span>' +
      "</a>" +
      '<div class="absolute right-0 top-full hidden min-w-60 border border-primary/10 bg-white py-2 shadow-xl group-hover:block group-focus-within:block">' +
      '<a class="block px-5 py-3 text-[14px] font-label-caps uppercase text-[#181818] hover:text-primary hover:bg-primary/5 transition-colors leading-none" href="/estate-experiences">The Hill Station Experiences</a>' +
      "</div></div>" +
      "</nav>" +
      '<div class="hidden lg:flex items-center">' +
      '<a class="inline-flex h-12 items-center border border-primary bg-primary px-6 text-[14px] font-label-caps uppercase text-white transition-colors hover:bg-transparent hover:text-primary leading-none" href="/rooms">Book Now</a>' +
      "</div>" +
      '<button class="lg:hidden inline-flex h-11 w-11 items-center justify-center border border-primary/30 text-[#181818]" type="button" aria-label="Open menu" data-menu-open>' +
      '<span class="material-symbols-outlined" data-icon="menu"></span>' +
      "</button>" +
      "</div></header>" +
      '<div class="fixed inset-0 z-[60] flex translate-x-full flex-col overflow-y-auto bg-white p-margin-mobile text-[#181818] transition-transform duration-500 lg:hidden" id="mobile-nav" style="background-image: linear-gradient(rgba(255,255,255,0.96), rgba(255,255,255,0.96)), url(\'' +
      PATTERN +
      "'); background-size: 560px auto; background-position: center;\">" +
      '<div class="mb-10 flex items-center justify-between">' +
      '<a href="/" aria-label="The Hill Station home"><img alt="The Hill Station" class="w-[200px] h-auto" src="' +
      LOGO +
      '"/></a>' +
      '<button class="inline-flex h-11 w-11 items-center justify-center border border-primary/30 text-[#181818]" type="button" aria-label="Close menu" data-menu-close>' +
      '<span class="material-symbols-outlined" data-icon="close"></span>' +
      "</button></div>" +
      '<nav class="flex flex-none flex-col" aria-label="Mobile navigation">' +
      '<a class="block py-3 font-headline-md text-[28px] leading-tight text-[#181818] hover:text-primary transition-colors" href="/">Home</a>' +
      '<a class="block py-3 font-headline-md text-[28px] leading-tight text-[#181818] hover:text-primary transition-colors" href="/rooms">Room</a>' +
      '<a class="block py-3 font-headline-md text-[28px] leading-tight text-[#181818] hover:text-primary transition-colors" href="/dining">Dining</a>' +
      '<a class="block py-3 font-headline-md text-[28px] leading-tight text-[#181818] hover:text-primary transition-colors" href="/meetings-events">Meeting &amp; Event</a>' +
      '<a class="block py-3 font-headline-md text-[28px] leading-tight text-[#181818] hover:text-primary transition-colors" href="/leisure">Wellness</a>' +
      '<a class="block py-3 font-headline-md text-[28px] leading-tight text-[#181818] hover:text-primary transition-colors" href="/contact">Contact Us</a>' +
      '<a class="block py-3 font-headline-md text-[28px] leading-tight text-[#181818] hover:text-primary transition-colors" href="/gallery">Gallery</a>' +
      '<a class="block py-3 font-headline-md text-[28px] leading-tight text-[#181818] hover:text-primary transition-colors" href="/about">About Us</a>' +
      '<a class="block py-3 font-headline-md text-[28px] leading-tight text-[#181818] hover:text-primary transition-colors" href="/estate-experiences">The Hill Station Experiences</a>' +
      "</nav>" +
      '<a class="mt-8 inline-flex h-14 items-center justify-center bg-primary px-6 font-label-caps text-[14px] uppercase text-on-primary" href="/rooms">Book Now</a>' +
      "</div>"
    );
  }

  function renderFooter() {
    return (
      '<footer class="bg-primary text-on-primary" style="background-image: linear-gradient(rgba(30, 61, 49, 0.94), rgba(30, 61, 49, 0.94)), url(\'' +
      PATTERN +
      "'); background-size: cover; background-position: center;\">" +
      '<div class="mx-auto grid max-w-container-max grid-cols-1 gap-12 px-margin-mobile py-20 md:grid-cols-12 md:px-margin-desktop">' +
      '<div class="md:col-span-4">' +
      '<a href="/" aria-label="The Hill Station home"><img alt="The Hill Station" class="w-[180px] md:w-[200px] h-auto" src="' +
      LOGO +
      '"/></a>' +
      '<p class="mt-8 max-w-sm font-body-md text-body-md text-on-primary/75">Where Luxury Meets Adventure in the cool highlands of Jos, Plateau State, Nigeria.</p>' +
      "</div>" +
      '<div class="md:col-span-3">' +
      '<h4 class="mb-6 font-label-caps text-[13px] uppercase text-secondary leading-none">Explore</h4>' +
      '<div class="flex flex-col gap-4 font-body-md text-body-md">' +
      '<a class="text-on-primary/75 transition-colors hover:text-secondary" href="/">Home</a>' +
      '<a class="text-on-primary/75 transition-colors hover:text-secondary" href="/rooms">Room</a>' +
      '<a class="text-on-primary/75 transition-colors hover:text-secondary" href="/facilities">Amenities</a>' +
      '<a class="text-on-primary/75 transition-colors hover:text-secondary" href="/dining">Dining</a>' +
      '<a class="text-on-primary/75 transition-colors hover:text-secondary" href="/meetings-events">Meeting &amp; Event</a>' +
      "</div></div>" +
      '<div class="md:col-span-2">' +
      '<h4 class="mb-6 font-label-caps text-[13px] uppercase text-secondary leading-none">Company</h4>' +
      '<div class="flex flex-col gap-4 font-body-md text-body-md">' +
      '<a class="text-on-primary/75 transition-colors hover:text-secondary" href="/about">About Us</a>' +
      '<a class="text-on-primary/75 transition-colors hover:text-secondary" href="/contact">Contact Us</a>' +
      '<a class="text-on-primary/75 transition-colors hover:text-secondary" href="/gallery">Gallery</a>' +
      '<a class="text-on-primary/75 transition-colors hover:text-secondary" href="/rooms">Book Now</a>' +
      "</div></div>" +
      '<div class="md:col-span-3 min-w-0">' +
      '<h4 class="mb-6 font-label-caps text-[13px] uppercase text-secondary leading-none">Contact</h4>' +
      '<div class="space-y-3 font-body-md text-body-md text-on-primary/75">' +
      "<p>10 Tudun Wada Road,<br/>Jos, Plateau State, Nigeria.</p>" +
      '<p><a class="hover:text-secondary" href="mailto:reservations@hillstationjos.com">reservations@hillstationjos.com</a></p>' +
      '<p><a class="hover:text-secondary" href="mailto:guestexperience@hillstationjos.com">guestexperience@hillstationjos.com</a></p>' +
      '<p class="hidden"><a class="hover:text-secondary" href="tel:+2347014493026">+234 701 449 3026</a></p>' +
      "</div>" +
      '<div class="mt-8 w-full min-w-0">' +
      '<div class="flex w-full min-w-0 items-stretch gap-2.5 border border-primary/45 p-3 md:gap-3 md:p-3.5">' +
      '<p class="flex w-[3.5rem] shrink-0 flex-col justify-center gap-0.5 font-label-caps text-[9px] uppercase leading-tight text-on-primary/70 md:w-[4rem] md:text-[10px]">' +
      "<span>Curated</span><span>Experiences</span><span>Managed by</span></p>" +
      '<span class="w-px shrink-0 self-stretch bg-primary/35" aria-hidden="true"></span>' +
      '<div class="flex min-w-0 flex-[1.2] items-center justify-end overflow-hidden">' +
      '<img alt="Hillside Credentials" class="h-auto max-h-[3.35rem] w-auto max-w-full object-contain object-right md:max-h-[3.85rem]" src="' +
      HILLSIDE +
      '"/>' +
      "</div></div></div>" +
      "</div></div>" +
      '<div class="border-t border-on-primary/10 px-margin-mobile py-6 md:px-margin-desktop">' +
      '<div class="mx-auto flex max-w-container-max flex-col gap-4 font-body-md text-sm text-on-primary/55 md:flex-row md:items-center md:justify-between">' +
      "<p>© 2024 The Hill Station Jos. All Rights Reserved.</p>" +
      '<div class="flex gap-6">' +
      '<a class="hover:text-secondary" href="/privacy">Privacy Policy</a>' +
      '<a class="hover:text-secondary" href="/terms">Terms of Service</a>' +
      "</div></div></div></footer>"
    );
  }

  function bindMobileNav() {
    var mobile = document.getElementById("mobile-nav");
    if (!mobile) return;

    function openMenu() {
      mobile.classList.remove("translate-x-full");
      document.body.style.overflow = "hidden";
    }

    function closeMenu() {
      mobile.classList.add("translate-x-full");
      document.body.style.overflow = "";
    }

    document.querySelectorAll("[data-menu-open]").forEach(function (btn) {
      btn.addEventListener("click", openMenu);
    });
    document.querySelectorAll("[data-menu-close]").forEach(function (btn) {
      btn.addEventListener("click", closeMenu);
    });
    mobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  function init() {
    var page = document.body.getAttribute("data-page") || "home";
    var headerRoot = document.getElementById("site-header-root");
    var footerRoot = document.getElementById("site-footer-root");
    if (headerRoot) headerRoot.innerHTML = renderHeader(page);
    if (footerRoot) footerRoot.innerHTML = renderFooter();
    bindMobileNav();
    document.dispatchEvent(new CustomEvent("hs:chrome-ready"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
