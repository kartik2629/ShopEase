const firebaseConfig = {
  apiKey: "AIzaSyDWxYvv2sR9l0Vt_PYF4_hjvQF9VLcos8Y",
  authDomain: "shopease-p.firebaseapp.com",
  projectId: "shopease-p",
  storageBucket: "shopease-p.appspot.com",
  messagingSenderId: "752454172876",
  appId: "1:752454172876:web:b1fbfd81f9bc722b170269",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

function showPopup(message, redirect = null) {
  document.getElementById("popup-message").innerText = message;
  document.getElementById("popup").style.display = "flex";
  document.querySelector(".popup-content button").onclick = () => {
    closePopup();
    if (redirect) location.href = redirect;
  };
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

let allregdata = JSON.parse(localStorage.getItem("allregdata")) || [];

document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!name || !email || !password || !confirmPassword) {
    showPopup("Please fill in all fields!");
    return;
  }

  if (password !== confirmPassword) {
    showPopup("Passwords do not match!");
    return;
  }

  if (allregdata.some((user) => user.email === email)) {
    showPopup("User already registered! Redirecting to login...", "login.html");
    return;
  }

  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordPattern.test(password)) {
    showPopup(
      "Password must be at least 8 characters long and contain both letters and numbers."
    );
    return;
  }

  allregdata.push({ name, email, password });
  localStorage.setItem("allregdata", JSON.stringify(allregdata));

  showPopup("Registration Successful! Redirecting to login...", "login.html");
});

document.getElementById("googleSignIn").addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth
    .signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          name: user.displayName,
          email: user.email,
        })
      );
      showPopup("Google Sign-In successful! Redirecting...", "home.html");
    })
    .catch((error) => {
      console.error("Google sign-in error:", error);
      showPopup("Google sign-in failed. Please try again.");
    });
});
