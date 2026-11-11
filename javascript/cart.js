// cart.js - the order list is saved in localStorage so all pages can use it
const CART_KEY = "caseStudyCart";

const loadCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
};

let cart = loadCart();

const getTotals = () => {
  const drinks = cart.reduce((sum, { basePrice, qty }) => sum + basePrice * qty, 0);
  const addons = cart.reduce((sum, { addonPrice, qty }) => sum + addonPrice * qty, 0);
  const count = cart.reduce((sum, { qty }) => sum + qty, 0);
  return { drinks, addons, count, total: drinks + addons };
};

const updateCartCount = () => {
  const { count } = getTotals();
  document.querySelectorAll(".cart-count").forEach((badge) => {
    badge.textContent = count;
  });
};

const saveCart = (items = cart) => {
  cart = items;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    // storage is not available, the cart stays in memory only
  }
  updateCartCount();
};

const addToCart = (newItem) => {
  const sameIndex = cart.findIndex((item) => item.name === newItem.name && item.size === newItem.size && item.addon === newItem.addon && item.sugar === newItem.sugar);
  if (sameIndex === -1) {
    saveCart([...cart, newItem]);
  } else {
    saveCart(cart.map((item, index) => (index === sameIndex ? { ...item, qty: item.qty + newItem.qty } : item)));
  }
};

updateCartCount();
window.addEventListener("load", updateCartCount);
