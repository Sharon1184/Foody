// main.js

// Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

// --- Helper function to render food items ---
function renderFoodItems(containerId, foods) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear existing content (e.g., "Loading...")

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
    container.innerHTML = ''; // Clear existing content

    if (restaurants.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">No restaurants found.</p>';
        return;
    }

    restaurants.forEach(restaurant => {
        const restaurantCard = `
            <div class="food-card"> <img src="${restaurant.imageUrl || 'https://via.placeholder.com/150x100?text=Restaurant'}" alt="${restaurant.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/150x100?text=Restaurant';" />
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
        document.getElementById(containerId).innerHTML = '<p style="text-align: center; color: red;">Failed to load items.</p>';
    }
}

// Separate function for restaurants as their data structure might be different
async function fetchAndDisplayRestaurants(containerId, options = {}) {
    try {
        const foodCollection = collection(db, 'foods');
        const q = query(foodCollection);
        const querySnapshot = await getDocs(q);
        const allFoods = querySnapshot.docs.map(doc => doc.data());

        const uniqueRestaurants = {};
        allFoods.forEach(food => {
            if (food.restaurant && !uniqueRestaurants[food.restaurant]) {
                // Dummy data for restaurant specific fields
                uniqueRestaurants[food.restaurant] = {
                    name: food.restaurant,
                    cuisine: 'Mixed Cuisine', // Or try to infer from food items
                    imageUrl: `https://via.placeholder.com/150x100?text=${encodeURIComponent(food.restaurant)}`,
                    avgRating: (Math.random() * 1 + 3.8), // Placeholder rating 3.8-4.8
                    deliveryTime: Math.floor(Math.random() * 15) + 20 // Placeholder delivery time 20-35 mins
                };
            }
        });
        const restaurantsArray = Object.values(uniqueRestaurants);

        // Sort if options are provided (e.g., by avgRating)
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
        document.getElementById(containerId).innerHTML = '<p style="text-align: center; color: red;">Failed to load restaurants.</p>';
    }
}


