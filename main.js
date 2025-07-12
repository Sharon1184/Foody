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
