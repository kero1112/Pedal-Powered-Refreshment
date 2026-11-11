// index.js - menu tabs, ingredient pop up and order customization pop up
const tabs = document.querySelectorAll(".tab");
const menuCards = document.querySelectorAll(".menu-card");
const overlays = document.querySelectorAll(".overlay");

const closeAll = () => {
  overlays.forEach((overlay) => overlay.classList.remove("show"));
};

const openPopup = (id) => {
  closeAll();
  document.getElementById(id).classList.add("show");
};

// tabs: show only the chosen category
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const filter = tab.dataset.filter;
    menuCards.forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.category !== filter;
    });
    tabs.forEach((other) => {
      other.className = "tab";
    });
    tab.className = "tab tab-on";
  });
});

// open and close buttons of the pop ups
document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => openPopup(button.dataset.open));
});
document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", closeAll);
});
overlays.forEach((overlay) => {
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeAll();
  });
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeAll();
});

// highlight the chosen option in a group (size, sugar, add-on)
const markSelected = (group) => {
  const onClass = group.dataset.on;
  group.querySelectorAll("label").forEach((label) => label.classList.remove(onClass));
  const checked = group.querySelector("input:checked");
  if (checked) checked.parentElement.classList.add(onClass);
};

// read the choices of one order pop up and compute the prices
const readChoices = (popup) => {
  const { medium, large } = popup.dataset;
  const size = popup.querySelector("[name^='size']:checked");
  const addon = popup.querySelector("[name^='addon']:checked");
  const sugar = popup.querySelector("[name^='sugar']:checked");
  const qtyInput = popup.querySelector(".qty-input");
  const qty = Math.min(20, Math.max(1, Number(qtyInput.value) || 1));
  qtyInput.value = qty;
  const basePrice = Number(size.value === "large" ? large : medium);
  const addonPrice = Number(addon.dataset.price);
  return { size, addon, sugar, qty, basePrice, addonPrice, each: basePrice + addonPrice, total: (basePrice + addonPrice) * qty };
};

const updatePopup = (popup) => {
  popup.querySelectorAll(".group").forEach(markSelected);
  const { addon, sugar, qty, basePrice, addonPrice, each, total } = readChoices(popup);
  const addonText = addonPrice > 0 ? ` + ${addon.dataset.name} ₱${addonPrice}` : "";
  popup.querySelector(".sugar-text").textContent = `${sugar.value} · ${sugar.dataset.meaning}`;
  popup.querySelector(".each-text").textContent = `₱${each} each${addonPrice > 0 ? ", with add-on" : ""}`;
  popup.querySelector(".sum-text").textContent = `(₱${basePrice}${addonText}) × ${qty} ${qty === 1 ? "cup" : "cups"}`;
  popup.querySelector(".total-text").textContent = `₱${total}`;
  popup.querySelector(".add-btn").textContent = `Add ${qty} to your order · ₱${total}`;
};

document.querySelectorAll(".order-popup").forEach((popup) => {
  const qtyInput = popup.querySelector(".qty-input");
  popup.addEventListener("change", () => updatePopup(popup));
  popup.querySelector(".minus").addEventListener("click", () => {
    qtyInput.value = Number(qtyInput.value) - 1;
    updatePopup(popup);
  });
  popup.querySelector(".plus").addEventListener("click", () => {
    qtyInput.value = Number(qtyInput.value) + 1;
    updatePopup(popup);
  });
  popup.querySelector(".add-btn").addEventListener("click", () => {
    const { name, category } = popup.dataset;
    const { size, addon, sugar, qty, basePrice, addonPrice } = readChoices(popup);
    addToCart({
      name,
      category,
      size: size.value === "large" ? "Large 22 oz" : "Medium 16 oz",
      basePrice,
      addon: addon.dataset.name,
      addonPrice,
      sugar: sugar.value,
      qty
    });
    closeAll();
    alert(`${qty} × ${name} was added to your order.`);
  });
  updatePopup(popup);
});
