(() => {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const today = new Date();
  today.setHours(0,0,0,0);

  function localDateISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&#39;","\"":"&#34;"
    }[c] || c));
  }

  function setMinDates() {
    const dep = $("#departure");
    const ret = $("#returnDate");
    const min = localDateISO(today);
    if (dep) {
      dep.min = min;
      if (!dep.value) dep.value = min;
    }
    if (ret) {
      ret.min = dep?.value || min;
      if (!ret.value) {
        const d = new Date(today);
        d.setDate(d.getDate() + 7);
        ret.value = localDateISO(d);
      }
    }
    dep?.addEventListener("change", () => {
      if (ret) {
        ret.min = dep.value || min;
        if (ret.value && ret.value < ret.min) ret.value = ret.min;
      }
    });
  }

  function showNotice(message, type = "info") {
    let box = $("#siteNotice");
    if (!box) {
      box = document.createElement("div");
      box.id = "siteNotice";
      box.className = "site-notice";
      document.body.appendChild(box);
    }
    box.textContent = message;
    box.dataset.type = type;
    box.classList.add("show");
    clearTimeout(box._timer);
    box._timer = setTimeout(() => box.classList.remove("show"), 4200);
  }

  function ensureResultsPanel() {
    let panel = $("#flightResults");
    if (panel) return panel;
    panel = document.createElement("section");
    panel.id = "flightResults";
    panel.className = "flight-results-section";
    const search = $(".search-card") || $(".search-panel") || $("main");
    (search?.parentElement || document.body).insertBefore(panel, search?.nextSibling || null);
    return panel;
  }

  function getFlightFormData(form) {
    const from = $("#from", form)?.value.trim() || "";
    const to = $("#to", form)?.value.trim() || "";
    const departure = $("#departure", form)?.value || "";
    const returnDate = $("#returnDate", form)?.value || "";
    const passengers = $("#passengers", form)?.value || "1";
    const cabin = $("#cabin", form)?.value || "Economy";
    const tripType = $('input[name="tripType"]:checked', form)?.value || "round";
    return { from, to, departure, returnDate, passengers, cabin, tripType };
  }

  function validateFlight(data) {
    if (!data.from || !data.to) return "Please enter both your departure and destination.";
    if (data.from.toLowerCase() === data.to.toLowerCase()) return "Departure and destination cannot be the same.";
    if (!data.departure) return "Please choose a departure date.";
    if (new Date(data.departure + "T00:00:00") < today) return "Departure date cannot be in the past.";
    if (data.tripType !== "one" && data.returnDate && data.returnDate < data.departure) {
      return "Return date must be after the departure date.";
    }
    return "";
  }

  function renderSearchRequest(data) {
    const panel = ensureResultsPanel();
    const returnText = data.tripType === "one" ? "One way" : (data.returnDate || "Flexible return");
    panel.innerHTML = `
      <div class="results-shell">
        <div class="results-heading">
          <div>
            <span class="eyebrow">FLIGHT SEARCH</span>
            <h2>Options for your trip</h2>
            <p>${escapeHTML(data.from)} → ${escapeHTML(data.to)} · ${escapeHTML(data.departure)} · ${escapeHTML(returnText)}</p>
          </div>
          <button class="ghost-btn" type="button" data-scroll-search>Change search</button>
        </div>
        <div class="live-search-note">
          <span class="status-dot"></span>
          <div><strong>Ready to check current fares</strong><small>Dude will compare available options and your travel advisor can complete the booking with you.</small></div>
        </div>
        <div class="result-card">
          <div class="airline-mark">D</div>
          <div class="result-main">
            <strong>Get current flight options</strong>
            <span>${escapeHTML(data.from)} to ${escapeHTML(data.to)} · ${escapeHTML(data.passengers)} passenger(s) · ${escapeHTML(data.cabin)}</span>
          </div>
          <button class="primary-btn request-booking" type="button">Request booking</button>
        </div>
      </div>`;
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
    $("[data-scroll-search]", panel)?.addEventListener("click", () => {
      $(".search-card")?.scrollIntoView({behavior:"smooth", block:"center"});
    });
    $$(".request-booking", panel).forEach(btn => btn.addEventListener("click", () => openBookingModal(data)));
  }

  function openBookingModal(flightData = {}) {
    let modal = $("#bookingModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "bookingModal";
      modal.className = "booking-modal";
      modal.innerHTML = `
        <div class="booking-backdrop" data-close-modal></div>
        <div class="booking-dialog" role="dialog" aria-modal="true" aria-labelledby="bookingTitle">
          <button class="modal-close" type="button" aria-label="Close" data-close-modal>×</button>
          <span class="eyebrow">DUDE TRAVEL ADVISOR</span>
          <h2 id="bookingTitle">Let's get your trip booked.</h2>
          <p class="modal-copy">Send us your details and a Dude travel advisor will contact you to confirm the current fare and booking.</p>
          <form id="bookingForm" class="booking-form">
            <div class="booking-summary" id="bookingSummary"></div>
            <div class="form-grid">
              <label>Full name<input name="name" required autocomplete="name" placeholder="Your name"></label>
              <label>Phone / WhatsApp<input name="phone" required autocomplete="tel" placeholder="+20 ..."></label>
              <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com"></label>
              <label>Preferred contact
                <select name="contact"><option>WhatsApp</option><option>Phone call</option><option>Email</option></select>
              </label>
            </div>
            <label>Notes<textarea name="notes" rows="3" placeholder="Anything we should know?"></textarea></label>
            <button class="primary-btn" type="submit">Send booking request</button>
            <small class="form-footnote">No payment is taken on this form.</small>
          </form>
        </div>`;
      document.body.appendChild(modal);
      $$("[data-close-modal]", modal).forEach(el => el.addEventListener("click", () => closeBookingModal()));
      $("#bookingForm", modal).addEventListener("submit", e => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        const request = Object.fromEntries(fd.entries());
        request.trip = modal.dataset.trip || "";
        request.createdAt = new Date().toISOString();
        const saved = JSON.parse(localStorage.getItem("dudeBookingRequests") || "[]");
        saved.push(request);
        localStorage.setItem("dudeBookingRequests", JSON.stringify(saved));
        modal.querySelector(".booking-dialog").innerHTML = `
          <button class="modal-close" type="button" aria-label="Close" data-close-modal>×</button>
          <span class="eyebrow">REQUEST RECEIVED</span>
          <h2>You're all set, Dude.</h2>
          <p class="modal-copy">Your request is saved. A Dude travel advisor can now contact you using the details you provided.</p>
          <button class="primary-btn" type="button" data-close-modal>Done</button>`;
        $$("[data-close-modal]", modal).forEach(el => el.addEventListener("click", closeBookingModal));
      });
    }
    modal.dataset.trip = JSON.stringify(flightData);
    const summary = $("#bookingSummary", modal);
    if (summary) summary.textContent = flightData.from ? `${flightData.from} → ${flightData.to} · ${flightData.departure || ""}` : "Trip details";
    modal.classList.add("open");
    document.body.classList.add("modal-open");
    $("#bookingForm input[name=name]", modal)?.focus();
  }

  function closeBookingModal() {
    $("#bookingModal")?.classList.remove("open");
    document.body.classList.remove("modal-open");
  }

  function initFlightSearch() {
    const form = $("form.flight-form") || $("#flightSearchForm") || $(".search-card form");
    if (!form) return;
    form.addEventListener("submit", e => {
      e.preventDefault();
      const data = getFlightFormData(form);
      const error = validateFlight(data);
      if (error) return showNotice(error, "error");
      renderSearchRequest(data);
    });
  }

  function initSwap() {
    const buttons = $$("[data-swap], .swap-btn, #swapLocations");
    buttons.forEach(btn => btn.addEventListener("click", () => {
      const form = btn.closest("form") || document;
      const from = $("#from", form);
      const to = $("#to", form);
      if (!from || !to) return;
      [from.value, to.value] = [to.value, from.value];
      showNotice("Locations swapped.");
    }));
  }

  function initTripTypes() {
    $$('input[name="tripType"]').forEach(input => input.addEventListener("change", () => {
      const ret = $("#returnDate");
      if (!ret) return;
      ret.disabled = input.value === "one";
      ret.closest("label")?.classList.toggle("is-disabled", input.value === "one");
    }));
  }

  function initDealButtons() {
    $$("[data-route], .deal-route").forEach(btn => btn.addEventListener("click", () => {
      const route = btn.dataset.route || btn.textContent || "";
      const parts = route.split(/\s*(?:→|to|×|-)\s*/i);
      const from = $("#from"), to = $("#to");
      if (from && parts[0]) from.value = parts[0].trim();
      if (to && parts[1]) to.value = parts[1].trim();
      $(".search-card")?.scrollIntoView({behavior:"smooth", block:"center"});
    }));
  }

  function initBookingLinks() {
    $$('a[href*="book"], [data-book], .book-trip, .book-now').forEach(el => {
      if (el.dataset.bookingBound) return;
      el.dataset.bookingBound = "1";
      el.addEventListener("click", e => {
        const href = el.getAttribute("href") || "";
        if (href === "#" || el.dataset.book !== undefined || /book/i.test(el.textContent || "")) {
          e.preventDefault();
          openBookingModal();
        }
      });
    });
  }

  function initContactForms() {
    $$("form").forEach(form => {
      if (form.matches(".flight-form, #bookingForm")) return;
      form.addEventListener("submit", e => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        showNotice("Thanks, Dude. Your request has been received.", "success");
        form.reset();
      });
    });
  }

  function initBrokenImages() {
    const fallback = (img) => {
      if (img.dataset.fallbackDone) return;
      img.dataset.fallbackDone = "1";
      const label = img.alt || "Dude Travel";
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#eaf5ff"/><stop offset="1" stop-color="#f7fbff"/></linearGradient></defs><rect width="900" height="560" fill="url(#g)"/><circle cx="720" cy="100" r="110" fill="#fff" opacity=".7"/><path d="M100 390 C280 260 390 450 560 330 S780 270 850 360" fill="none" stroke="#2f8df5" stroke-width="10" opacity=".28"/><text x="60" y="100" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="#102b5c">${escapeHTML(label)}</text><text x="60" y="145" font-family="Arial,sans-serif" font-size="20" fill="#526784">TRAVEL DIFFERENT</text><path d="M615 235 l110 -45 -45 65 80 20 -140 5 -45 45 10 -55 -55 -25 90 -10z" fill="#2f8df5"/></svg>`;
      img.src = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
    };
    $$("img").forEach(img => {
      if (img.complete && img.naturalWidth === 0) fallback(img);
      img.addEventListener("error", () => fallback(img));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setMinDates();
    initFlightSearch();
    initSwap();
    initTripTypes();
    initDealButtons();
    initBookingLinks();
    initContactForms();
    initBrokenImages();
  });
})();

