/* ═══════════════════════════════════════════════════════════════
   K-market – script.js
   ═══════════════════════════════════════════════════════════════ */

// ── Navbar scroll shadow ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Hamburger menu toggle ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  const open = navLinks.style.display === 'flex';
  navLinks.style.display = open ? 'none' : 'flex';
  navLinks.style.flexDirection = 'column';
  navLinks.style.position = 'absolute';
  navLinks.style.top = '64px';
  navLinks.style.left = '0';
  navLinks.style.right = '0';
  navLinks.style.background = '#fff';
  navLinks.style.padding = '16px 24px';
  navLinks.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
  navLinks.style.zIndex = '999';
});

// ── Active nav link on scroll ──
const sections = document.querySelectorAll('section[id], div[id]');
const links    = document.querySelectorAll('.nav-link');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(l => l.classList.remove('active'));
      const match = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (match) match.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => observer.observe(s));

// ── Scroll reveal ──
const revealEls = document.querySelectorAll(
  '.category-card, .product-card, .feature-item, .stat-item, .hero-content'
);
revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

// ── Show more button ──
const showMoreBtn = document.getElementById('btn-show-more');
if (showMoreBtn) {
  showMoreBtn.addEventListener('click', () => {
    showMoreBtn.textContent = 'Loading...';
    setTimeout(() => { showMoreBtn.textContent = 'No more products'; showMoreBtn.disabled = true; }, 800);
  });
}

// ── Cart Navigation ──
const cartBtn = document.getElementById('btn-cart');
if (cartBtn) {
  cartBtn.addEventListener('click', () => {
    window.location.href = 'cart.html';
  });
}

// ── Cart Logic ──
const CartManager = {
  getCart() {
    return JSON.parse(localStorage.getItem('kmarket_cart') || '[]');
  },
  saveCart(cart) {
    localStorage.setItem('kmarket_cart', JSON.stringify(cart));
    this.updateBadge();
  },
  addItem(item) {
    const cart = this.getCart();
    const existing = cart.find(i => i.name === item.name);
    if (existing) {
      existing.quantity += 1;
    } else {
      item.quantity = 1;
      cart.push(item);
    }
    this.saveCart(cart);
  },
  updateBadge() {
    const cart = this.getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('#cart-badge');
    badges.forEach(badge => {
      badge.textContent = totalItems;
      badge.style.transform = 'scale(1.5)';
      setTimeout(() => badge.style.transform = '', 200);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  CartManager.updateBadge(); // Initial badge update

  // Attach click listener to all Add to Cart buttons
  document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart-btn')) {
      const btn = e.target;
      const card = btn.closest('.product-card');
      if (card) {
        const name = card.querySelector('.product-name').textContent;
        const priceStr = card.querySelector('.price-current').textContent;
        // Parse price: extract numbers (ignoring commas, Rp, $, etc.)
        const priceNum = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
        const img = card.querySelector('img').src;

        CartManager.addItem({
          name: name,
          price: priceNum,
          priceStr: priceStr,
          img: img
        });

        // Visual feedback
        const origText = btn.textContent;
        btn.textContent = 'Added!';
        setTimeout(() => btn.textContent = origText, 1000);
      }
    }
  });
});


// ── Filtering and Sorting ──
document.addEventListener('DOMContentLoaded', () => {
  const filterItems = document.querySelectorAll('[data-filter-type]');
  const applyBtn = document.querySelector('.btn-apply-filter');
  const sortSelect = document.querySelector('.sort-select');
  const productGrid = document.querySelector('.cat-products-grid');

  if (!productGrid) return; // Not on a category page

  // Handle filter selection
  filterItems.forEach(item => {
    item.addEventListener('click', function() {
      // For category list items, we might want single selection, but let's do multi-select for all to be safe
      this.classList.toggle('active');
    });
  });

  // Handle Apply Filters
  if (applyBtn) {
    applyBtn.addEventListener('click', applyFilters);
  }

  function applyFilters() {
    const activeFilters = {
      category: [],
      color: [],
      style: []
    };

    // Gather active filters
    document.querySelectorAll('[data-filter-type].active').forEach(item => {
      const type = item.getAttribute('data-filter-type');
      const val = item.getAttribute('data-filter-val');
      if (type && val) {
        activeFilters[type].push(val);
      }
    });

    // Filter products
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
      const pCat = product.getAttribute('data-category');
      const pCol = product.getAttribute('data-color');
      const pSty = product.getAttribute('data-style');

      const matchCat = activeFilters.category.length === 0 || activeFilters.category.includes(pCat);
      const matchCol = activeFilters.color.length === 0 || activeFilters.color.includes(pCol);
      const matchSty = activeFilters.style.length === 0 || activeFilters.style.includes(pSty);

      if (matchCat && matchCol && matchSty) {
        product.style.display = 'block';
        // Give a little animation when it appears
        product.style.animation = 'none';
        product.offsetHeight; /* trigger reflow */
        product.style.animation = null; 
      } else {
        product.style.display = 'none';
      }
    });
  }

  // Handle Sorting
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      const val = this.value;
      const products = Array.from(document.querySelectorAll('.product-card'));
      
      if (val === 'Price: Low to High' || val === 'Price: High to Low') {
        products.sort((a, b) => {
          const priceA = parseFloat(a.getAttribute('data-price') || 0);
          const priceB = parseFloat(b.getAttribute('data-price') || 0);
          
          if (val === 'Price: Low to High') {
            return priceA - priceB;
          } else {
            return priceB - priceA;
          }
        });

        // Re-append to grid
        products.forEach(p => productGrid.appendChild(p));
      }
      // For "Most Popular" and "New Arrivals", we don't have data, so we could revert to original order 
      // but for now, we just leave them sorted as is if selected, or we could store original order.
    });
  }
});

// ── Custom Toast Notification ──
function showToast(message, duration = 3000) {
  let toast = document.querySelector('.toast-container');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-container';
    toast.innerHTML = `
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span class="toast-message"></span>
    `;
    document.body.appendChild(toast);
  }
  
  toast.querySelector('.toast-message').textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Example usage to replace alert:
// showToast('Thank you for your feedback!');
