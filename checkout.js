// checkout.js

document.addEventListener('DOMContentLoaded', () => {
    const orderItemsContainer = document.getElementById('order-items');
    const orderTotalSpan = document.getElementById('order-total-price');
    const checkoutForm = document.getElementById('checkout-form');

    let itemsToCheckout = [];

    // Check for a 'buy now' item first
    const buyNowItem = JSON.parse(localStorage.getItem('buyNowItem'));
    if (buyNowItem) {
        itemsToCheckout.push(buyNowItem);
        // Clear the 'buy now' item after reading it
        localStorage.removeItem('buyNowItem');
    } else {
        // If no 'buy now' item, check for the regular cart
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        itemsToCheckout = cartItems;
    }

    if (itemsToCheckout.length === 0) {
        orderItemsContainer.innerHTML = '<p>Your order is empty.</p>';
        orderTotalSpan.textContent = 'KES 0.00';
        checkoutForm.style.display = 'none';
        return;
    }

    let total = 0;
    orderItemsContainer.innerHTML = '';

    itemsToCheckout.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const itemHtml = `
            <div class="checkout-item">
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                    <p>KES ${item.price.toFixed(2)}</p>
                </div>
                <span class="item-total">KES ${itemTotal.toFixed(2)}</span>
            </div>
        `;
        orderItemsContainer.insertAdjacentHTML('beforeend', itemHtml);
    });

    orderTotalSpan.textContent = `KES ${total.toFixed(2)}`;

    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const customerName = document.getElementById('name').value;
        const customerPhone = document.getElementById('phone').value;
        const customerAddress = document.getElementById('address').value;

        // In a real application, you would send this data to a backend server
        // for payment processing and order fulfillment.
        const orderDetails = {
            customerName,
            customerPhone,
            customerAddress,
            items: itemsToCheckout,
            total,
            timestamp: new Date().toISOString()
        };

        console.log('Order Placed:', orderDetails);
        alert('Thank you for your order! It has been placed successfully.');

        // Clear the cart/buy now item from localStorage after successful order
        localStorage.removeItem('cartItems');
        localStorage.removeItem('buyNowItem');

        // Optional: Redirect back to the homepage
        // window.location.href = 'index.html';
    });
});
