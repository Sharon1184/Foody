// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDPBY9XpI4azrNuAjYJ9QYSGyAtUSr9NQQ",
  authDomain: "food-ae7ff.firebaseapp.com",
  projectId: "food-ae7ff",
  storageBucket: "food-ae7ff.appspot.com",
  messagingSenderId: "587400772240",
  appId: "1:587400772240:web:3d0e31f4c5e24ea8b90be5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

document.addEventListener('DOMContentLoaded', () => {
  loadFoods();
});

function loadFoods() {
  db.collection("foods").get().then(snapshot => {
    const foodList = document.getElementById("food-list");
    const featured = document.getElementById("featured-container");
    foodList.innerHTML = "";
    featured.innerHTML = "";

    snapshot.forEach(doc => {
      const food = doc.data();
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${food.imageUrl}" alt="${food.name}">
        <h3>${food.name}</h3>
        <p>Ksh ${food.price}</p>
        <button onclick="addToCart('${doc.id}')">Add to Cart</button>
      `;
      foodList.appendChild(card);

      // Randomly add to featured
      if (Math.random() < 0.3) {
        featured.appendChild(card.cloneNode(true));
      }
    });
  });
}

function filterByCategory(category) {
  alert("Filter by: " + category);
}

function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(id);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart!");
                     }
