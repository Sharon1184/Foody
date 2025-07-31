// main.js

// Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, limit, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB0AgMRtZZ9OGVGbmvdrpoUcdERXKZNo6s",
  authDomain: "food-ae7ff.firebaseapp.com",
  projectId: "food-ae7ff",
  storageBucket: "food-ae7ff.appspot.com",
  messagingSenderId: "891566620460",
  appId: "1:891566620460:web:04d7f1e1a9ae6a60cb3ad4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Cart Data and Functions (Integrated) ---
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

function updateCartDisplay() {
    // UPDATED: Get references to the cart UI elements using their new standardized IDs from index.html
    const cartItemsContainer = document.getElementById('cartItems'); // Corrected ID
    const cartTotalSpan = document.getElementById('cartTotal');       // Corrected ID
    const cartBadge = document.getElementById('cartBadge');

    if (!cartItemsContainer || !cartTotalSpan) {
        return;
    }

    let total = 0;
    cartItemsContainer.innerHTML = '';

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p>No items in cart.</p>';
    } else {
        cartItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const cartItemHtml = `
                <div class="cart-item">
                    <img src="${item.imageUrl}" alt="${item.name}">
                    <div class="item-details">
                        <h5>${item.name}</h5>
                        <p>KES ${item.price.toFixed(2)}</p>
                    </div>
                    <div class="item-quantity">
                        <button data-id="${item.id}" data-action="decrement">-</button>
                        <span>${item.quantity}</span>
                        <button data-id="${item.id}" data-action="increment">+</button>
                    </div>
                    <span class="item-total-price">KES ${itemTotal.toFixed(2)}</span>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHtml);
        });
    }

    cartTotalSpan.textContent = `KES ${total.toFixed(2)}`;

    if (cartBadge) {
        cartBadge.textContent = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

async function addToCart(foodId) {
    const foodDocRef = doc(db, 'foods', foodId);
    const foodDocSnap = await getDoc(foodDocRef);

    if (!foodDocSnap.exists()) {
        console.warn('Food item not found in Firestore:', foodId);
        return;
    }

    const foodToAdd = { id: foodDocSnap.id, ...foodDocSnap.data() };

    const existingItemIndex = cartItems.findIndex(item => item.id === foodToAdd.id);

    if (existingItemIndex > -1) {
        cartItems[existingItemIndex].quantity++;
    } else {
        cartItems.push({ ...foodToAdd, quantity: 1 });
    }

    updateCartDisplay();
}

function updateCartItemQuantity(foodId, action) {
    const itemIndex = cartItems.findIndex(item => item.id === foodId);

    if (itemIndex > -1) {
        if (action === 'increment') {
            cartItems[itemIndex].quantity++;
        } else if (action === 'decrement') {
            cartItems[itemIndex].quantity--;
            if (cartItems[itemIndex].quantity <= 0) {
                cartItems.splice(itemIndex, 1);
            }
        }
        updateCartDisplay();
    }
}

// --- Helper function to render food items ---
function renderFoodItems(containerId, foods) {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }
    container.innerHTML = '';

    if (foods.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">No items found.</p>';
        return;
    }

    foods.forEach(food => {
        const foodCard = `
            <div class="food-card">
                <img src="${food.imageUrl}" alt="${food.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/150?text=No+Image';" />
                <div class="food-info">
                    <h4>${food.name}</h4>
                    <p class="food-desc">${food.description}</p>
                    <div class="food-meta">
                        <span><ion-icon name="restaurant-outline"></ion-icon> ${food.restaurant}</span>
                        <span><ion-icon name="star"></ion-icon> ${food.rating ? food.rating.toFixed(1) : 'N/A'}</span>
                    </div>
                    <div class="price-add">
                        <span class="price">KES ${food.price.toFixed(2)}</span>
                        <button class="add-btn" data-food-id="${food.id}">
                            <ion-icon name="add-outline"></ion-icon>
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', foodCard);
    });
}

// --- Helper function to render restaurant items ---
function renderRestaurantItems(containerId, restaurants) {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }
    container.innerHTML = '';

    if (restaurants.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">No restaurants found.</p>';
        return;
    }

    restaurants.forEach(restaurant => {
        const restaurantCard = `
            <a href="restaurant.html?name=${encodeURIComponent(restaurant.name)}" class="food-card">
                <img src="${restaurant.imageUrl || 'https://via.placeholder.com/150x100?text=Restaurant'}" alt="${restaurant.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/150x100?text=Restaurant';" />
                <div class="food-info">
                    <h4>${restaurant.name}</h4>
                    <p class="food-desc">${restaurant.cuisine || 'Various'}</p>
                    <div class="food-meta">
                        <span><ion-icon name="star"></ion-icon> ${restaurant.avgRating ? restaurant.avgRating.toFixed(1) : 'N/A'}</span>
                        <span><ion-icon name="bicycle-outline"></ion-icon> ${restaurant.deliveryTime || 'XX'} min</span>
                    </div>
                </div>
            </a>
        `;
        container.insertAdjacentHTML('beforeend', restaurantCard);
    });
}

// --- Fetch and Display Functions (Internal to main.js, for homepage use) ---
async function fetchAndDisplayFoods(collectionName, containerId, options = {}) {
    const foodCollection = collection(db, collectionName);
    let q = query(foodCollection);

    if (options.orderByField) {
        q = query(q, orderBy(options.orderByField, options.orderDirection || 'asc'));
    }
    if (options.limit) {
        q = query(q, limit(options.limit));
    }
    if (options.whereField && options.whereOperator && options.whereValue !== undefined) {
        q = query(q, where(options.whereField, options.whereOperator, options.whereValue));
    }

    try {
        const querySnapshot = await getDocs(q);
        const foods = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderFoodItems(containerId, foods);
    } catch (error) {
        console.error(`Error fetching ${containerId}:`, error);
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<p style="text-align: center; color: red;">Failed to load items.</p>';
        }
    }
}

