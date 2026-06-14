const groups = [
  {
    id: 1,
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
    color: "#c74237"
  },
  {
    id: 2,
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
    color: "#126b4f"
  },
  {
    id: 3,
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
    color: "#3867b7"
  }
];

const menu = [
  { id: 101, tag: "asian", name: "麻辣香锅单人套餐", restaurant: "Chengdu Kitchen", price: 16.5, initial: "麻" },
  { id: 102, tag: "asian", name: "照烧鸡腿饭 + 味增汤", restaurant: "Tokyo Counter", price: 14.9, initial: "照" },
  { id: 103, tag: "healthy", name: "Salmon grain bowl", restaurant: "Green Bento", price: 15.7, initial: "S" },
  { id: 104, tag: "late", name: "Crispy chicken combo", restaurant: "Bird & Bun", price: 13.8, initial: "C" },
  { id: 105, tag: "asian", name: "珍珠奶茶四杯拼", restaurant: "Milk Lab", price: 18.0, initial: "茶" }
];

let activeFilter = "all";
const cart = [];

const groupGrid = document.querySelector("#groupGrid");
const menuList = document.querySelector("#menuList");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const checkoutButton = document.querySelector("#checkoutButton");
const toast = document.querySelector("#toast");

function money(value) {
  return `$${value.toFixed(2)}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function filteredGroups() {
  const nearbyOnly = document.querySelector("#nearbyOnly").checked;
  const closingSoon = document.querySelector("#closingSoon").checked;
  return groups.filter((group) => {
    const matchesType = activeFilter === "all" || group.tag === activeFilter;
    const matchesDistance = !nearbyOnly || group.distance <= 1.5;
    const minutes = Number.parseInt(group.cutoff, 10);
    const matchesCutoff = !closingSoon || minutes <= 15;
    return matchesType && matchesDistance && matchesCutoff;
  });
}

function renderGroups() {
  const items = filteredGroups();
  groupGrid.innerHTML = items
    .map((group) => {
      const progress = Math.min(100, Math.round((group.joined / group.needed) * 100));
      return `
        <article class="group-card">
          <div class="group-top">
            <div class="restaurant-badge" style="background:${group.color}">${group.badge}</div>
            <div class="timer">${group.cutoff}</div>
          </div>
          <div>
            <h3>${group.name}</h3>
            <div class="meta">${group.restaurant} · ${group.area} · ${group.distance} mi</div>
          </div>
          <div class="progress-row">
            <div class="progress-label">
              <span>${group.joined}/${group.needed} 人已加入</span>
              <strong>${progress}%</strong>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
          </div>
          <div class="group-footer">
            <div>
              <div class="price">${money(group.minimum)}+</div>
              <div class="meta">配送费约 ${money(group.delivery)}/人</div>
            </div>
            <button class="ghost-button" type="button" data-join="${group.id}">查看</button>
          </div>
        </article>
      `;
    })
    .join("");

  if (!items.length) {
    groupGrid.innerHTML = `<div class="panel">当前筛选下没有拼单，换个条件看看。</div>`;
  }
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
          <button class="add-button" type="button" aria-label="加入 ${item.name}" data-add="${item.id}">+</button>
        </article>
      `
    )
    .join("");
}

function renderCart() {
  cartCount.textContent = cart.length;
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartTotal.textContent = money(total);
  checkoutButton.disabled = cart.length === 0;

  if (!cart.length) {
    cartItems.className = "cart-empty";
    cartItems.textContent = "选择套餐后会出现在这里。";
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

function setFilter(nextFilter) {
  activeFilter = nextFilter;
  document.querySelectorAll(".chip").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === activeFilter);
  });
  renderGroups();
  renderMenu();
}

document.addEventListener("click", (event) => {
  const filterButton = event.target.closest("[data-filter]");
  const addButton = event.target.closest("[data-add]");
  const joinButton = event.target.closest("[data-join]");

  if (filterButton) {
    setFilter(filterButton.dataset.filter);
  }

  if (addButton) {
    const item = menu.find((entry) => entry.id === Number(addButton.dataset.add));
    cart.push(item);
    renderCart();
    showToast(`${item.name} 已加入拼单车`);
  }

  if (joinButton) {
    const group = groups.find((entry) => entry.id === Number(joinButton.dataset.join));
    showToast(`已打开 ${group.restaurant} 的拼单菜单`);
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
  showToast(food ? `正在为你找 ${food} 拼单` : "正在刷新附近拼单");
});

document.querySelector("#randomPick").addEventListener("click", () => {
  const pool = activeFilter === "all" ? menu : menu.filter((item) => item.tag === activeFilter);
  const item = pool[Math.floor(Math.random() * pool.length)];
  cart.push(item);
  renderCart();
  showToast(`已帮你选择 ${item.name}`);
});

checkoutButton.addEventListener("click", () => {
  showToast("已提交拼单请求，成团后会通知你付款。");
});

renderGroups();
renderMenu();
renderCart();
