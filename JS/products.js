// products.js

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const welcomeMsg = document.getElementById("welcomeMsg");
  const logoutBtn = document.getElementById("logout");
  const productsContainer = document.getElementById("products-container");
  const loader = document.getElementById("loader");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navLinks = document.getElementById("navLinks");
  const popup = document.getElementById("popup");
  const popupCloseBtn = document.getElementById("popup-close");
  const alertPopup = document.getElementById("apopup");
  const alertPopupMessage = document.getElementById("apopup-message");
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
    if (loader) loader.classList.add("hidden");
    if (productsContainer) productsContainer.innerHTML = "";
    return;
  } else {
    if (welcomeMsg) {
      welcomeMsg.innerText = `Welcome, ${user.name}`;
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("wishlist");
      localStorage.removeItem("cart");
      showAlertPopup("You have logged out successfully!", () => {
        window.location.href = "login.html";
      });
    });
  }

  if (productsContainer && loader) {
    fetch("https://fakestoreapi.com/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((products) => {
        loader.classList.add("hidden");
        showProducts(products);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        loader.classList.add("hidden");
        if (productsContainer) {
          productsContainer.innerHTML = `<p class="error-message">Failed to load products. ${error.message}. Please try again later.</p>`;
        }
      });
  } else {
    console.error("Products container or loader element not found.");
  }

  if (popup && popupCloseBtn) {
    popupCloseBtn.addEventListener("click", () => {
      popup.classList.remove("show");
    });
    popup.addEventListener("click", (event) => {
      if (event.target === popup) {
        popup.classList.remove("show");
      }
    });
  }

  if (alertPopup && alertPopupOkBtn) {
    alertPopupOkBtn.addEventListener("click", closeAlertPopup);
  }
});

function showProducts(products) {
  const container = document.getElementById("products-container");
  if (!container) return;

  container.innerHTML = "";
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const cart = JSON.parse(localStorage.getItem("cart")) || []; // Get cart data once

  products.forEach((product, index) => {
    if (
      !product ||
      !product.id ||
      !product.title ||
      !product.image ||
      typeof product.price !== "number"
    ) {
      console.warn("Skipping invalid product data:", product);
      return;
    }

    let priceInRupees = (product.price * 85).toFixed(2);
    const productIdStr = String(product.id);
    const isInWishlist = wishlist.some((item) => item.id === productIdStr);
    const isInCart = cart.some((item) => item.id === productIdStr); // Check if in cart

    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.productId = productIdStr;
    card.style.animationDelay = `${index * 0.05}s`;

    card.innerHTML = `
      <img src="${product.image}" alt="${
      product.title
    }" onerror="this.onerror=null;this.src='placeholder.png';">
      <h3>${product.title.substring(0, 30)}${
      product.title.length > 30 ? "..." : ""
    }</h3>
      <p class="description">${product.description.substring(0, 60)}${
      product.description.length > 60 ? "..." : ""
    }</p>
      <span class="price">₹${priceInRupees}</span>
      <div class="product-actions">
        <button class="wishlist-btn" data-id="${productIdStr}" data-name="${product.title.replace(
      /'/g,
      "\\'"
    )}" data-image="${product.image}" data-price="${parseFloat(priceInRupees)}">
           ${
             isInWishlist
               ? '<i class="fa-solid fa-check"></i> In Wishlist'
               : '<i class="fa-solid fa-heart"></i> Wishlist'
           }
        </button>
        <button class="cart-btn" data-id="${productIdStr}" data-name="${product.title.replace(
      /'/g,
      "\\'"
    )}" data-price="${priceInRupees}" data-image="${product.image}">
           ${
             isInCart
               ? '<i class="fa-solid fa-check"></i> In Cart'
               : '<i class="fa-solid fa-cart-plus"></i> Add to Cart'
           }
        </button>
      </div>
    `;

    const wishlistBtn = card.querySelector(".wishlist-btn");
    const cartBtn = card.querySelector(".cart-btn");

    if (wishlistBtn) {
      if (isInWishlist) {
        wishlistBtn.disabled = true;
        wishlistBtn.classList.add("in-wishlist");
      } else {
        wishlistBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const button = e.currentTarget;
          const id = button.dataset.id;
          const name = button.dataset.name;
          const image = button.dataset.image;
          const price = parseFloat(button.dataset.price);
          addToWishlist(id, name, image, price);
        });
      }
    }

    if (cartBtn) {
      if (isInCart) {
        // Disable cart button if already in cart
        cartBtn.disabled = true;
        cartBtn.classList.add("in-cart");
      } else {
        // Otherwise, add the click listener
        cartBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const button = e.currentTarget;
          const id = button.dataset.id;
          const name = button.dataset.name;
          const price = parseFloat(button.dataset.price);
          const image = button.dataset.image;
          addToCart(id, name, price, image);
        });
      }
    }

    card.addEventListener("click", (e) => {
      if (
        !e.target.classList.contains("wishlist-btn") &&
        !e.target.classList.contains("cart-btn") &&
        !e.target.closest(".wishlist-btn") &&
        !e.target.closest(".cart-btn")
      ) {
        showProductPopup(product);
      }
    });

    container.appendChild(card);
  });
}

