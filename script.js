const fallbackGroups = [
  {
    id: "seed-1",
    tag: "asian",
    name: "Mala Bowl Collective",
    restaurant: "Chengdu Kitchen",
    area: "Downtown Brooklyn",
    distance: 0.4,
    cutoff: "11 min",
    joined: 9,
    needed: 12,
    delivery: 2.9,
    minimum: 16.5,
    badge: "CK",
    color: "#c74237",
    rating: 4.7
  },
  {
    id: "seed-2",
    tag: "healthy",
    name: "Post-gym rice plates",
    restaurant: "Green Bento",
    area: "Williamsburg",
    distance: 1.2,
    cutoff: "18 min",
    joined: 6,
    needed: 8,
    delivery: 3.4,
    minimum: 14.2,
    badge: "GB",
    color: "#126b4f",
    rating: 4.5
  },
  {
    id: "seed-3",
    tag: "late",
    name: "Late night chicken run",
    restaurant: "Bird & Bun",
    area: "NYU Tandon",
    distance: 0.8,
    cutoff: "24 min",
    joined: 14,
    needed: 18,
    delivery: 2.6,
    minimum: 13.8,
    badge: "BB",
    color: "#3867b7",
    rating: 4.6
  }
];

const fallbackMenu = [
  { id: 101, tag: "asian", name: "Mala dry pot solo combo", restaurant: "Chengdu Kitchen", price: 16.5, initial: "M" },
  { id: 102, tag: "asian", name: "Teriyaki chicken rice + miso soup", restaurant: "Tokyo Counter", price: 14.9, initial: "T" },
  { id: 103, tag: "healthy", name: "Salmon grain bowl", restaurant: "Green Bento", price: 15.7, initial: "S" },
  { id: 104, tag: "late", name: "Crispy chicken combo", restaurant: "Bird & Bun", price: 13.8, initial: "C" },
  { id: 105, tag: "asian", name: "Four-pack boba tea bundle", restaurant: "Milk Lab", price: 18.0, initial: "B" }
];

const painPoints = [
  {
    title: "Opaque checkout fees",
    pain: "US delivery customers often see delivery fees, service fees, small-order fees, and tips stacked only at checkout.",
    response: "Group cards show all-in estimates, shared delivery, and expected savings before users commit."
  },
  {
    title: "Solo orders are expensive",
    pain: "A single lunch order can become much more expensive once delivery and service fees are added, especially for students and apartment residents.",
    response: "Orders from the same building, campus, or block are batched so delivery cost is split across the group."
  },
  {
    title: "Unreliable ETA",
    pain: "Peak-hour kitchen delays, driver detours, and hard-to-find addresses can make ETA jump around.",
    response: "Cutoff times, group progress, and fixed pickup hubs make each route easier to predict."
  },
  {
    title: "Pickup coordination is messy",
    pain: "Dorms, apartment access, and office lobbies create driver wait time and missed calls.",
    response: "Fixed pickup hubs on the map show distance and pickup windows for each batch."
  },
  {
    title: "Restaurants lose control",
    pain: "Marketplace commissions, discounts, and unauthorized menus can reduce restaurant control over pricing and fulfillment.",
    response: "MealCrew highlights opt-in restaurants, batch orders, and controlled menus to reduce fragmented operations."
  },
  {
    title: "Driver routes are inefficient",
    pain: "Scattered small orders create extra waiting, parking, and door-finding time, making earnings less predictable.",
    response: "Each batch serves only a few pickup points, increasing order density per mile."
  }
];

const marketplaceLanes = [
  {
    label: "Eaters",
    title: "Students, apartment residents, and office lunch teams",
    metric: "$4-7",
    metricLabel: "potential delivery-related savings per order",
    bullets: ["See all-in price before checkout", "Reduce small-order penalties through batching", "Use fixed pickup hubs instead of missed calls"]
  },
  {
    label: "Restaurants",
    title: "Local restaurants willing to prep batch combos",
    metric: "8-18",
    metricLabel: "target orders per batch",
    bullets: ["Show only opt-in menus", "Use fixed cutoffs to avoid random spikes", "Batch prep improves kitchen throughput"]
  },
  {
    label: "Drivers",
    title: "Short-radius, high-density delivery routes",
    metric: "2-3",
    metricLabel: "pickup points per batch",
    bullets: ["Less door-finding and waiting", "Shorter, more predictable routes", "More orders covered in one run"]
  }
];

