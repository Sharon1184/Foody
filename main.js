// 🔘 Cart Modal Logic
const cartIcon = document.querySelector('.toolbar-icon ion-icon[name="cart-outline"]');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');

cartIcon.parentElement.addEventListener('click', () => {
  cartModal.style.display = 'flex';
});

closeCart.addEventListener('click', () => {
  cartModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === cartModal) {
    cartModal.style.display = 'none';
  }
});
// ✅ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCV-S3g1v4yxQRaXYvXRUnfIuXzvdSDOjE",
  authDomain: "food-ae7ff.firebaseapp.com",
  projectId: "food-ae7ff",
  storageBucket: "food-ae7ff.appspot.com",
  messagingSenderId: "133155576693",
  appId: "1:133155576693:web:2b244c5142e79f5eaf48b2"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elements
const container = document.getElementById("recommended-items");
const categoryList = document.getElementById("category-list");

// Load and display food
let allFoods = [];

async function loadFoods() {
  const foodsRef = collection(db, "foods");
  const snapshot = await getDocs(foodsRef);
  allFoods = [];
  snapshot.forEach(doc => {
    allFoods.push({ id: doc.id, ...doc.data() });
  });
  displayFoods(allFoods);
  autoScrollCarousel();
}

// Display filtered foods
function displayFoods(foods) {
  container.innerHTML = "";
  if (foods.length === 0) {
    container.innerHTML = "<p>No items found.</p>";
    return;
  }

  foods.forEach(food => {
    const card = document.createElement("div");
    card.className = "food-card";
    card.innerHTML = `
      <img src="${food.imageUrl}" alt="${food.name}" />
      <h4>${food.name}</h4>
      <p>KES ${food.price}</p>
      <button>Add to Cart</button>
    `;
    container.appendChild(card);
  });
}

// Filter by category
categoryList.addEventListener("click", (e) => {
  if (e.target.classList.contains("category-card")) {
    document.querySelectorAll(".category-card").forEach(el => el.classList.remove("active"));
    e.target.classList.add("active");

    const category = e.target.dataset.category;
    if (category === "All") {
      displayFoods(allFoods);
    } else {
      const filtered = allFoods.filter(f => f.category === category);
      displayFoods(filtered);
    }
  }
});

// Infinite scroll carousel
function autoScrollCarousel() {
  const carousel = document.querySelector(".food-carousel");
  if (!carousel) return;

  let scrollAmount = 0;
  const cardWidth = 260;

  setInterval(() => {
    scrollAmount += cardWidth;
    if (scrollAmount >= carousel.scrollWidth - carousel.clientWidth) {
      scrollAmount = 0;
    }
    carousel.scrollTo({ left: scrollAmount, behavior: "smooth" });
  }, 5000);
}

// Start
loadFoods();