function addToWishlist(id, name, image, price) {
  if (
    !id ||
    !name ||
    !image ||
    price === undefined ||
    price === null ||
    isNaN(price)
  ) {
    console.error("Cannot add item to wishlist: Missing or invalid data", {
      id,
      name,
      image,
      price,
    });
    showAlertPopup("Could not add item to wishlist due to missing data.");
    return;
  }

  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const productIdStr = String(id);

  if (!wishlist.some((item) => item.id === productIdStr)) {
    wishlist.push({ id: productIdStr, name, image, price: parseFloat(price) });
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    showAlertPopup(`${name.substring(0, 20)}... added to Wishlist!`);

    const buttonOnCard = document.querySelector(
      `.product-card .wishlist-btn[data-id="${productIdStr}"]`
    );
    if (buttonOnCard) {
      buttonOnCard.disabled = true;
      buttonOnCard.innerHTML = '<i class="fa-solid fa-check"></i> In Wishlist';
      buttonOnCard.classList.add("in-wishlist");
    }
  } else {
    showAlertPopup(`${name.substring(0, 20)}... is already in your Wishlist.`);
  }
}

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
  const productIdStr = String(id);
  const existingItemIndex = cart.findIndex((item) => item.id === productIdStr);

  if (existingItemIndex === -1) {
    cart.push({
      id: productIdStr,
      name,
      price: parseFloat(price),
      quantity: 1,
      image,
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    showAlertPopup(`${name.substring(0, 20)}... added to Cart!`);

    // Disable the button on the card after adding
    const buttonOnCard = document.querySelector(
      `.product-card .cart-btn[data-id="${productIdStr}"]`
    );
    if (buttonOnCard) {
      buttonOnCard.disabled = true;
      buttonOnCard.innerHTML = '<i class="fa-solid fa-check"></i> In Cart';
      buttonOnCard.classList.add("in-cart");
    }
  } else {
    showAlertPopup(`${name.substring(0, 20)}... is already in your Cart.`);
  }
}

function showProductPopup(product) {
  const popup = document.getElementById("popup");
  if (!popup || !product) return;

  let priceInRupees = (product.price * 85).toFixed(2);

  const imgEl = popup.querySelector("img");
  const titleEl = popup.querySelector(".popup-title");
  const descEl = popup.querySelector(".popup-desc");
  const priceEl = popup.querySelector(".popup-price");
  const ratingEl = popup.querySelector(".popup-rating");

  if (imgEl) imgEl.src = product.image;
  if (imgEl) imgEl.alt = product.title;
  if (titleEl) titleEl.innerText = product.title;
  if (descEl) descEl.innerText = product.description;
  if (priceEl) priceEl.innerText = `Price: ₹${priceInRupees}`;
  if (ratingEl)
    ratingEl.innerText = `Rating: ${product.rating?.rate || "N/A"} / 5 (${
      product.rating?.count || 0
    } reviews)`;

  popup.classList.add("show");
}

function showAlertPopup(message, callback = null) {
  const alertPopup = document.getElementById("apopup");
  const alertPopupMessage = document.getElementById("apopup-message");
  const alertPopupOkBtn = document.getElementById("apopup-ok-btn");

  if (!alertPopup || !alertPopupMessage || !alertPopupOkBtn) {
    console.error("Alert popup elements not found!");
    alert(message);
    if (typeof callback === "function") {
      callback();
    }
    return;
  }

  alertPopupMessage.innerText = message;
  alertPopup.classList.add("show");

  const newOkBtn = alertPopupOkBtn.cloneNode(true);
  if (alertPopupOkBtn.parentNode) {
    alertPopupOkBtn.parentNode.replaceChild(newOkBtn, alertPopupOkBtn);
  } else {
    console.error("Alert popup OK button has no parent.");
    return;
  }

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
