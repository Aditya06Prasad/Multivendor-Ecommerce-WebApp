// cart.js

/**
 * Global function to add a product to the cart.
 * @param {Object} product - The product object to add.
 */
function addToCart(product) {
    // *** CHANGE: Use localStorage instead of sessionStorage ***
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].qty += (product.qty || 1);
    } else {
        cart.push({ ...product, qty: product.qty || 1 });
    }
    // *** CHANGE: Use localStorage instead of sessionStorage ***
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log("Product added to cart:", product.name, "Current cart:", cart);

    // After adding/updating, update the cart display globally (like in header)
    updateCartDisplay();
    // If on the cart.html page, also re-render the items in the table
    if (window.location.pathname.includes('cart.html')) {
        renderCartItems();
    }
}

/**
 * Function to update the cart item count in the header (if an element exists).
 */
function updateCartDisplay() {
    // *** CHANGE: Use localStorage instead of sessionStorage ***
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartItemCountElement = document.getElementById('cart-item-count'); // Assuming an element with this ID in your header
    if (cartItemCountElement) {
        cartItemCountElement.textContent = totalItems;
    }
}

/**
 * Function to render (or re-render) the cart items on the cart.html page.
 */
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');

    if (!cartItemsContainer || !cartTotalElement || !emptyCartMessage) {
        console.error("Cart elements not found on this page.");
        return; // Exit if essential elements are missing
    }

    // *** CHANGE: Use localStorage instead of sessionStorage ***
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartItemsContainer.innerHTML = ''; // Clear existing items

    let grandTotal = 0;

    if (cart.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        cartTotalElement.textContent = '0.00';
    } else {
        emptyCartMessage.classList.add('hidden');
        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            grandTotal += itemTotal;

            const row = document.createElement('tr');
            row.className = 'border-b border-gray-200 hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-3 px-4 flex items-center">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md mr-4" onerror="this.onerror=null;this.src='https://placehold.co/100x100?text=Product';">
                    <span class="font-medium text-gray-800">${item.name}</span>
                </td>
                <td class="py-3 px-4">₹${item.price.toLocaleString('en-IN')}</td>
                <td class="py-3 px-4">
                    <input type="number" value="${item.qty}" min="1" data-product-id="${item.id}"
                           class="quantity-input border rounded-md p-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-400">
                </td>
                <td class="py-3 px-4">₹${itemTotal.toLocaleString('en-IN')}</td>
                <td class="py-3 px-4">
                    <button class="remove-btn text-red-500 hover:text-red-700 font-semibold" data-product-id="${item.id}">Remove</button>
                </td>
            `;
            cartItemsContainer.appendChild(row);
        });

        cartTotalElement.textContent = grandTotal.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        // Add event listeners for quantity changes and remove buttons
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (event) => {
                const productId = event.target.dataset.productId;
                const newQty = parseInt(event.target.value, 10);
                updateCartQuantity(productId, newQty);
            });
        });

        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                removeProductFromCart(productId);
            });
        });
    }
}

/**
 * Function to update the quantity of a product in the cart.
 * @param {string} productId - The ID of the product to update.
 * @param {number} newQty - The new quantity for the product.
 */
function updateCartQuantity(productId, newQty) {
    // *** CHANGE: Use localStorage instead of sessionStorage ***
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        if (newQty > 0) {
            cart[itemIndex].qty = newQty;
        } else {
            // If new quantity is 0 or less, remove the item
            cart.splice(itemIndex, 1);
        }
    }
    // *** CHANGE: Use localStorage instead of sessionStorage ***
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay(); // Update header count
    renderCartItems(); // Re-render cart page
}

/**
 * Function to remove a product completely from the cart.
 * @param {string} productId - The ID of the product to remove.
 */
function removeProductFromCart(productId) {
    // *** CHANGE: Use localStorage instead of sessionStorage ***
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId); // Remove item by filtering
    // *** CHANGE: Use localStorage instead of sessionStorage ***
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay(); // Update header count
    renderCartItems(); // Re-render cart page
}

// Call renderCartItems on cart.html load to display items
// Call updateCartDisplay on any page load to update header cart count
document.addEventListener("DOMContentLoaded", () => {
    updateCartDisplay();
    if (window.location.pathname.includes('cart.html')) {
        renderCartItems();
    }
});