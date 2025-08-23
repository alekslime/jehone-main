// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCv8lSB88CTogk3q3n8vuVrchjSnWsTFVU",
  authDomain: "voice-assistant-ee04a.firebaseapp.com",
  projectId: "voice-assistant-ee04a",
  storageBucket: "voice-assistant-ee04a.appspot.com",
  messagingSenderId: "173970485664",
  appId: "1:173970485664:web:1a086661e320845fe234c5",
  measurementId: "G-0806HZMJGN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.addEventListener("DOMContentLoaded", () => {
  const profileButton = document.getElementById("profileButton");
  const profileMenu = document.getElementById("profileMenu");
  const profileInitial = document.getElementById("profileInitial");
  const logoutButton = document.getElementById("logout");
  const goPremiumButton = document.getElementById("goPremium");

  // Show/hide profile dropdown
  if (profileButton && profileMenu) {
    profileButton.addEventListener("click", () => {
      const expanded = profileButton.getAttribute("aria-expanded") === "true";
      profileButton.setAttribute("aria-expanded", String(!expanded));
      profileMenu.style.display = expanded ? "none" : "block";
    });

    document.addEventListener("click", (event) => {
      if (
        !profileButton.contains(event.target) &&
        !profileMenu.contains(event.target)
      ) {
        profileButton.setAttribute("aria-expanded", "false");
        profileMenu.style.display = "none";
      }
    });
  }

  // Check auth state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Logged in user:", user.email);

      let email = user.email;
      if (!email && user.providerData && user.providerData.length > 0) {
        email = user.providerData[0].email;
      }

      if (email && profileInitial) {
        profileInitial.textContent = email[0].toUpperCase();
      } else {
        profileInitial.textContent = "?";
      }

    } else {
      console.log("No user signed in. Redirecting to login.");
      window.location.href = "login.html";
    }
  });

  // Logout
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      signOut(auth)
        .then(() => {
          console.log("Signed out.");
          window.location.href = "login.html";
        })
        .catch((error) => {
          console.error("Sign out error:", error);
        });
    });
  }

  // Placeholder
  if (goPremiumButton) {
    goPremiumButton.addEventListener("click", () => {
      alert("Go Premium coming soon!");
    });
  }

  // Capacitor plugin optional
  try {
    import('@capacitor-firebase/authentication').then(({ FirebaseAuthentication }) => {
      FirebaseAuthentication.addListener('authStateChange', state => {
        console.log('Capacitor auth change:', state);
      });

      window.signInWithGoogle = async () => {
        const result = await FirebaseAuthentication.signInWithGoogle();
        console.log('User:', result.user);
      };
    });
  } catch (e) {
    console.log("Capacitor Firebase plugin not available.");
  }
});