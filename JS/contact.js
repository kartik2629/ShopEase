// contact.js

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const welcomeMsg = document.getElementById("welcomeMsg");
  const logoutBtn = document.getElementById("logout");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navLinks = document.getElementById("navLinks");
  const contactForm = document.getElementById("contactForm");
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

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const subjectInput = document.getElementById("subject");
      const messageInput = document.getElementById("message");

      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const subject = subjectInput ? subjectInput.value.trim() : "";
      const message = messageInput ? messageInput.value.trim() : "";

      if (!name || !email || !subject || !message) {
        showAlertPopup("Please fill out all fields in the form.");
        return;
      }

      // Basic email format check (optional but recommended)
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showAlertPopup("Please enter a valid email address.");
        return;
      }

      // Simulate form submission
      console.log("Form Submitted (Simulated):", {
        name,
        email,
        subject,
        message,
      });
      showAlertPopup(
        "Thank you for your message! We'll get back to you soon.",
        () => {
          // Optionally clear the form
          if (nameInput) nameInput.value = "";
          if (emailInput) emailInput.value = "";
          if (subjectInput) subjectInput.value = "";
          if (messageInput) messageInput.value = "";
        }
      );
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
