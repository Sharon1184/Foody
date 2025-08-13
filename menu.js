// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCV-S3g1v4yxQRaXYvXRUnfIuXzvdSDOjE",
    authDomain: "food-ae7ff.firebaseapp.com",
    projectId: "food-ae7ff",
    storageBucket: "food-ae7ff.appspot.com",
    messagingSenderId: "133155576693",
    appId: "1:133155576693:web:2b244c5142e79f5eaf48b2"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM elements
const menuList = document.getElementById('menu-list');

// Function to fetch and display all foods
async function fetchAndDisplayFoods() {
    try {
        const foodCollection = collection(db, 'foods');
        const foodSnapshot = await getDocs(foodCollection);

        if (foodSnapshot.empty) {
            menuList.innerHTML = '<p>No food items found.</p>';
            return;
        }

        menuList.innerHTML = '';
        foodSnapshot.forEach(doc => {
            const food = doc.data();
            const foodId = doc.id;
            
            const foodCard = document.createElement('a');
            foodCard.classList.add('food-card');
            foodCard.href = `food-details.html?id=${foodId}`;
            
            foodCard.innerHTML = `
                <img src="${food.imageUrl}" alt="${food.name}" class="food-img">
                <div class="food-info">
                    <h4>${food.name}</h4>
                    <p class="food-desc">${food.restaurantName || 'Restaurant'}</p>
                    <div class="food-meta">
                        <span><ion-icon name="star"></ion-icon> ${food.rating || 'N/A'}</span>
                        <span><ion-icon name="bicycle-outline"></ion-icon> ${food.deliveryTime || 'N/A'} min</span>
                    </div>
                    <p class="food-price">KES ${food.price.toFixed(2)}</p>
                </div>
            `;
            menuList.appendChild(foodCard);
        });

    } catch (error) {
        console.error("Error fetching foods: ", error);
        menuList.innerHTML = '<p>Error loading food items. Please try again later.</p>';
    }
}

// Function to update cart count (reused from other pages for consistency)
function updateCartCount() {
    // Implement your cart count logic here if needed
}

// Event listener to run on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayFoods();
    updateCartCount();
});
