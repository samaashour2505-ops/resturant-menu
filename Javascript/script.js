
const heroVideo = document.querySelector(".hero-video");

// Play the hero video when the page finishes loading
if (heroVideo) {
  const playVideo = () => {
    heroVideo.play().catch(() => {});
  };

  if (document.readyState === "complete") {
    playVideo();
  } else {
    window.addEventListener("load", playVideo, { once: true });
  }

  // Hide the video if an error occurs
  heroVideo.addEventListener("error", () => {
    heroVideo.style.display = "none";
  });
}

// Select the hero content and control its scrolling animation
const heroContent = document.querySelector('.hero-content');
let isScrolling = false;

window.addEventListener('scroll', () => {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      let scrollY = window.scrollY;

      if (heroContent) {
        heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
        heroContent.style.opacity = Math.max(0, 1 - (scrollY / 600));
      }

      isScrolling = false;
    });

    isScrolling = true;
  }
});

// Play the opening sound once when the user clicks anywhere on the page
window.addEventListener('click', () => {
  const openingSound = new Audio('./Images/imgs_audio.mp3');

  openingSound.play().then(() => {
    setTimeout(() => {
      openingSound.pause();
      openingSound.currentTime = 0;
    }, 7000);
  }).catch(() => {});
}, { once: true });