/* Production backend integration */
(function () {
  "use strict";
  const SUPABASE_URL = "https://wjriwuagxkekofnxskzl.supabase.co";
  const SUPABASE_KEY = "sb_publishable_dg53yqlV-gqGw7nHZaSEyA_opuaRzhg";
  let clientPromise = null;

  function loadSupabase() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve(window.supabase);
    if (clientPromise) return clientPromise;
    clientPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.async = true;
      s.dataset.dudeSupabase = "1";
      s.onload = () => window.supabase && window.supabase.createClient ? resolve(window.supabase) : reject(new Error("Supabase SDK unavailable"));
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return clientPromise;
  }

  async function getClient() {
    const sdk = await loadSupabase();
    return sdk.createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  function val(form, name) {
    return form && form.elements && form.elements.namedItem(name) ? (form.elements.namedItem(name).value || "").trim() : "";
  }

  async function saveSearch(form) {
    try {
      const c = await getClient();
      const from = val(form, "from"), to = val(form, "to");
      const departure = val(form, "departure") || val(form, "departureDate");
      const returnDate = val(form, "return") || val(form, "returnDate");
      if (!from || !to || !departure) return;
      await c.from("flight_searches").insert({
        from_code: from.toUpperCase(), to_code: to.toUpperCase(),
        departure_date: departure, return_date: returnDate || null,
        trip_type: (form.querySelector('input[name="tripType"]:checked') || {}).value || "roundtrip",
        passengers: Number(val(form, "passengers") || 1),
        cabin: (val(form, "cabin") || "economy").toLowerCase()
      });
    } catch (e) { console.warn("Dude search logging", e); }
  }

  async function saveBooking(form) {
    try {
      const c = await getClient();
      const modal = form.closest("#bookingModal");
      let trip = {};
      try { trip = JSON.parse(modal && modal.dataset.trip || "{}"); } catch (_) {}
      const fullName = val(form, "name"), email = val(form, "email"), phone = val(form, "phone");
      if (!fullName || !phone) return;
      const customer = await c.from("customers").insert({full_name: fullName, email: email || null, phone: phone}).select("id").single();
      const customerId = customer.error ? null : customer.data.id;
      await c.from("booking_requests").insert({
        customer_id: customerId, full_name: fullName, email: email || null, phone: phone,
        trip_type: trip.tripType || "roundtrip", from_code: trip.from || "TBD", to_code: trip.to || "TBD",
        departure_date: trip.departure || new Date().toISOString().slice(0,10), return_date: trip.returnDate || null,
        passengers: Number(trip.passengers || 1), cabin: String(trip.cabin || "economy").toLowerCase(),
        notes: val(form, "notes"), status: "new"
      });
    } catch (e) { console.error("Dude booking backend", e); }
  }

  async function saveContact(form) {
    try {
      const c = await getClient();
      await c.from("contact_requests").insert({
        full_name: val(form, "name") || val(form, "fullName"),
        email: val(form, "email") || null, phone: val(form, "phone") || null,
        subject: val(form, "subject") || "Website enquiry",
        message: val(form, "message") || val(form, "notes")
      });
    } catch (e) { console.warn("Dude contact backend", e); }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("submit", function (event) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.matches(".flight-form, #flightSearchForm, .search-card form")) saveSearch(form);
      else if (form.id === "bookingForm") saveBooking(form);
      else if (!form.matches(".flight-form, #bookingForm")) saveContact(form);
    }, true);
  });

  window.DudeBackend = { getClient, saveSearch, saveBooking, saveContact };
})();

