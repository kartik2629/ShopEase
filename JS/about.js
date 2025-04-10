// about.js

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const welcomeMsg = document.getElementById("welcomeMsg");
  const logoutBtn = document.getElementById("logout");
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
    showAlertPopup("Please log in to continue.", () => {
      window.location.href = "login.html";
    });
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

  if (alertPopup && alertPopupOkBtn) {
    alertPopupOkBtn.addEventListener("click", closeAlertPopup);
  }
});

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