const launchSteps = [
  {
    week: "Week 1",
    title: "Pick one dense pilot zone",
    metric: "1 building / campus block",
    tasks: ["Choose a 300-800 person apartment, dorm, or office", "Define 2 fixed pickup hubs", "Interview 20 high-frequency delivery users"]
  },
  {
    week: "Week 2",
    title: "Recruit 5 batch-friendly restaurants",
    metric: "5 opt-in restaurants",
    tasks: ["Launch 3-6 high-margin combos only", "Agree on order cutoffs and batch prep windows", "Define refund and out-of-stock rules"]
  },
  {
    week: "Week 3",
    title: "Run a manual dispatch MVP",
    metric: "30-50 orders/day",
    tasks: ["Take orders through forms or group chat if needed", "Manually batch orders and send pickup notices", "Track ETA, late rate, and complaint reasons"]
  },
  {
    week: "Week 4",
    title: "Decide what to automate",
    metric: "3 repeat cohorts",
    tasks: ["Measure repeat usage and group completion", "Add payments and a real order backend", "Productize the highest-frequency routes"]
  }
];

const config = window.MEALCREW_CONFIG || {};
const defaultCenter = config.DEFAULT_CENTER || { lat: 40.6936, lng: -73.9866 };
const radiusMeters = config.SEARCH_RADIUS_METERS || 2400;

let groups = [...fallbackGroups];
let menu = [...fallbackMenu];
let pickupPoints = [
  { name: "Apt Lobby", distance: 0.2, eta: "6:40 PM", position: { lat: 40.6949, lng: -73.9854 } },
  { name: "Library Gate", distance: 0.7, eta: "7:05 PM", position: { lat: 40.6911, lng: -73.9912 } },
  { name: "Campus East", distance: 1.1, eta: "8:15 PM", position: { lat: 40.6978, lng: -73.9799 } }
];
let activeFilter = "all";
let activeSort = "fastest";
let map;
let geocoder;
let placesService;
let infoWindow;
let markers = [];
const cart = [];

const groupGrid = document.querySelector("#groupGrid");
const menuList = document.querySelector("#menuList");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const foodSubtotal = document.querySelector("#foodSubtotal");
const sharedDeliveryFee = document.querySelector("#sharedDeliveryFee");
const serviceFee = document.querySelector("#serviceFee");
const estimatedSaving = document.querySelector("#estimatedSaving");
const checkoutButton = document.querySelector("#checkoutButton");
const toast = document.querySelector("#toast");
const mapStatus = document.querySelector("#mapStatus");
const mapFallback = document.querySelector("#mapFallback");
const pickupList = document.querySelector("#pickupList");
const painGrid = document.querySelector("#painGrid");
const opsGrid = document.querySelector("#opsGrid");
const launchGrid = document.querySelector("#launchGrid");
const pilotForm = document.querySelector("#pilotForm");
const pilotCount = document.querySelector("#pilotCount");
const pilotLeads = [];
const checkoutDrawer = document.querySelector("#checkoutDrawer");
const checkoutItems = document.querySelector("#checkoutItems");
const checkoutPickup = document.querySelector("#checkoutPickup");
const checkoutContact = document.querySelector("#checkoutContact");
const confirmOrderButton = document.querySelector("#confirmOrderButton");
const orderSummary = document.querySelector("#orderSummary");
const orderSteps = document.querySelector("#orderSteps");
const orderStatusPill = document.querySelector("#orderStatusPill");
const floatingCheckout = document.querySelector("#floatingCheckout");
const floatingCount = document.querySelector("#floatingCount");
const floatingTotal = document.querySelector("#floatingTotal");
const floatingCheckoutButton = document.querySelector("#floatingCheckoutButton");
let latestOrder = null;