// --- Initial Data Loading on Homepage ---
document.addEventListener('DOMContentLoaded', () => {
    // Recommended For You (e.g., just fetch some limit of any foods)
    fetchAndDisplayFoods('foods', 'recommended-items', { limit: 10 });

    // Top Restaurants (using a dummy approach for now)
    fetchAndDisplayRestaurants('top-restaurants-items', { orderByField: 'avgRating', limit: 5 });

    // Most Sold This Week (Requires 'soldCount' field in Firestore)
    fetchAndDisplayFoods('foods', 'most-sold-items', { orderByField: 'soldCount', orderDirection: 'desc', limit: 10 });

    // Top Rated (Requires 'rating' field in Firestore)
    fetchAndDisplayFoods('foods', 'top-rated-items', { orderByField: 'rating', orderDirection: 'desc', limit: 10 });

    // New This Week (Requires 'createdAt' field in Firestore)
    // For "New This Week", you'd typically filter by a recent date range.
    // For simplicity, here it just orders by creation time.
    fetchAndDisplayFoods('foods', 'new-items', { orderByField: 'createdAt', orderDirection: 'desc', limit: 10 });

    // Budget Meals (Requires 'price' field in Firestore)
    fetchAndDisplayFoods('foods', 'budget-items', {
        whereField: 'price',
        whereOperator: '<=',
        whereValue: 100,
        orderByField: 'price', // Order by price for budget meals
        limit: 10
    });

    // Order Again (This would be personalized for a logged-in user,
    // so it's left as a placeholder or handled with user authentication)
    // Example: fetchAndDisplayFoods('foods', 'order-again-items', { userId: 'currentUserId', orderByField: 'lastOrderedAt', orderDirection: 'desc', limit: 5 });


    // --- Cart Modal Logic (Basic Show/Hide) ---
    const cartModal = document.getElementById('cartModal');
    const openCartBtn = document.getElementById('openCartBtn');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const cartBadge = document.getElementById('cartBadge');
    let cartItems = []; // Array to store cart items

    function updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalSpan = document.getElementById('cartTotal');
        let total = 0;
        cartItemsContainer.innerHTML = ''; // Clear current display

        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
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
        cartBadge.textContent = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Add item to cart
    function addToCart(foodId) {
        // In a real app, you'd fetch the food details from Firestore using foodId
        // For this example, let's just create a dummy item or find it from already fetched data
        console.log('Adding food ID to cart:', foodId);

        // Find the food item from one of the loaded carousels (e.g., recommended items)
        // In a real app, you'd have a global list of fetched foods or fetch by ID
        let foodToAdd = null;
        const sections = ['recommended-items', 'most-sold-items', 'top-rated-items', 'new-items', 'budget-items'];
        for (const sectionId of sections) {
            const container = document.getElementById(sectionId);
            // This is a crude way; ideally, you fetch by ID or manage a global food array
            const foodCards = container.querySelectorAll('.food-card');
            for (const card of foodCards) {
                const button = card.querySelector('.add-btn');
                if (button && button.dataset.foodId === foodId) {
                    // Extract details from the card's inner HTML - not ideal, but for demo
                    foodToAdd = {
                        id: foodId,
                        name: card.querySelector('h4').textContent,
                        price: parseFloat(card.querySelector('.price').textContent.replace('KES ', '')),
                        imageUrl: card.querySelector('img').src
                    };
                    break;
                }
            }
            if (foodToAdd) break;
        }

        if (foodToAdd) {
            const existingItemIndex = cartItems.findIndex(item => item.id === foodToAdd.id);

            if (existingItemIndex > -1) {
                cartItems[existingItemIndex].quantity++;
            } else {
                cartItems.push({ ...foodToAdd, quantity: 1 });
            }
            updateCartDisplay();
            openCartBtn.classList.add('active'); // Optional: Add a visual cue
        } else {
            console.warn('Food item not found to add to cart:', foodId);
        }
    }

    // Increment/Decrement quantity or remove item
    function updateCartItemQuantity(foodId, action) {
        const itemIndex = cartItems.findIndex(item => item.id === foodId);
        if (itemIndex > -1) {
            if (action === 'increment') {
                cartItems[itemIndex].quantity++;
            } else if (action === 'decrement') {
                cartItems[itemIndex].quantity--;
                if (cartItems[itemIndex].quantity <= 0) {
                    cartItems.splice(itemIndex, 1); // Remove if quantity is 0 or less
                }
            }
            updateCartDisplay();
        }
    }


    openCartBtn.addEventListener('click', () => {
        cartModal.classList.add('show');
    });

    closeCartBtn.addEventListener('click', () => {
        cartModal.classList.remove('show');
    });

    // Close modal if clicked outside content
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('show');
        }
    });


    // --- Event Listeners for Add to Cart Buttons ---
    document.body.addEventListener('click', (event) => {
        if (event.target.closest('.add-btn')) {
            const button = event.target.closest('.add-btn');
            const foodId = button.dataset.foodId;
            addToCart(foodId);
        }
        if (event.target.dataset.action === 'increment' || event.target.dataset.action === 'decrement') {
            const foodId = event.target.dataset.id;
            const action = event.target.dataset.action;
            updateCartItemQuantity(foodId, action);
        }
    });


    // --- Search functionality ---
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(async (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const foodCollection = collection(db, 'foods');
            let q = query(foodCollection);

            // Firestore doesn't support direct 'contains' for substring search efficiently.
            // For simple front-end filtering, you'd fetch all (or a large subset) and filter in JS.
            // For robust search, consider dedicated search solutions (Algolia, ElasticSearch) or
            // more complex Firestore queries with startAt/endAt if searching prefixes.
            // For this example, we'll fetch all and filter in JS.
            q = query(q, orderBy('name')); // Order by name to assist with potential future range queries

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
                // Render search results in the recommended-items section.
                renderFoodItems('recommended-items', foods);
                // Also update the heading for clarity
                document.querySelector('#recommended-items').previousElementSibling.textContent = searchTerm ? 'Search Results' : 'Recommended For You';

                // Optionally hide other sections when search results are shown
                const otherSections = ['most-sold-items', 'top-rated-items', 'new-items', 'budget-items', 'top-restaurants-items'].map(id => document.getElementById(id).parentElement);
                otherSections.forEach(section => {
                    if (searchTerm) {
                        section.style.display = 'none';
                    } else {
                        section.style.display = 'block'; // Or 'flex' depending on original display
                    }
                });

            } catch (error) {
                console.error("Error during search:", error);
                document.getElementById('recommended-items').innerHTML = '<p style="text-align: center; color: red;">Search failed.</p>';
            }
        }, 300)); // Debounce search input to avoid too many Firestore calls
    }

    // Debounce function to limit how often a function is called
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }
});
