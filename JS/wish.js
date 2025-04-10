document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const welcomeMsg = document.getElementById("welcomeMsg");
  const logoutBtn = document.getElementById("logout");
  const wishlistContainer = document.getElementById("wishlist-container");
  const emptyWishlistMsg = document.getElementById("empty-wishlist-msg");
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
    showAlertPopup("You are not logged in. Redirecting to login page.", () => {
      window.location.href = "login.html";
    });
    if (wishlistContainer) wishlistContainer.classList.add("hidden");
    if (emptyWishlistMsg) emptyWishlistMsg.classList.add("hidden");
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

  if (wishlistContainer && emptyWishlistMsg) {
    loadWishlistItems();
  } else {
    console.error("Wishlist container or empty message element not found.");
  }

  if (alertPopup && alertPopupOkBtn) {
    alertPopupOkBtn.addEventListener("click", closeAlertPopup);
  }
});

function loadWishlistItems() {
  const wishlistContainer = document.getElementById("wishlist-container");
  const emptyWishlistMsg = document.getElementById("empty-wishlist-msg");
  if (!wishlistContainer || !emptyWishlistMsg) return;

  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  wishlistContainer.innerHTML = "";

  if (wishlist.length === 0) {
    emptyWishlistMsg.classList.remove("hidden");
    wishlistContainer.classList.add("hidden");
  } else {
    emptyWishlistMsg.classList.add("hidden");
    wishlistContainer.classList.remove("hidden");

    wishlist.forEach((item, index) => {
      if (
        !item ||
        !item.id ||
        !item.name ||
        !item.image ||
        typeof item.price !== "number"
      ) {
        console.warn("Skipping invalid wishlist item:", item);
        return;
      }

      const card = document.createElement("div");
      card.className = "wishlist-item-card";
      card.dataset.itemId = item.id;
      card.style.animationDelay = `${index * 0.05}s`;

      card.innerHTML = `
        <img src="${item.image}" alt="${
        item.name
      }" onerror="this.onerror=null;this.src='placeholder.png';">
        <h3>${item.name.substring(0, 40)}${
        item.name.length > 40 ? "..." : ""
      }</h3>
        <span class="price">₹${item.price.toFixed(2)}</span>
        <div class="wishlist-item-actions">
          <button class="remove-btn" data-id="${item.id}">
            <i class="fa-solid fa-trash-can"></i> Remove
          </button>
          <button class="cart-btn" data-id="${
            item.id
          }" data-name="${item.name.replace(
        /'/g,
        "\\'"
      )}" data-price="${item.price.toFixed(2)}" data-image="${item.image}">
             <i class="fa-solid fa-cart-plus"></i> Add to Cart
           </button>
        </div>
      `;

      const removeBtn = card.querySelector(".remove-btn");
      const cartBtn = card.querySelector(".cart-btn");

      if (removeBtn) {
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const itemId = e.currentTarget.dataset.id;
          removeFromWishlist(itemId);
        });
      }

      if (cartBtn) {
        cartBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const button = e.currentTarget;
          const id = button.dataset.id;
          const name = button.dataset.name;
          const price = parseFloat(button.dataset.price);
          const image = button.dataset.image; // Get image for cart
          addToCart(id, name, price, image); // Pass image to addToCart
        });
      }

      wishlistContainer.appendChild(card);
    });
  }
}

function removeFromWishlist(id) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const initialLength = wishlist.length;
  wishlist = wishlist.filter((item) => item.id !== id);

  if (wishlist.length < initialLength) {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    showAlertPopup("Item removed from Wishlist!");
    loadWishlistItems();
  } else {
    showAlertPopup("Could not find item to remove.");
  }
}

// Updated addToCart to accept and store image
function addToCart(id, name, price, image) {
  if (!id || !name || isNaN(price) || !image) {
    console.error("Cannot add item to cart: Missing or invalid data", {
      id,
      name,
      price,
      image,
    });
    showAlertPopup("Could not add item to cart due to missing data.");
    return;
  }

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItemIndex = cart.findIndex((item) => item.id === id);

  if (existingItemIndex === -1) {
    cart.push({ id, name, price: parseFloat(price), quantity: 1, image }); // Add image here
    localStorage.setItem("cart", JSON.stringify(cart));
    showAlertPopup(`${name.substring(0, 20)}... added to Cart!`);
  } else {
    showAlertPopup(`${name.substring(0, 20)}... is already in your Cart.`);
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
