// cart.js

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const welcomeMsg = document.getElementById("welcomeMsg");
  const logoutBtn = document.getElementById("logout");
  const cartContainer = document.getElementById("cart-container");
  const emptyCartMsg = document.getElementById("empty-cart-msg");
  const cartSummary = document.getElementById("cart-summary");
  const totalPriceElement = document.getElementById("total-price");
  const checkoutBtn = document.getElementById("checkout-btn");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navLinks = document.getElementById("navLinks");
  const alertPopup = document.getElementById("apopup");
  const alertPopupOkBtn = document.getElementById("apopup-ok-btn");

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  } else {
    console.error("Hamburger button or nav links not found.");
  }

  if (!user || !user.name) {
    showAlertPopup("You need to log in to view your cart.", () => {
      window.location.href = "login.html";
    });
    if (cartContainer) cartContainer.classList.add("hidden");
    if (emptyCartMsg) emptyCartMsg.classList.add("hidden");
    if (cartSummary) cartSummary.classList.add("hidden");
    return;
  } else {
    if (welcomeMsg) {
      welcomeMsg.innerText = `Welcome, ${user.name}`;
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      showAlertPopup("You have logged out successfully!", () => {
        window.location.href = "login.html";
      });
    });
  }

  if (cartContainer && emptyCartMsg && cartSummary && totalPriceElement) {
    loadCartItems();
  } else {
    console.error(
      "Cart elements (container, empty message, summary, total price) not found."
    );
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      showAlertPopup("Checkout functionality is not implemented yet.");
    });
  }

  if (alertPopup && alertPopupOkBtn) {
    alertPopupOkBtn.addEventListener("click", closeAlertPopup);
  }
});

function formatPrice(price) {
  return `₹${price.toFixed(2)}`;
}

function loadCartItems() {
  const cartContainer = document.getElementById("cart-container");
  const emptyCartMsg = document.getElementById("empty-cart-msg");
  const cartSummary = document.getElementById("cart-summary");
  const totalPriceElement = document.getElementById("total-price");

  if (!cartContainer || !emptyCartMsg || !cartSummary || !totalPriceElement)
    return;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartContainer.innerHTML = "";
  let currentTotalPrice = 0;

  if (cart.length === 0) {
    emptyCartMsg.classList.remove("hidden");
    cartContainer.classList.add("hidden");
    cartSummary.classList.add("hidden");
  } else {
    emptyCartMsg.classList.add("hidden");
    cartContainer.classList.remove("hidden");
    cartSummary.classList.remove("hidden");

    cart.forEach((item) => {
      // Validate essential properties, including image now
      if (
        !item ||
        !item.id ||
        !item.name ||
        typeof item.price !== "number" ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0 ||
        !item.image
      ) {
        console.warn("Skipping invalid cart item:", item);
        // removeFromCart(item.id, true); // Optionally cleanup invalid items silently
        return;
      }

      const itemTotalPrice = item.price * item.quantity;
      currentTotalPrice += itemTotalPrice;

      const itemElement = document.createElement("div");
      itemElement.className = "cart-item";
      itemElement.dataset.itemId = item.id; // Ensure ID is stored as string

      const imageUrl = item.image; // Use image from cart item

      itemElement.innerHTML = `
        <div class="cart-item-image">
          <img src="${imageUrl}" alt="${
        item.name
      }" onerror="this.onerror=null;this.src='placeholder.png';">
        </div>
        <div class="cart-item-details">
          <h3>${item.name.substring(0, 50)}${
        item.name.length > 50 ? "..." : ""
      }</h3>
          <span class="item-price">Price: ${formatPrice(item.price)}</span>
        </div>
        <div class="quantity-controls">
          <button class="decrease-qty" data-id="${item.id}" ${
        item.quantity <= 1 ? "disabled" : ""
      }>-</button>
          <span class="item-quantity">${item.quantity}</span>
          <button class="increase-qty" data-id="${item.id}">+</button>
        </div>
        <span class="item-total-price">${formatPrice(itemTotalPrice)}</span>
        <button class="remove-item-btn" data-id="${item.id}">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;

      const decreaseBtn = itemElement.querySelector(".decrease-qty");
      const increaseBtn = itemElement.querySelector(".increase-qty");
      const removeBtn = itemElement.querySelector(".remove-item-btn");

      if (decreaseBtn) {
        decreaseBtn.addEventListener("click", (e) => {
          updateQuantity(e.currentTarget.dataset.id, -1);
        });
      }
      if (increaseBtn) {
        increaseBtn.addEventListener("click", (e) => {
          updateQuantity(e.currentTarget.dataset.id, 1);
        });
      }
      if (removeBtn) {
        removeBtn.addEventListener("click", (e) => {
          removeFromCart(e.currentTarget.dataset.id);
        });
      }

      cartContainer.appendChild(itemElement);
    });
  }

  totalPriceElement.innerText = formatPrice(currentTotalPrice);
}

function updateQuantity(id, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemIndex = cart.findIndex((item) => item.id === String(id)); // Ensure string comparison

  if (itemIndex > -1) {
    const newQuantity = cart[itemIndex].quantity + change;

    if (newQuantity <= 0) {
      removeFromCart(id);
    } else {
      cart[itemIndex].quantity = newQuantity;
      localStorage.setItem("cart", JSON.stringify(cart));
      loadCartItems();
    }
  } else {
    console.error(`Item with ID ${id} not found in cart for quantity update.`);
  }
}

function removeFromCart(id, silent = false) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const initialLength = cart.length;
  const stringId = String(id); // Ensure string comparison
  cart = cart.filter((item) => item.id !== stringId);

  if (cart.length < initialLength) {
    localStorage.setItem("cart", JSON.stringify(cart));
    if (!silent) {
      showAlertPopup("Item removed from Cart!");
    }
    loadCartItems();
  } else {
    if (!silent) {
      // Only show alert if item *should* have been found
      showAlertPopup("Could not find item to remove.");
    }
    console.warn(`Attempted to remove item ID ${id} which was not found.`);
  }
}

function showAlertPopup(message, callback = null) {
  const alertPopup = document.getElementById("apopup");
  const alertPopupMessage = document.getElementById("apopup-message");
  const alertPopupOkBtn = document.getElementById("apopup-ok-btn");

  if (!alertPopup || !alertPopupMessage || !alertPopupOkBtn) {
    console.error("Alert popup elements not found!");
    alert(message);
    if (typeof callback === "function") callback();
    return;
  }

  alertPopupMessage.innerText = message;
  alertPopup.classList.add("show");

  const newOkBtn = alertPopupOkBtn.cloneNode(true);
  alertPopupOkBtn.parentNode.replaceChild(newOkBtn, alertPopupOkBtn);

  newOkBtn.addEventListener(
    "click",
    () => {
      closeAlertPopup();
      if (typeof callback === "function") {
        callback();
      }
    },
    { once: true }
  );
}

function closeAlertPopup() {
  const alertPopup = document.getElementById("apopup");
  if (alertPopup) {
    alertPopup.classList.remove("show");
  }
}
