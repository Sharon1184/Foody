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

// --- Cart Data and Functions ---
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
const cartModal = document.getElementById('cart-modal');
const openCartBtn = document.getElementById('open-cart');
const closeCartBtn = document.getElementById('close-cart');

// --- Food Detail Modal Elements ---
const foodDetailModal = document.getElementById('food-detail-modal');
const closeFoodDetailBtn = document.getElementById('close-food-detail');
const detailImg = document.getElementById('food-detail-img');
const detailName = document.getElementById('food-detail-name');
const detailDesc = document.getElementById('food-detail-desc');
const detailRestaurant = document.querySelector('#food-detail-restaurant span');
const detailRating = document.querySelector('#food-detail-rating span');
const detailPrice = document.getElementById('food-detail-price');
const detailAddToCartBtn = document.getElementById('add-to-cart-detail');

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
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
                    <button class="remove-item-btn" data-id="${item.id}">&times;</button>
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
        alert(`Quantity of ${foodToAdd.name} updated to ${cartItems[existingItemIndex].quantity} in cart.`);
    } else {
        cartItems.push({ ...foodToAdd, quantity: 1 });
        alert(`${foodToAdd.name} added to cart!`);
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

function removeFromCart(foodId) {
    cartItems = cartItems.filter(item => item.id !== foodId);
    updateCartDisplay();
}

// --- Helper function to render food items ---
function renderFoodItems(containerId, foods) {
    const container = document.getElementById(containerId);
    if (!container) { return; }
    container.innerHTML = '';

    if (foods.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">No items found.</p>';
        return;
    }

    foods.forEach(food => {
        const foodCard = `
            <div class="food-card" data-food-id="${food.id}">
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
    if (!container) { return; }
    container.innerHTML = '';

    if (restaurants.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">No restaurants found.</p>';
        return;
    }

    restaurants.forEach(restaurant => {
        const restaurantCard = `
            <div class="food-card">
              <img src="${restaurant.imageUrl || 'https://via.placeholder.com/150x100?text=Restaurant'}" alt="${restaurant.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/150x100?text=Restaurant';" />
              <div class="food-info">
                <h4>${restaurant.name}</h4>
                <p class="food-desc">${restaurant.cuisine || 'Various'}</p>
                <div class="food-meta">
                  <span><ion-icon name="star"></ion-icon> ${restaurant.avgRating ? restaurant.avgRating.toFixed(1) : 'N/A'}</span>
                  <span><ion-icon name="bicycle-outline"></ion-icon> ${restaurant.deliveryTime || 'XX'} min</span>
                </div>
              </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', restaurantCard);
    });
}

// --- Fetch and Display Functions ---
async function fetchAndDisplayFoods(collectionName, containerId, options = {}) {
    const foodCollection = collection(db, collectionName);
    let q = query(foodCollection);

    if (options.whereField && options.whereOperator && options.whereValue !== undefined) {
        q = query(q, where(options.whereField, options.whereOperator, options.whereValue));
    }
    if (options.randomize) {
      const querySnapshot = await getDocs(q);
      let foods = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      for (let i = foods.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [foods[i], foods[j]] = [foods[j], foods[i]];
      }
      renderFoodItems(containerId, foods.slice(0, options.limit));
      return;
    }
    if (options.orderByField) {
        q = query(q, orderBy(options.orderByField, options.orderDirection || 'asc'));
    }
    if (options.limit) {
        q = query(q, limit(options.limit));
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

// --- Open Food Detail Modal Function ---
async function openFoodDetailModal(foodId) {
    const foodDocRef = doc(db, 'foods', foodId);
    try {
        const foodDocSnap = await getDoc(foodDocRef);
        if (foodDocSnap.exists()) {
            const food = { id: foodDocSnap.id, ...foodDocSnap.data() };
            detailImg.src = food.imageUrl;
            detailName.textContent = food.name;
            detailDesc.textContent = food.description;
            detailRestaurant.textContent = food.restaurant;
            detailRating.textContent = food.rating ? food.rating.toFixed(1) : 'N/A';
            detailPrice.textContent = `KES ${food.price.toFixed(2)}`;
            detailAddToCartBtn.dataset.foodId = food.id;
            foodDetailModal.style.display = 'flex';
        } else {
            alert("Food item not found.");
        }
    } catch (error) {
        console.error("Error fetching food details:", error);
        alert("Failed to load food details.");
    }
}

// --- Debounce function to limit how often a function is called ---
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}


// --- Initial Data Loading and Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayFoods('foods', 'recommended-items', { limit: 10, randomize: true });
    fetchAndDisplayFoods('foods', 'budget-items', {
        whereField: 'price',
        whereOperator: '<=',
        whereValue: 100,
        limit: 10,
        randomize: true
    });
    fetchAndDisplayRestaurants('top-restaurants-items', { orderByField: 'avgRating', limit: 5 });
    fetchAndDisplayFoods('foods', 'most-sold-items', { orderByField: 'soldCount', orderDirection: 'desc', limit: 10 });
    fetchAndDisplayFoods('foods', 'top-rated-items', { orderByField: 'rating', orderDirection: 'desc', limit: 10 });
    fetchAndDisplayFoods('foods', 'new-items', { orderByField: 'createdAt', orderDirection: 'desc', limit: 10 });

    updateCartDisplay();

    // Cart Modal Event Listeners
    if (openCartBtn && cartModal && closeCartBtn) {
        openCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            cartModal.style.display = 'flex';
        });
        closeCartBtn.addEventListener('click', () => {
            cartModal.style.display = 'none';
        });
    }
    
    // Food Detail Modal Event Listeners
    if (foodDetailModal && closeFoodDetailBtn) {
        closeFoodDetailBtn.addEventListener('click', () => {
            foodDetailModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (e.target === foodDetailModal) {
            foodDetailModal.style.display = 'none';
        }
    });

    document.body.addEventListener('click', async (event) => {
        if (event.target.closest('.food-card')) {
            const card = event.target.closest('.food-card');
            const foodId = card.dataset.foodId;
            if (foodId && !event.target.closest('.add-btn')) { // Prevent opening modal when clicking the add button
                await openFoodDetailModal(foodId);
            }
        }
        
        if (event.target.closest('.add-btn')) {
            const button = event.target.closest('.add-btn');
            const foodId = button.dataset.foodId;
            await addToCart(foodId);
        }

        if (event.target.closest('.remove-item-btn')) {
            const button = event.target.closest('.remove-item-btn');
            const foodId = button.dataset.id;
            removeFromCart(foodId);
        }

        if (event.target.closest('#add-to-cart-detail')) {
            const button = event.target.closest('#add-to-cart-detail');
            const foodId = button.dataset.foodId;
            await addToCart(foodId);
            foodDetailModal.style.display = 'none'; // Close the detail modal after adding
        }
    });

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
