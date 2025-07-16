// Function to fetch products from products.json
async function fetchProducts() {
    try {
        const response = await fetch('../products.json'); // Adjust path for category pages
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        return products;
    } catch (error) {
        console.error("Could not fetch products:", error);
        return []; // Return an empty array on error
    }
}

// Function to create a product card HTML element
function createProductCard(product) {
    let detailsHtml = '';
    // Check if product.details exists and is an array, then iterate
    if (product.details && Array.isArray(product.details)) {
        detailsHtml = product.details.map(detail => `<p class="text-gray-700 text-sm mb-1">${detail}</p>`).join('');
    }

    const productCard = document.createElement('div');
    productCard.className = 'product-card bg-white rounded-xl shadow-lg p-6 flex flex-col items-center';
    productCard.setAttribute('data-product-id', product.id);
    productCard.setAttribute('data-product-name', product.name);
    productCard.setAttribute('data-product-price', product.price);
    productCard.setAttribute('data-product-category', product.category); // Add category attribute for filtering

    productCard.innerHTML = `
        <img src="../${product.image}" alt="${product.name}" class="w-full h-48 object-cover rounded-md mb-4" onerror="this.onerror=null;this.src='https://placehold.co/200x150/E0E0E0/333333?text=Product';">
        <div class="w-full">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">${product.name}</h3>
            ${detailsHtml} <div class="text-2xl font-bold text-green-600 mb-4">₹${product.price.toLocaleString('en-IN')}</div>
            <button class="add-to-cart-button mt-6 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-full font-semibold">
                Add to Cart
            </button>
        </div>
    `;

    // Attach event listener for Add to Cart button
    const addToCartButton = productCard.querySelector('.add-to-cart-button');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent card click event if any
            // Create a copy of the product and add quantity before sending to cart
            const productToAdd = { ...product, qty: 1 };
            addToCart(productToAdd); // Call addToCart from cart.js with the quantity
            alert(`${product.name} added to cart!`);
        });
    }

    return productCard;
}

// Function to filter and sort products
function filterAndSortProducts(products, category = null, searchTerm = '', sortBy = 'default') {
    let filteredProducts = products;

    // Filter by category
    if (category && category !== 'All Categories') { // Allow "All Categories" as an option that doesn't filter
        filteredProducts = filteredProducts.filter(product => product.category === category);
    }

    // Filter by search term
    if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            product.category.toLowerCase().includes(lowerCaseSearchTerm) ||
            (product.details && product.details.some(detail => detail.toLowerCase().includes(lowerCaseSearchTerm)))
        );
    }

    // Sort products
    switch (sortBy) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'default':
        default:
            // No specific sort, maintain original order or a natural order by ID/name if preferred
            break;
    }

    return filteredProducts;
}

let allProducts = []; // Store all fetched products globally

// Main function to initialize product display
async function initializeProductDisplay(categoryFilter = null) {
    if (allProducts.length === 0) {
        allProducts = await fetchProducts(); // Fetch only once
    }

    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) {
        console.error("Products container not found on this page!");
        return;
    }
    productsContainer.innerHTML = ''; // Clear existing products

    // Get current search term and sort by value from inputs
    const searchInput = document.getElementById('search-input');
    const sortByDropdown = document.getElementById('sort-by');
    const searchTerm = searchInput ? searchInput.value : '';
    const sortBy = sortByDropdown ? sortByDropdown.value : 'default';

    const productsToDisplay = filterAndSortProducts(allProducts, categoryFilter, searchTerm, sortBy);

    if (productsToDisplay.length === 0) {
        productsContainer.innerHTML = '<p class="col-span-full text-center text-gray-600 text-lg">No products found for this selection.</p>';
        return;
    }

    productsToDisplay.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
}

// Event Listeners for Search and Sort and initial display based on URL
document.addEventListener("DOMContentLoaded", () => {
    // Check if updateCartDisplay exists (it's in cart.js)
    if (typeof updateCartDisplay === 'function') {
        updateCartDisplay(); // Always update cart count in header/cart icon
    }


    const currentPath = window.location.pathname;
    let categoryFromUrl = null;

    // Check if it's a category page (e.g., /products/tech.html)
    const categoryMatch = currentPath.match(/\/products\/(.*)\.html$/);
    if (categoryMatch && categoryMatch[1]) {
        // Capitalize the first letter for category name matching (e.g., 'tech' -> 'Tech')
        categoryFromUrl = categoryMatch[1].charAt(0).toUpperCase() + categoryMatch[1].slice(1);
    }

    // Initialize product display based on the current page
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) { // Only try to display products if a container exists on this page
        if (categoryFromUrl) {
            initializeProductDisplay(categoryFromUrl); // Pass the detected category
        } else if (currentPath.endsWith('index.html') || currentPath === '/') {
            initializeProductDisplay(); // For homepage, show all/featured
        }
    }

    // Event listeners for Search and Sort (will work if elements exist on the page)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            // Use the category detected from URL, or fallback to dropdown on homepage
            const currentCategory = categoryFromUrl || (document.getElementById('categoryDropdown') ? document.getElementById('categoryDropdown').value : null);
            initializeProductDisplay(currentCategory);
        });
    }

    const sortByDropdown = document.getElementById('sort-by');
    if (sortByDropdown) {
        sortByDropdown.addEventListener('change', () => {
            // Use the category detected from URL, or fallback to dropdown on homepage
            const currentCategory = categoryFromUrl || (document.getElementById('categoryDropdown') ? document.getElementById('categoryDropdown').value : null);
            initializeProductDisplay(currentCategory);
        });
    }
});