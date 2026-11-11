// order.js - order summary, totals, download image and Facebook
const orderLines = document.getElementById("orderLines");
const pictureLines = document.getElementById("pictureLines");

const peso = (amount = 0) => `₱${amount}`;

const showOrder = () => {
  const { drinks, addons, count, total } = getTotals();
  if (cart.length === 0) {
    orderLines.innerHTML = '<p class="muted">Your order is empty. <a href="index.html#menu">Pick a drink from the menu.</a></p>';
  } else {
    orderLines.innerHTML = cart.map(({ name, category, size, basePrice, addon, addonPrice, sugar, qty }, index) => `
      <div class="line">
        <div class="line-icon">🧋</div>
        <div class="line-info">
          <strong>${name}</strong>
          <small class="line-small">${category} · ${size} · ${peso(basePrice)}</small>
          <small class="line-small">${addon ? `+ ${addon} ${peso(addonPrice)} / cup` : "No add-on"} · Sugar ${sugar}</small>
          <div class="stepper">
            <button type="button" class="step-btn" data-action="minus" data-index="${index}" aria-label="Less">−</button>
            <span>${qty}</span>
            <button type="button" class="step-btn" data-action="plus" data-index="${index}" aria-label="More">+</button>
          </div>
        </div>
        <div class="line-price">
          <strong class="line-total">${peso((basePrice + addonPrice) * qty)}</strong>
          ${peso(basePrice + addonPrice)} each${addon ? ", with add-on" : ""}<br>
          <a class="edit-link" href="index.html#menu">Edit</a>
          <button type="button" class="link-btn" data-action="remove" data-index="${index}">Remove</button>
        </div>
      </div>`).join("");
  }

  pictureLines.innerHTML = cart.map(({ name, size, basePrice, addon, addonPrice, qty }) => `
    <div class="picture-line">
      <div>
        <strong>${qty} × ${name}</strong>
        <small class="picture-small">${size} · Base ${peso(basePrice)} / cup</small>
        ${addon ? `<small class="picture-small">+ ${addon} ${peso(addonPrice)} / cup · ${peso(basePrice + addonPrice)} each</small>` : ""}
      </div>
      <strong>${peso((basePrice + addonPrice) * qty)}</strong>
    </div>`).join("");

  document.getElementById("drinkCount").textContent = `${count} drinks`;
  document.getElementById("drinksTotal").textContent = peso(drinks);
  document.getElementById("addonsText").textContent = `Selected add-ons · ${count} servings`;
  document.getElementById("addonsTotal").textContent = peso(addons);
  document.getElementById("grandTotal").textContent = peso(total);
  document.getElementById("pictureInfo").textContent = `SAMPLE PP 1024 · ${count} drinks · ${cart.length} line items`;
  document.getElementById("pictureTotal").textContent = peso(total);
};

// plus, minus and remove buttons
orderLines.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const { action } = button.dataset;
  const index = Number(button.dataset.index);
  if (action === "remove") {
    if (!confirm(`Remove ${cart[index].name} from your order?`)) return;
    saveCart(cart.filter((item, position) => position !== index));
  } else {
    const change = action === "plus" ? 1 : -1;
    saveCart(cart.map((item, position) => (position === index ? { ...item, qty: Math.max(1, item.qty + change) } : item)));
  }
  showOrder();
});

// draw the order picture on a canvas and download it
const drawPicture = (customerName = "Guest") => {
  const { total, count } = getTotals();
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 300 + cart.length * 70 + 120;
  const ctx = canvas.getContext("2d");
  const write = (text, x, y, font, color, align = "left") => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
  };
  ctx.fillStyle = "#f6f2e6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  write("My happy order", 40, 70, "bold 34px Georgia", "#1b4332");
  write(`Pedal-Powered Refreshment · DRAFT · ${count} drinks · for ${customerName}`, 40, 100, "16px Arial", "#6b7468");
  cart.forEach(({ name, size, addon, sugar, basePrice, addonPrice, qty }, index) => {
    const y = 150 + index * 70;
    write(`${qty} × ${name}`, 40, y, "bold 20px Arial", "#1d2b22");
    write(peso((basePrice + addonPrice) * qty), 680, y, "bold 20px Arial", "#1d2b22", "right");
    write(`${size}${addon ? ` + ${addon}` : ""} · Sugar ${sugar}`, 40, y + 24, "14px Arial", "#6b7468");
  });
  const endY = 150 + cart.length * 70;
  write("Estimated total", 40, endY + 40, "bold 30px Georgia", "#1b4332");
  write(peso(total), 680, endY + 40, "bold 30px Georgia", "#1b4332", "right");
  write("Not a confirmed order. Confirm availability, price, payment and pickup in Facebook chat.", 40, endY + 80, "13px Arial", "#6b7468");
  const link = document.createElement("a");
  link.download = "my-happy-order.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};

document.getElementById("downloadBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your order is empty. Please add a drink first.");
    return;
  }
  const customerName = prompt("Enter your name for the order picture:", "");
  if (customerName === null) return;
  drawPicture(customerName.trim() || "Guest");
});

document.getElementById("facebookBtn").addEventListener("click", () => {
  open("https://www.facebook.com/messages/", "_blank", "noopener");
});

showOrder();
