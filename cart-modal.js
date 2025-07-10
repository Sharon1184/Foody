const cart = [
  { id: 1, name: 'Chapati', price: 20, quantity: 2, image: 'https://via.placeholder.com/50', type: 'item' },
  { id: 2, name: 'Samosa Deal', price: 50, quantity: 1, image: 'https://via.placeholder.com/50', type: 'deal' },
];

function openCart() {
  document.getElementById('cartModal').classList.remove('hidden');
  renderCartItems();
}

function closeCart() {
  document.getElementById('cartModal').classList.add('hidden');
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-500 py-8">Your cart is empty</p>';
    document.getElementById('cartFooter').classList.add('hidden');
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const div = document.createElement('div');
    div.className = 'flex items-center space-x-4 p-4 border-b';

    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg" />
      <div class="flex-1">
        <h4 class="font-semibold text-gray-900">${item.name}</h4>
        <p class="text-sm text-gray-600">KSh ${item.price} each</p>
      </div>
      <div class="flex items-center space-x-2">
        <button onclick="updateQuantity(${index}, -1)" class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          -
        </button>
        <span class="font-semibold min-w-[20px] text-center">${item.quantity}</span>
        <button onclick="updateQuantity(${index}, 1)" class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          +
        </button>
      </div>
      <div class="text-right">
        <p class="font-semibold">KSh ${item.price * item.quantity}</p>
        <button onclick="removeItem(${index})" class="mt-1 text-red-600 text-sm hover:underline">Remove</button>
      </div>
    `;

    container.appendChild(div);
  });

  document.getElementById('totalPrice').innerText = `KSh ${total}`;
  document.getElementById('cartFooter').classList.remove('hidden');
}

function updateQuantity(index, change) {
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  renderCartItems();
}

function removeItem(index) {
  cart.splice(index, 1);
  renderCartItems();
}

document.getElementById('checkoutBtn').addEventListener('click', () => {
  localStorage.setItem('kibandaski_cart', JSON.stringify(cart));
  alert('Redirecting to checkout...');
  closeCart();
});
