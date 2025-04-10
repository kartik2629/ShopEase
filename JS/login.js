// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWxYvv2sR9l0Vt_PYF4_hjvQF9VLcos8Y",
  authDomain: "shopease-p.firebaseapp.com",
  projectId: "shopease-p",
  storageBucket: "shopease-p.appspot.com",
  messagingSenderId: "752454172876",
  appId: "1:752454172876:web:b1fbfd81f9bc722b170269",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Toggle password visibility
function togglePassword(id) {
  let input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

// Show popup message
function showPopup(message, callback) {
  document.getElementById("popup-message").innerText = message;
  const popup = document.getElementById("popup");
  popup.classList.add("show");

  const btn = document.getElementById("popup-ok-btn");

  function closePopup() {
    popup.classList.remove("show");
    btn.removeEventListener("click", closePopup);
    if (callback) callback();
  }

  btn.addEventListener("click", closePopup);
}

// Manual Login (localStorage)
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  

  if (!email || !password) {
    showPopup("Please fill in both fields!");
    return;
  }

  let allregdata = localStorage.getItem("allregdata");
  allregdata = allregdata ? JSON.parse(allregdata) : [];

  let user = allregdata.find((user) => user.email === email);

  if (!user) {
    showPopup("User not found! Redirecting to register...", () => {
      location.href = "register.html";
    });
    return;
  }

  if (user.password !== password) {
    showPopup("Incorrect password!");
    return;
  }

  localStorage.setItem("loggedInUser", JSON.stringify(user));
  showPopup("Login successful! Redirecting to Home...", () => {
    location.href = "home.html";
  });
});

// Google Sign-In with Firebase
document.getElementById("googleSignIn").addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth
    .signInWithPopup(provider)
    .then((result) => {
      const user = result.user;

      // Optional: Save user to localStorage
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          email: user.email,
          name: user.displayName,
        })
      );

      showPopup("Google Login successful! Redirecting to Home...", () => {
        location.href = "home.html";
      });
    })
    .catch((error) => {
      console.error("Google sign-in error:", error);
      showPopup("Google sign-in failed. Try again!");
    });
});
//passwordvalidation 