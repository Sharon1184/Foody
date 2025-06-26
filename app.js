<!-- Firebase + Dynamic Food Script -->
<script type="module">
  // 1. Firebase imports
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

  // 2. Your Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyBYRW63-JCmbRZHvLG0-hlC9XDHL92PKpY",
    authDomain: "food-ae7ff.firebaseapp.com",
    projectId: "food-ae7ff",
    storageBucket: "food-ae7ff.appspot.com",
    messagingSenderId: "958754914592",
    appId: "1:958754914592:web:18f3d4fcd8a8fa515f6e65"
  };

  // 3. Init Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // 4. Load Foods
  async function loadFoods() {
    const foodList = document.getElementById('food-list');
    foodList.innerHTML = ''; // Clear old content

    const querySnapshot = await getDocs(collection(db, "foods"));
    querySnapshot.forEach(doc => {
      const food = doc.data();

      const foodCard = `
        <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
          <div class="h-48 overflow-hidden">
            <img src="${food.imageUrl}" alt="${food.name}" class="w-full h-full object-cover object-center">
          </div>
          <div class="p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-bold">${food.name}</h3>
              <span class="text-sm text-green-600 font-semibold">Ksh ${food.price}</span>
            </div>
            <p class="text-sm text-gray-500 mb-2">${food.restaurant || 'Local Vendor'}</p>
            <button class="bg-primary text-white px-4 py-2 text-sm rounded-button hover:bg-green-700 transition w-full">Add to Cart</button>
          </div>
        </div>
      `;
      foodList.innerHTML += foodCard;
    });
  }

  // 5. Trigger on load
  window.addEventListener('DOMContentLoaded', loadFoods);
</script>