function money(value) {
  return `$${value.toFixed(2)}`;
}

function milesBetween(a, b) {
  const earthMiles = 3958.8;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthMiles * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function setMapStatus(message, mode = "idle") {
  mapStatus.textContent = message;
  mapStatus.dataset.mode = mode;
}

function classifyPlace(place) {
  const text = `${place.name || ""} ${(place.types || []).join(" ")}`.toLowerCase();
  if (text.includes("salad") || text.includes("juice") || text.includes("vegan") || text.includes("healthy")) return "healthy";
  if (text.includes("bar") || text.includes("pizza") || text.includes("chicken") || text.includes("burger")) return "late";
  return "asian";
}

function badgeFromName(name) {
  return (name || "MC")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function colorForTag(tag) {
  if (tag === "healthy") return "#126b4f";
  if (tag === "late") return "#3867b7";
  return "#c74237";
}

function placeToGroup(place, index, center) {
  const tag = classifyPlace(place);
  const position = place.geometry?.location;
  const latLng = position ? { lat: position.lat(), lng: position.lng() } : center;
  const distance = milesBetween(center, latLng);
  const needed = 8 + (index % 5) * 2;
  const joined = Math.max(3, Math.min(needed - 1, Math.round((place.rating || 4.3) * 2 + index)));
  const cutoff = `${9 + index * 3} min`;
  const minimum = 12 + (place.price_level || 2) * 2.5 + (index % 3);

  return {
    id: place.place_id || `place-${index}`,
    tag,
    name: `${place.name} group order`,
    restaurant: place.name,
    area: place.vicinity || place.formatted_address || "Nearby",
    distance: Number(distance.toFixed(1)),
    cutoff,
    joined,
    needed,
    delivery: Number(Math.max(1.9, distance * 2.2).toFixed(1)),
    soloDelivery: Number(Math.max(6.9, distance * 4.5 + 3.5).toFixed(1)),
    minimum: Number(minimum.toFixed(1)),
    badge: badgeFromName(place.name),
    color: colorForTag(tag),
    rating: place.rating || null,
    position: latLng,
    isOpen: place.opening_hours?.open_now
  };
}

function groupToMenuItem(group, index) {
  const labels = {
    asian: "Best seller rice set",
    healthy: "Protein bowl combo",
    late: "Shareable late-night combo"
  };
  return {
    id: `menu-${group.id}`,
    tag: group.tag,
    name: labels[group.tag] || "Group meal combo",
    restaurant: group.restaurant,
    price: group.minimum,
    initial: group.badge.slice(0, 1)
  };
}

function filteredGroups() {
  const nearbyOnly = document.querySelector("#nearbyOnly").checked;
  const closingSoon = document.querySelector("#closingSoon").checked;
  const filtered = groups.filter((group) => {
      const matchesType = activeFilter === "all" || group.tag === activeFilter;
      const matchesDistance = !nearbyOnly || group.distance <= 1.5;
      const minutes = Number.parseInt(group.cutoff, 10);
      const matchesCutoff = !closingSoon || minutes <= 15;
      return matchesType && matchesDistance && matchesCutoff;
    });

  return filtered.sort((a, b) => {
    if (activeSort === "nearest") return a.distance - b.distance;
    if (activeSort === "cheapest") return a.delivery - b.delivery;
    return Number.parseInt(a.cutoff, 10) - Number.parseInt(b.cutoff, 10);
  });
}

function renderStats() {
  const groupCount = groups.length;
  const avgDelivery = groupCount ? groups.reduce((sum, group) => sum + group.delivery, 0) / groupCount : 0;
  const avgEta = groupCount ? Math.round(groups.reduce((sum, group) => sum + Number.parseInt(group.cutoff, 10), 0) / groupCount + 18) : 0;
  document.querySelector("#liveGroupCount").textContent = groupCount;
  document.querySelector("#avgDeliveryFee").textContent = money(avgDelivery);
  document.querySelector("#avgEta").textContent = groupCount ? `${avgEta} min` : "-- min";
}

function renderGroups() {
  const items = filteredGroups();
  groupGrid.innerHTML = items
    .map((group) => {
      const progress = Math.min(100, Math.round((group.joined / group.needed) * 100));
      const openText = group.isOpen === false ? "May be closed" : group.rating ? `${group.rating.toFixed(1)} Google rating` : "Google Places";
      const soloDelivery = group.soloDelivery || group.delivery + 5.5;
      const saved = soloDelivery - group.delivery;
      return `
        <article class="group-card">
          <div class="group-top">
            <div class="restaurant-badge" style="background:${group.color}">${group.badge}</div>
            <div class="timer">${group.cutoff}</div>
          </div>
          <div>
            <h3>${group.name}</h3>
            <div class="meta">${group.restaurant} · ${group.area} · ${group.distance} mi</div>
            <div class="source-line">${openText}</div>
          </div>
          <div class="progress-row">
            <div class="progress-label">
              <span>${group.joined}/${group.needed} joined</span>
              <strong>${progress}%</strong>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
          </div>
          <div class="fee-strip">
            <span>All-in before tip</span>
            <strong>${money(group.minimum + group.delivery + 0.99)}</strong>
            <span>Save ${money(saved)} on delivery</span>
          </div>
          <div class="trust-row">
            <span>Opt-in menu</span>
            <span>Batch pickup</span>
            <span>ETA buffer</span>
          </div>
          <div class="group-footer">
            <div>
              <div class="price">${money(group.minimum)}+</div>
              <div class="meta">Delivery share about ${money(group.delivery)}/person</div>
            </div>
            <button class="ghost-button" type="button" data-join="${group.id}">View</button>
          </div>
        </article>
      `;
    })
    .join("");

  if (!items.length) {
    groupGrid.innerHTML = `<div class="panel">No group orders match these filters. Try another option.</div>`;
  }
  renderStats();
}

function renderPainPoints() {
  painGrid.innerHTML = painPoints
    .map(
      (item) => `
        <article class="pain-card">
          <h3>${item.title}</h3>
          <p>${item.pain}</p>
          <strong>${item.response}</strong>
        </article>
      `
    )
    .join("");
}

function renderMarketplaceLanes() {
  opsGrid.innerHTML = marketplaceLanes
    .map(
      (lane) => `
        <article class="ops-card">
          <div class="ops-kicker">${lane.label}</div>
          <h3>${lane.title}</h3>
          <div class="ops-metric"><strong>${lane.metric}</strong><span>${lane.metricLabel}</span></div>
          <ul>
            ${lane.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
          </ul>
        </article>
      `
    )
    .join("");
}

function renderLaunchPlan() {
  launchGrid.innerHTML = launchSteps
    .map(
      (step) => `
        <article class="launch-card">
          <div class="launch-week">${step.week}</div>
          <h3>${step.title}</h3>
          <strong>${step.metric}</strong>
          <ul>
            ${step.tasks.map((task) => `<li>${task}</li>`).join("")}
          </ul>
        </article>
      `
    )
    .join("");
}

function updatePilotCount() {
  pilotCount.textContent = pilotLeads.length;
}

function renderMenu() {
  const items = activeFilter === "all" ? menu : menu.filter((item) => item.tag === activeFilter);
  menuList.innerHTML = items
    .map(
      (item) => `
        <article class="menu-item">
          <div class="food-thumb">${item.initial}</div>
          <div>
            <h3>${item.name}</h3>
            <div class="meta">${item.restaurant} · ${money(item.price)}</div>
          </div>
          <button class="add-button" type="button" aria-label="Add ${item.name}" data-add="${item.id}">+</button>
        </article>
      `
    )
    .join("");
}

function renderPickupList() {
  pickupList.innerHTML = pickupPoints
    .map((point) => `<div><strong>${point.name}</strong><span>${point.distance} mi · ${point.eta}</span></div>`)
    .join("");
  checkoutPickup.innerHTML = pickupPoints
    .map((point, index) => `<option value="${index}">${point.name} · ${point.eta}</option>`)
    .join("");
}

function cartFees() {
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const sharedDelivery = cart.length ? Math.max(1.99, 3.2 / Math.max(1, Math.min(cart.length + 3, 6))) : 0;
  const service = cart.length ? Math.max(0.99, subtotal * 0.06) : 0;
  const soloEquivalent = cart.length ? subtotal + 6.99 + Math.max(1.99, subtotal * 0.12) : 0;
  const total = subtotal + sharedDelivery + service;
  const saving = Math.max(0, soloEquivalent - total);
  return { subtotal, sharedDelivery, service, total, saving };
}

function renderCart() {
  cartCount.textContent = cart.length;
  const fees = cartFees();
  cartTotal.textContent = money(fees.total);
  floatingCount.textContent = `${cart.length} ${cart.length === 1 ? "item" : "items"}`;
  floatingTotal.textContent = money(fees.total);
  floatingCheckout.hidden = cart.length === 0;
  foodSubtotal.textContent = money(fees.subtotal);
  sharedDeliveryFee.textContent = money(fees.sharedDelivery);
  serviceFee.textContent = money(fees.service);
  estimatedSaving.textContent = money(fees.saving);
  checkoutButton.disabled = cart.length === 0;

  if (!cart.length) {
    cartItems.className = "cart-empty";
    cartItems.textContent = "Your selected meals will appear here.";
    return;
  }

  cartItems.className = "";
  cartItems.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-line">
          <div><strong>${item.name}</strong><br><small>${item.restaurant}</small></div>
          <strong>${money(item.price)}</strong>
        </div>
      `
    )
    .join("");
}

function renderCheckoutDrawer() {
  const fees = cartFees();
  checkoutItems.innerHTML = cart
    .map(
      (item) => `
        <div class="checkout-line">
          <span>${item.name}</span>
          <strong>${money(item.price)}</strong>
        </div>
      `
    )
    .join("");
  document.querySelector("#drawerFoodSubtotal").textContent = money(fees.subtotal);
  document.querySelector("#drawerSharedDelivery").textContent = money(fees.sharedDelivery);
  document.querySelector("#drawerServiceFee").textContent = money(fees.service);
  document.querySelector("#drawerSaving").textContent = money(fees.saving);
  document.querySelector("#drawerTotal").textContent = money(fees.total);
}

function openCheckout() {
  if (!cart.length) return;
  renderCheckoutDrawer();
  checkoutDrawer.classList.add("open");
  checkoutDrawer.setAttribute("aria-hidden", "false");
}

function closeCheckout() {
  checkoutDrawer.classList.remove("open");
  checkoutDrawer.setAttribute("aria-hidden", "true");
}

function renderLatestOrder() {
  if (!latestOrder) return;
  orderStatusPill.textContent = latestOrder.id;
  orderSummary.innerHTML = `
    <strong>${latestOrder.items.length} ${latestOrder.items.length === 1 ? "combo" : "combos"} · ${latestOrder.pickup.name}</strong>
    <span>Pickup at ${latestOrder.pickup.eta} · Total ${money(latestOrder.total)} · Saved ${money(latestOrder.saving)}</span>
  `;
  orderSteps.innerHTML = `
    <div class="step done"><span></span><strong>Joined</strong><small>Just now</small></div>
    <div class="step active"><span></span><strong>Waiting for group</strong><small>${latestOrder.items.length}/8 items</small></div>
    <div class="step"><span></span><strong>Restaurant prep</strong><small>Starts after grouping</small></div>
    <div class="step"><span></span><strong>On the way</strong><small>${latestOrder.pickup.name}</small></div>
    <div class="step"><span></span><strong>Ready for pickup</strong><small>${latestOrder.pickup.eta}</small></div>
  `;
}

function confirmOrder() {
  if (!cart.length) return;
  const fees = cartFees();
  const pickup = pickupPoints[Number(checkoutPickup.value)] || pickupPoints[0];
  latestOrder = {
    id: `MC-${String(Date.now()).slice(-5)}`,
    items: [...cart],
    pickup,
    contact: checkoutContact.value.trim(),
    total: fees.total,
    saving: fees.saving
  };
  cart.length = 0;
  renderCart();
  renderLatestOrder();
  closeCheckout();
  showToast(`Order ${latestOrder.id} created. Pickup at ${pickup.name} around ${pickup.eta}.`);
  document.querySelector("#orders").scrollIntoView({ behavior: "smooth", block: "start" });
}

function setFilter(nextFilter) {
  activeFilter = nextFilter;
  document.querySelectorAll(".chip").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === activeFilter);
  });
  renderGroups();
  renderMenu();
}

function setSort(nextSort) {
  activeSort = nextSort;
  document.querySelectorAll("[data-sort]").forEach((button) => {
    button.classList.toggle("active", button.dataset.sort === activeSort);
  });
  renderGroups();
}

function clearMarkers() {
  markers.forEach((marker) => marker.setMap(null));
  markers = [];
}

function addMarker(position, title, color, label) {
  const marker = new google.maps.Marker({
    position,
    map,
    title,
    label: { text: label, color: "#ffffff", fontWeight: "800" },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 3,
      scale: 12
    }
  });
  markers.push(marker);
  marker.addListener("click", () => {
    infoWindow.setContent(`<strong>${title}</strong>`);
    infoWindow.open({ anchor: marker, map });
  });
}

function renderMapData() {
  if (!map || !window.google) return;
  clearMarkers();
  groups.forEach((group) => {
    if (group.position) {
      addMarker(group.position, group.restaurant, group.color, group.badge.slice(0, 1));
    }
  });
  pickupPoints.forEach((point, index) => {
    addMarker(point.position, point.name, "#17211d", String(index + 1));
  });
}

function applyPlacesResults(results, center) {
  const restaurants = results
    .filter((place) => place.geometry?.location && place.business_status !== "CLOSED_PERMANENTLY")
    .slice(0, 9);

  if (!restaurants.length) {
    setMapStatus("No nearby restaurants found", "warn");
    showToast("Google Places returned no nearby restaurants, so fallback data is still shown.");
    return;
  }

  groups = restaurants.map((place, index) => placeToGroup(place, index, center));
  menu = groups.map(groupToMenuItem);
  setMapStatus("Live restaurants from Google Places", "ok");
  mapFallback.hidden = true;
  renderGroups();
  renderMenu();
  renderMapData();
}

function searchNearbyRestaurants(center, keyword = "restaurant") {
  if (!placesService) return;
  setMapStatus("Loading nearby restaurants", "loading");
  placesService.nearbySearch(
    {
      location: center,
      radius: radiusMeters,
      type: "restaurant",
      keyword,
      openNow: false
    },
    (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        applyPlacesResults(results, center);
        return;
      }
      setMapStatus(`Places returned ${status}`, "warn");
      showToast("Live restaurant data is unavailable, so fallback data is still shown.");
    }
  );
}

function geocodeAndSearch(address, keyword) {
  if (!geocoder || !map) return;
  setMapStatus("Locating address", "loading");
  geocoder.geocode({ address }, (results, status) => {
    if (status !== "OK" || !results?.[0]) {
      setMapStatus(`Address lookup failed: ${status}`, "warn");
      showToast("Address lookup failed. Try another US address.");
      return;
    }
    const location = results[0].geometry.location;
    const center = { lat: location.lat(), lng: location.lng() };
    map.setCenter(center);
    map.setZoom(14);
    searchNearbyRestaurants(center, keyword || "restaurant");
  });
}

window.initMealCrewMap = function initMealCrewMap() {
  map = new google.maps.Map(document.querySelector("#map"), {
    center: defaultCenter,
    zoom: 14,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false
  });
  geocoder = new google.maps.Geocoder();
  placesService = new google.maps.places.PlacesService(map);
  infoWindow = new google.maps.InfoWindow();
  mapFallback.hidden = true;
  setMapStatus("Google Map connected", "ok");
  renderMapData();
  searchNearbyRestaurants(defaultCenter);
};

function loadGoogleMaps() {
  const key = config.GOOGLE_MAPS_API_KEY;
  if (!key) {
    setMapStatus("Missing Google Maps key", "warn");
    renderMapData();
    return;
  }

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&libraries=places&callback=initMealCrewMap`;
  script.async = true;
  script.onerror = () => {
    setMapStatus("Google Maps failed to load", "warn");
    showToast("Google Maps failed to load. Check your key, domain restrictions, and network.");
  };
  document.head.appendChild(script);
}

document.addEventListener("click", (event) => {
  const filterButton = event.target.closest("[data-filter]");
  const sortButton = event.target.closest("[data-sort]");
  const addButton = event.target.closest("[data-add]");
  const joinButton = event.target.closest("[data-join]");

  if (filterButton) {
    setFilter(filterButton.dataset.filter);
  }

  if (sortButton) {
    setSort(sortButton.dataset.sort);
  }

  if (addButton) {
    const item = menu.find((entry) => String(entry.id) === String(addButton.dataset.add));
    cart.push(item);
    renderCart();
    showToast(`${item.name} added to your group cart`);
  }

  if (joinButton) {
    const group = groups.find((entry) => String(entry.id) === String(joinButton.dataset.join));
    showToast(`Opened the group menu for ${group.restaurant}`);
    document.querySelector("#restaurants").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

document.querySelector("#nearbyOnly").addEventListener("change", renderGroups);
document.querySelector("#closingSoon").addEventListener("change", renderGroups);

document.querySelector("#resetFilters").addEventListener("click", () => {
  document.querySelector("#nearbyOnly").checked = true;
  document.querySelector("#closingSoon").checked = false;
  setFilter("all");
});

document.querySelector("#searchButton").addEventListener("click", () => {
  const food = document.querySelector("#foodInput").value.trim();
  const address = document.querySelector("#addressInput").value.trim() || config.DEFAULT_ADDRESS;
  if (map && geocoder) {
    geocodeAndSearch(address, food || "restaurant");
    return;
  }
  showToast(config.GOOGLE_MAPS_API_KEY ? "The map is still loading. Try again shortly." : "Add your Google Maps API key in app-config.js first.");
});

document.querySelector("#randomPick").addEventListener("click", () => {
  const pool = activeFilter === "all" ? menu : menu.filter((item) => item.tag === activeFilter);
  const item = pool[Math.floor(Math.random() * pool.length)];
  cart.push(item);
  renderCart();
  showToast(`Picked ${item.name} for you`);
});

checkoutButton.addEventListener("click", openCheckout);
floatingCheckoutButton.addEventListener("click", openCheckout);

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-checkout]")) {
    closeCheckout();
  }
});

confirmOrderButton.addEventListener("click", confirmOrder);

pilotForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const lead = {
    role: document.querySelector("#pilotRole").value,
    name: document.querySelector("#pilotName").value.trim(),
    location: document.querySelector("#pilotLocation").value.trim(),
    cohort: document.querySelector("#pilotCohort").value
  };
  pilotLeads.push(lead);
  updatePilotCount();
  showToast(`Saved a ${lead.role} pilot lead in ${lead.location}`);
  pilotForm.reset();
  document.querySelector("#pilotLocation").value = "Brooklyn, NY";
});

document.querySelector("#addressInput").value = config.DEFAULT_ADDRESS || "Brooklyn, NY 11201";
renderGroups();
renderPainPoints();
renderMarketplaceLanes();
renderLaunchPlan();
renderMenu();
renderPickupList();
renderCart();
updatePilotCount();
loadGoogleMaps();
