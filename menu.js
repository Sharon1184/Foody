// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHhmbgDA_D13LcnEWgtr5Unu7uihBpGPE",
  authDomain: "food-ae7ff.firebaseapp.com",
  projectId: "food-ae7ff",
  storageBucket: "food-ae7ff.firebasestorage.app",
  messagingSenderId: "1058214228504",
  appId: "1:1058214228504:web:f1f059be00c9aeaf7cc96d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const menuList = document.getElementById('menu-list');
const CACHE_KEY = 'kibandaski_menu_cache';
const CACHE_EXPIRY_MS = 3600000; // 1 hour

// Function to generate the HTML for a single food card
function createFoodCard(food) {
    return `
        <div class="food-card" data-food-id="${food.id}">
            <button class="favorite-btn">
                <ion-icon name="heart-outline"></ion-icon>
            </button>
            <img class="food-img" src="${food.img}" alt="${food.name}">
            <div class="food-info">
                <h4>${food.name}</h4>
                <p class="food-desc">${food.desc}</p>
                <div class="food-meta">
                    <span><ion-icon name="star"></ion-icon> ${food.rating}</span>
                    <span><ion-icon name="time"></ion-icon> ${food.time} min</span>
                </div>
                <div class="food-actions">
                    <span class="food-price">KES ${food.price.toFixed(2)}</span>
                    <button class="buy-now-btn">Buy Now</button>
                    <button class="add-to-cart-btn">
                        <ion-icon name="cart-outline"></ion-icon>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Function to attach all event listeners to the food cards
function attachEventListeners() {
    // Add to Cart button handler
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const foodCard = event.target.closest('.food-card');
            const foodId = foodCard.getAttribute('data-food-id');
            console.log(`Add to cart clicked for food ID: ${foodId}`);
            alert(`Added item to cart!`);
        });
    });

    // Buy Now button handler
    document.querySelectorAll('.buy-now-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const foodCard = event.target.closest('.food-card');
            const foodId = foodCard.getAttribute('data-food-id');
            console.log(`Buy now clicked for food ID: ${foodId}`);
            alert(`Redirecting to checkout for item: ${foodId}`);
        });
    });

    // Favorite button handler
    document.querySelectorAll('.favorite-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const foodCard = event.target.closest('.food-card');
            const foodId = foodCard.getAttribute('data-food-id');
            
            button.classList.toggle('active');
            const isFavorite = button.classList.contains('active');
            const icon = button.querySelector('ion-icon');
            icon.setAttribute('name', isFavorite ? 'heart' : 'heart-outline');
            
            console.log(`Favorite status updated for food ID: ${foodId}`);
            alert(`Favorite status updated for item: ${foodId}`);
        });
    });
}

// Main function to load and render food cards
async function renderFoodCards() {
    menuList.innerHTML = '<p>Loading menu...</p>';
    let foodData = [];

    // Try to load from local storage
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        const { timestamp, foods } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY_MS) {
            console.log('Using cached data from local storage.');
            foodData = foods;
        } else {
            console.log('Cached data expired. Fetching from Firebase.');
            localStorage.removeItem(CACHE_KEY); // Clear stale cache
        }
    }

    // If local storage didn't have valid data, fetch from Firebase
    if (foodData.length === 0) {
        try {
            const foodCollection = collection(db, "foods");
            const foodSnapshot = await getDocs(foodCollection);
            foodData = foodSnapshot.docs.map(doc => {
                return { id: doc.id, ...doc.data() };
            });

            // Save the new data to local storage with a timestamp
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                foods: foodData
            }));
            console.log('Fetched data from Firebase and saved to local storage.');

        } catch (error) {
            console.error("Error fetching food items: ", error);
            menuList.innerHTML = '<p>Error loading menu. Please try again later.</p>';
            return;
        }
    }

    // Render the food cards using the retrieved data
    if (foodData.length > 0) {
        const foodCardsHTML = foodData.map(food => createFoodCard(food)).join('');
        menuList.innerHTML = foodCardsHTML;
        attachEventListeners();
    } else {
        menuList.innerHTML = '<p>No food items found.</p>';
    }
}

// Render food cards when the page loads
document.addEventListener('DOMContentLoaded', renderFoodCards);
