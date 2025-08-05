// checkout.js
import {
    getFirestore,
    doc,
    getDoc,
    collection,
    query,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";

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

// Checkout page elements
const orderItemsContainer = document.getElementById('order-items');
const subtotalPriceSpan = document.getElementById('subtotal-price');
const discountPriceSpan = document.getElementById('discount-price');
const deliveryFeeSpan = document.getElementById('delivery-fee');
const orderTotalSpan = document.getElementById('order-total-price');
const checkoutForm = document.getElementById('checkout-form');
const applyPromoBtn = document.getElementById('apply-promo-btn');
const promoCodeInput = document.getElementById('promo-code');
const toggleOrderSummaryBtn = document.getElementById('toggle-order-summary');
const orderSummaryContent = document.getElementById('order-summary-content');
const addressInput = document.getElementById('address');
const recentAddressesList = document.getElementById('recent-addresses-list');

let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
let appliedDiscount = 0;
const DELIVERY_FEE = 50.00;

function updateCheckoutSummary(subtotal) {
    let discountAmount = subtotal * appliedDiscount;
    let finalSubtotal = subtotal - discountAmount;
    let total = finalSubtotal + DELIVERY_FEE;

    subtotalPriceSpan.textContent = `KES ${subtotal.toFixed(2)}`;
    discountPriceSpan.textContent = `KES ${discountAmount.toFixed(2)}`;
    orderTotalSpan.textContent = `KES ${total.toFixed(2)}`;
    deliveryFeeSpan.textContent = `KES ${DELIVERY_FEE.toFixed(2)}`;
}

function renderCheckoutItems() {
    let itemsToCheckout = [];

    const buyNowItem = JSON.parse(localStorage.getItem('buyNowItem'));
    if (buyNowItem) {
        itemsToCheckout.push(buyNowItem);
    } else {
        itemsToCheckout = JSON.parse(localStorage.getItem('cartItems')) || [];
    }

    if (itemsToCheckout.length === 0) {
        orderItemsContainer.innerHTML = '<p>Your order is empty.</p>';
        checkoutForm.style.display = 'none';
        return;
    }

    let subtotal = 0;
    orderItemsContainer.innerHTML = '';

    itemsToCheckout.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        const itemHtml = `
            <div class="checkout-item food-card">
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>KES ${item.price.toFixed(2)}</p>
                </div>
                <div class="item-quantity-controls">
                    <button data-id="${item.id}" data-action="decrement">-</button>
                    <span>${item.quantity}</span>
                    <button data-id="${item.id}" data-action="increment">+</button>
                </div>
                <span class="item-total">KES ${itemTotal.toFixed(2)}</span>
                <button class="remove-item-btn" data-id="${item.id}">&times;</button>
            </div>
        `;
        orderItemsContainer.insertAdjacentHTML('beforeend', itemHtml);
    });

    updateCheckoutSummary(subtotal);
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
    }
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    renderCheckoutItems();
}

function removeFromCart(foodId) {
    cartItems = cartItems.filter(item => item.id !== foodId);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    renderCheckoutItems();
}

function handlePromoCode() {
    const code = promoCodeInput.value.trim().toUpperCase();
    if (code === 'SAVE10') {
        appliedDiscount = 0.10;
        alert('10% discount applied!');
    } else {
        appliedDiscount = 0;
        alert('Invalid or expired promo code.');
    }
    renderCheckoutItems();
}

function loadRecentAddresses() {
    const recentAddresses = JSON.parse(localStorage.getItem('recentAddresses')) || [];
    recentAddressesList.innerHTML = '';
    if (recentAddresses.length > 0) {
        recentAddresses.forEach(address => {
            const li = document.createElement('li');
            li.className = 'address-item';
            li.dataset.address = address;
            li.innerHTML = `<i class="ri-map-pin-line"></i> ${address}`;
            recentAddressesList.appendChild(li);
        });
    } else {
        recentAddressesList.style.display = 'none';
    }
}

function saveRecentAddress(address) {
    let recentAddresses = JSON.parse(localStorage.getItem('recentAddresses')) || [];
    if (!recentAddresses.includes(address)) {
        recentAddresses.unshift(address);
        if (recentAddresses.length > 5) {
            recentAddresses.pop();
        }
        localStorage.setItem('recentAddresses', JSON.stringify(recentAddresses));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initial rendering
    renderCheckoutItems();
    loadRecentAddresses();

    // Event listeners for Order Summary editing
    orderItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.closest('.item-quantity-controls button')) {
            const btn = target.closest('.item-quantity-controls button');
            const foodId = btn.dataset.id;
            const action = btn.dataset.action;
            updateCartItemQuantity(foodId, action);
        } else if (target.closest('.remove-item-btn')) {
            const btn = target.closest('.remove-item-btn');
            const foodId = btn.dataset.id;
            removeFromCart(foodId);
        }
    });

    // Event listener for promo code
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handlePromoCode();
        });
    }

    // Event listener for form submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const customerName = document.getElementById('name').value;
            const customerPhone = document.getElementById('phone').value;
            const customerAddress = document.getElementById('address').value;
            const specialInstructions = document.getElementById('instructions').value;
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
            const deliveryOption = document.querySelector('input[name="deliveryOption"]:checked').value;
            const deliveryTime = document.getElementById('delivery-time').value;

            const itemsToCheckout = JSON.parse(localStorage.getItem('cartItems')) || [];
            let subtotal = itemsToCheckout.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            let discountAmount = subtotal * appliedDiscount;
            let total = subtotal - discountAmount + (deliveryOption === 'standard' ? DELIVERY_FEE : 0);

            const orderDetails = {
                customerName,
                customerPhone,
                customerAddress,
                specialInstructions,
                paymentMethod,
                deliveryOption,
                deliveryTime,
                items: itemsToCheckout,
                subtotal: subtotal,
                discount: discountAmount,
                deliveryFee: deliveryOption === 'standard' ? DELIVERY_FEE : 0,
                total: total,
                timestamp: new Date().toISOString()
            };

            // Save address to local storage for future use
            saveRecentAddress(customerAddress);
            
            console.log('Order Placed:', orderDetails);
            alert('Thank you for your order! It has been placed successfully.');

            localStorage.removeItem('cartItems');
            localStorage.removeItem('buyNowItem');
            window.location.href = 'index.html';
        });
    }

    // Event listener for recent addresses
    if (recentAddressesList) {
        recentAddressesList.addEventListener('click', (e) => {
            const addressItem = e.target.closest('.address-item');
            if (addressItem) {
                addressInput.value = addressItem.dataset.address;
            }
        });
    }
    
    // Event listener for collapsible summary
    if (toggleOrderSummaryBtn) {
        toggleOrderSummaryBtn.addEventListener('click', () => {
            orderSummaryContent.classList.toggle('collapsed');
            toggleOrderSummaryBtn.classList.toggle('ri-arrow-up-s-line');
            toggleOrderSummaryBtn.classList.toggle('ri-arrow-down-s-line');
        });
    }
});