async function fetchAndDisplayRestaurants(containerId, options = {}) {
    try {
        const foodCollection = collection(db, 'foods');
        const q = query(foodCollection);
        const querySnapshot = await getDocs(q);
        const allFoods = querySnapshot.docs.map(doc => doc.data());

        const uniqueRestaurants = {};
        allFoods.forEach(food => {
            if (food.restaurant && !uniqueRestaurants[food.restaurant]) {
                uniqueRestaurants[food.restaurant] = {
                    name: food.restaurant,
                    cuisine: 'Mixed Cuisine',
                    imageUrl: `https://via.placeholder.com/150x100?text=${encodeURIComponent(food.restaurant)}`,
                    avgRating: (Math.random() * 1 + 3.8),
                    deliveryTime: Math.floor(Math.random() * 15) + 20,
                };
            }
        });
        const restaurantsArray = Object.values(uniqueRestaurants);

        if (options.orderByField === 'avgRating') {
            restaurantsArray.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
        }
        if (options.limit) {
            renderRestaurantItems(containerId, restaurantsArray.slice(0, options.limit));
        } else {
            renderRestaurantItems(containerId, restaurantsArray);
        }

    } catch (error) {
        console.error(`Error fetching restaurants for ${containerId}:`, error);
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<p style="text-align: center; color: red;">Failed to load restaurants.</p>';
        }
    }
}

// --- Debounce function to limit how often a function is called (Internal) ---
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// --- Initial Data Loading and Event Listeners (Homepage Specific Logic) ---
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    document.addEventListener('DOMContentLoaded', () => {
        // Fetch and display food/restaurant sections on homepage
        fetchAndDisplayFoods('foods', 'recommended-items', { limit: 10 });
        fetchAndDisplayRestaurants('top-restaurants-items', { orderByField: 'avgRating', limit: 5 });
        fetchAndDisplayFoods('foods', 'most-sold-items', { orderByField: 'soldCount', orderDirection: 'desc', limit: 10 });
        fetchAndDisplayFoods('foods', 'top-rated-items', { orderByField: 'rating', orderDirection: 'desc', limit: 10 });
        fetchAndDisplayFoods('foods', 'new-items', { orderByField: 'createdAt', orderDirection: 'desc', limit: 10 });
        fetchAndDisplayFoods('foods', 'budget-items', {
            whereField: 'price',
            whereOperator: '<=',
            whereValue: 100,
            orderByField: 'price',
            limit: 10
        });

        // Initialize cart display when homepage loads
        updateCartDisplay();

        // UPDATED: Cart modal show/hide for homepage (using new standardized IDs and class)
        const cartModal = document.getElementById('cartModal');         // Corrected ID
        const openCartBtn = document.getElementById('openCartBtn');     // Corrected ID
        const closeCartBtn = document.querySelector('.close-cart-btn'); // Corrected to use class selector

        if (openCartBtn && cartModal) {
            openCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                cartModal.style.display = 'flex';
                updateCartDisplay();
            });
        }

        if (closeCartBtn && cartModal) {
            closeCartBtn.addEventListener('click', () => {
                cartModal.style.display = 'none';
            });
        }

        if (cartModal) {
            window.addEventListener('click', (e) => {
                if (e.target === cartModal) {
                    cartModal.style.display = 'none';
                }
            });
        }

        // Event Listeners for Add to Cart Buttons on homepage (delegated)
        document.body.addEventListener('click', async (event) => {
            if (event.target.closest('.add-btn')) {
                const button = event.target.closest('.add-btn');
                const foodId = button.dataset.foodId;
                await addToCart(foodId);
            }
            if (event.target.dataset.action === 'increment' || event.target.dataset.action === 'decrement') {
                const foodId = event.target.dataset.id;
                const action = event.target.dataset.action;
                updateCartItemQuantity(foodId, action);
            }
        });

        // Search functionality for homepage
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(async (event) => {
                const searchTerm = event.target.value.toLowerCase();
                const foodCollection = collection(db, 'foods');
                let q = query(foodCollection, orderBy('name'));

                try {
                    const querySnapshot = await getDocs(q);
                    let foods = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    if (searchTerm) {
                        foods = foods.filter(food =>
                            food.name.toLowerCase().includes(searchTerm) ||
                            (food.restaurant && food.restaurant.toLowerCase().includes(searchTerm)) ||
                            (food.description && food.description.toLowerCase().includes(searchTerm))
                        );
                    }
                    renderFoodItems('recommended-items', foods);
                    const recommendedSectionHeader = document.querySelector('#recommended-items').previousElementSibling;
                    if (recommendedSectionHeader) {
                         recommendedSectionHeader.textContent = searchTerm ? 'Search Results' : 'Recommended For You';
                    }

                    const otherSections = ['most-sold-items', 'top-rated-items', 'new-items', 'budget-items', 'top-restaurants-items']
                        .map(id => document.getElementById(id)?.parentElement);
                    otherSections.forEach(section => {
                        if (section) {
                            if (searchTerm) {
                                section.style.display = 'none';
                            } else {
                                section.style.display = 'block';
                            }
                        }
                    });

                } catch (error) {
                    console.error("Error during search:", error);
                    const recommendedItemsContainer = document.getElementById('recommended-items');
                    if (recommendedItemsContainer) {
                        recommendedItemsContainer.innerHTML = '<p style="text-align: center; color: red;">Search failed.</p>';
                    }
                }
            }, 300));
        }
    });
}
