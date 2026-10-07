(function () {

  // Semper only allows linking out to the engine; it must not be embedded in an iframe.
  var ENGINE_URL = "https://services.semper.co.za/BookingEngine/full-layout/date-selection";

  var VENUE_ID = "10409";

  var CHANNEL_ID = "1";

  // Values must match the room type names configured in Semper (matched case-insensitively).
  var ROOM_TYPES = {
    suites: "Suite",
    deluxe: "Deluxe",
    standard: "Standard"
  };

  function toIsoDate(date) {
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
  }

  function parseIsoDate(value) {
    var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
    if (!parts) return null;
    return new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
  }

  function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }

  function startOfToday() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function buildEngineUrl(arrival, departure, roomKey) {
    var params = new URLSearchParams({ VenueID: VENUE_ID, ChannelID: CHANNEL_ID });
    params.set("StartDate", arrival);
    params.set("EndDate", departure);
    if (ROOM_TYPES[roomKey]) params.set("RoomType", ROOM_TYPES[roomKey]);
    return ENGINE_URL + "?" + params.toString();
  }

  function showError(form, message) {
    var box = form.querySelector("[data-booking-error]");
    if (!box) return;
    box.textContent = message;
    box.hidden = !message;
  }

  function initForm(form) {
    var arrivalInput = form.elements.arrival;
    var departureInput = form.elements.departure;
    var roomSelect = form.elements.room;
    if (!arrivalInput || !departureInput) return;

    var earliestArrival = addDays(startOfToday(), 1);
    arrivalInput.min = toIsoDate(earliestArrival);
    if (!parseIsoDate(arrivalInput.value) || parseIsoDate(arrivalInput.value) < earliestArrival) {
      arrivalInput.value = toIsoDate(earliestArrival);
    }

    function syncDeparture() {
      var arrival = parseIsoDate(arrivalInput.value);
      if (!arrival) return;
      var earliestDeparture = addDays(arrival, 1);
      departureInput.min = toIsoDate(earliestDeparture);
      var departure = parseIsoDate(departureInput.value);
      if (!departure || departure < earliestDeparture) {
        departureInput.value = toIsoDate(earliestDeparture);
      }
    }

    syncDeparture();
    arrivalInput.addEventListener("change", function () {
      syncDeparture();
      showError(form, "");
    });
    departureInput.addEventListener("change", function () {
      showError(form, "");
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var arrival = parseIsoDate(arrivalInput.value);
      var departure = parseIsoDate(departureInput.value);
      if (!arrival || arrival < earliestArrival) {
        showError(form, "Please choose an arrival date from tomorrow onwards.");
        arrivalInput.focus();
        return;
      }
      if (!departure || departure <= arrival) {
        showError(form, "Your departure date must be after your arrival date.");
        departureInput.focus();
        return;
      }
      showError(form, "");
      var url = buildEngineUrl(arrivalInput.value, departureInput.value, roomSelect ? roomSelect.value : "");
      openInNewTab(url);
    });
  }

  function openInNewTab(url) {
    var link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function init() {
    var forms = document.querySelectorAll("form[data-booking-form]");
    for (var i = 0; i < forms.length; i++) initForm(forms[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