document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize the shopping cart array
    let cart = [];

    // Select the required page elements
    const cartIcon = document.querySelector('.fa-cart-shopping')?.closest('a') || document.querySelector('.fa-cart-shopping');
    const addButtons = document.querySelectorAll('.add-btn, .add-to-cart-btn');
    const favoriteButtons = document.querySelectorAll('.favorite-btn, .fav-btn');
    const orderForm = document.getElementById('orderForm') || document.querySelector('.order-form');
    const dishSelect = document.getElementById('dishSelect') || document.getElementById('selectDish') || document.querySelectorAll('.order-form select')[1];
    const qtyValSpan = document.getElementById('qtyVal') || document.getElementById('qtyNumber');
    const decreaseQtyBtn = document.getElementById('decreaseQty');
    const increaseQtyBtn = document.getElementById('increaseQty');

    let currentQty = 1;

    // 2. Handle quantity controls inside the order form
    if (increaseQtyBtn && decreaseQtyBtn) {
        increaseQtyBtn.addEventListener('click', () => {
            currentQty++;

            if (qtyValSpan) qtyValSpan.textContent = currentQty;
        });

        decreaseQtyBtn.addEventListener('click', () => {
            if (currentQty > 1) {
                currentQty--;

                if (qtyValSpan) qtyValSpan.textContent = currentQty;
            }
        });
    }

    // 3. Add dishes to the cart and automatically select them in the order form
    addButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.dish-card');
            const dishName = card.querySelector('.dish-title, .dish-name').textContent.trim();
            const dishPrice = card.querySelector('.dish-price').textContent.trim();

            // A. Automatically select the chosen dish in the order form
            if (dishSelect) {
                let found = false;

                for (let option of dishSelect.options) {
                    if (option.text.toLowerCase().includes(dishName.toLowerCase()) || option.value.toLowerCase().includes(dishName.toLowerCase())) {
                        option.selected = true;
                        found = true;
                        break;
                    }
                }

                // Highlight the dish selection field with a golden border
                dishSelect.style.transition = 'all 0.3s ease';
                dishSelect.style.borderColor = '#f2a93b';
                dishSelect.style.boxShadow = '0 0 15px rgba(242, 169, 59, 0.6)';

                // Focus the field to draw attention to it
                dishSelect.focus();

                setTimeout(() => {
                    dishSelect.style.borderColor = '';
                    dishSelect.style.boxShadow = '';
                }, 1200);
            }

            // B. Add the selected dish to the shopping cart
            const existingItem = cart.find(item => item.name === dishName);

            if (existingItem) {
                existingItem.qty += currentQty;
            } else {
                cart.push({
                    name: dishName,
                    price: dishPrice,
                    qty: currentQty
                });
            }

            // C. Update the shopping cart badge
            updateCartBadge();

            // Reset the quantity to one after adding the dish
            currentQty = 1;

            if (qtyValSpan) qtyValSpan.textContent = currentQty;
        });
    });

    // 4. Handle favorite button interactions
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event propagation
            btn.classList.toggle('active');

            const icon = btn.querySelector('i');
            const card = btn.closest('.dish-card');
            const dishName = card ? card.querySelector('.dish-title, .dish-name').textContent.trim() : '';

            if (btn.classList.contains('active')) {
                // Change the icon to the solid heart style
                if (icon) {
                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid');
                } else {
                    btn.textContent = '♥';
                }

                // Highlight the favorite button in red
                btn.style.color = '#ff4757';

                console.log(`Added ${dishName} to favorites! ❤️`);
            } else {
                // Restore the regular heart icon style
                if (icon) {
                    icon.classList.remove('fa-solid');
                    icon.classList.add('fa-regular');
                } else {
                    btn.textContent = '♡';
                }

                // Reset the favorite button color
                btn.style.color = '';
            }
        });
    });

    // 5. Update the shopping cart badge displayed above the cart icon
    function updateCartBadge() {
        let totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
        let badge = document.getElementById('cartBadge');

        // Create the badge if it does not already exist
        if (!badge && cartIcon) {
            badge = document.createElement('span');
            badge.id = 'cartBadge';

            badge.style.cssText = 'background: #f2a93b; color: #0b1320; border-radius: 50%; padding: 2px 6px; font-size: 10px; font-weight: bold; position: absolute; top: -5px; right: -8px;';

            cartIcon.style.position = 'relative';
            cartIcon.appendChild(badge);
        }

        // Display the total quantity of items in the cart
        if (badge) {
            badge.textContent = totalCount;
            badge.style.display = totalCount > 0 ? 'inline-block' : 'none';
        }
    }

    // 6. Display the shopping cart contents when the cart icon is clicked
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();

            // Notify the user if the cart is empty
            if (cart.length === 0) {
                alert('Your shopping cart is currently empty!');
            } else {
                // Prepare the cart details and calculate the total price
                let details = "🛒 Shopping Cart Contents:\n\n";
                let grandTotal = 0;

                cart.forEach((item, index) => {
                    let numPrice = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
                    let total = numPrice * item.qty;

                    grandTotal += total;

                    details += `${index + 1}. ${item.name} (Quantity: ${item.qty}) - $${total.toFixed(2)}\n`;
                });

                // Add the grand total to the cart details
                details += `\nTotal: $${grandTotal.toFixed(2)}`;

                alert(details);
            }
        });
    }

    // 7. Handle order form submission
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Get the customer's name from the form
            const nameInput = orderForm.querySelector('input[type="text"]');
            const name = nameInput ? nameInput.value : 'Dear Customer';

            // Display a confirmation message
            alert(`Thank you, ${name}! Your order has been received successfully and will be prepared shortly.`);

            // Reset the form and clear the shopping cart
            orderForm.reset();
            cart = [];
            updateCartBadge();

            // Reset the quantity counter
            currentQty = 1;

            if (qtyValSpan) qtyValSpan.textContent = currentQty;
        });
    }

    // 8 + 9. Filter dishes by category and search query
    const filterTabs = document.querySelectorAll('.filter-tabs .tab-btn');
    const dishCards = document.querySelectorAll('.dishes-grid .dish-card');
    const searchInput = document.getElementById('searchInput') || document.querySelector('.search-box input');

    let activeFilter = 'all';

    // Apply the selected category filter and search query together
    function applyFilters() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        dishCards.forEach(card => {
            const category = card.getAttribute('data-category') || '';
            const title = card.querySelector('.dish-title, .dish-name').textContent.toLowerCase();

            const matchCategory = activeFilter === 'all' || category === activeFilter;
            const matchSearch = title.includes(query);

            // Show only dishes that match both conditions
            card.style.display = (matchCategory && matchSearch) ? 'flex' : 'none';
        });
    }

    // Handle category filter tab clicks
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update the active category filter
            activeFilter = tab.getAttribute('data-filter') || tab.textContent.trim().toLowerCase();

            applyFilters();
        });
    });

    // Update the displayed dishes whenever the user types in the search field
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
});


// Close the mobile navigation menu after clicking a navigation link
document.querySelectorAll('.navbar-nav .nav-link, .navbar-nav .dropdown-item').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('navbarSupportedContent').classList.remove('show');
    });
});

