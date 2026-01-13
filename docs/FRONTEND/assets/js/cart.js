/**
 * Agriculture Product Marketplace
 * Cart Functionality
 */

// ============================================
// CART STATE
// ============================================
let cart = [];

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  loadCart();
  updateCartUI();
  initCartEventListeners();
});

// ============================================
// LOAD CART FROM STORAGE
// ============================================
function loadCart() {
  cart = CartAPI.getCart();
}

// ============================================
// SAVE CART TO STORAGE
// ============================================
function saveCart() {
  CartAPI.saveCart(cart);
  updateCartUI();
}

// ============================================
// ADD TO CART
// ============================================
async function addToCart(productId, quantity = 1) {
  try {
    // Check stock availability first
    const stockCheck = await CartAPI.checkStock(productId, quantity);
    
    if (!stockCheck.available) {
      showToast(`Sorry, only ${stockCheck.available_quantity} items available`, 'warning');
      return false;
    }
    
    // Find if product already in cart
    const existingIndex = cart.findIndex(item => item.product_id === productId);
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      // Fetch product details
      const product = await ProductsAPI.getById(productId);
      cart.push({
        product_id: productId,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '/assets/images/placeholder.jpg',
        quantity: quantity,
        farmer_id: product.farmer_id,
        farmer_name: product.farmer_name,
        unit: product.unit
      });
    }
    
    saveCart();
    showToast('Added to cart successfully!', 'success');
    return true;
  } catch (error) {
    showToast('Failed to add to cart', 'danger');
    return false;
  }
}

// ============================================
// UPDATE CART ITEM QUANTITY
// ============================================
async function updateCartItemQuantity(productId, quantity) {
  if (quantity < 1) {
    removeFromCart(productId);
    return;
  }
  
  try {
    // Check stock
    const stockCheck = await CartAPI.checkStock(productId, quantity);
    
    if (!stockCheck.available) {
      showToast(`Sorry, only ${stockCheck.available_quantity} items available`, 'warning');
      quantity = stockCheck.available_quantity;
    }
    
    const index = cart.findIndex(item => item.product_id === productId);
    if (index > -1) {
      cart[index].quantity = quantity;
      saveCart();
      renderCartItems();
    }
  } catch (error) {
    showToast('Failed to update quantity', 'danger');
  }
}

// ============================================
// REMOVE FROM CART
// ============================================
function removeFromCart(productId) {
  cart = cart.filter(item => item.product_id !== productId);
  saveCart();
  renderCartItems();
  showToast('Item removed from cart', 'info');
}

// ============================================
// CLEAR CART
// ============================================
function clearCart() {
  cart = [];
  saveCart();
  renderCartItems();
}

// ============================================
// GET CART TOTALS
// ============================================
function getCartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + shipping + tax;
  
  return {
    subtotal,
    shipping,
    tax,
    total,
    itemCount: cart.reduce((count, item) => count + item.quantity, 0)
  };
}

// ============================================
// UPDATE CART UI
// ============================================
function updateCartUI() {
  const totals = getCartTotals();
  
  // Update cart count badges
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = totals.itemCount;
    el.style.display = totals.itemCount > 0 ? '' : 'none';
  });
  
  // Update mini cart if exists
  const miniCartTotal = document.getElementById('miniCartTotal');
  if (miniCartTotal) {
    miniCartTotal.textContent = formatCurrency(totals.total);
  }
}

// ============================================
// RENDER CART ITEMS
// ============================================
function renderCartItems() {
  const container = document.getElementById('cartItems');
  if (!container) return;
  
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-cart-x"></i>
        <h4>Your cart is empty</h4>
        <p>Looks like you haven't added any products yet.</p>
        <a href="/buyer/products.html" class="btn btn-primary">
          <i class="bi bi-shop me-2"></i>Browse Products
        </a>
      </div>
    `;
    updateCartSummary();
    return;
  }
  
  let html = '';
  cart.forEach(item => {
    html += `
      <div class="cart-item" data-product-id="${item.product_id}">
        <div class="row align-items-center">
          <div class="col-auto">
            <img src="${item.image}" alt="${item.name}" class="product-thumb">
          </div>
          <div class="col">
            <h6 class="mb-1">${item.name}</h6>
            <small class="text-muted">Sold by: ${item.farmer_name}</small>
            <div class="text-primary fw-bold mt-1">
              ${formatCurrency(item.price)} / ${item.unit}
            </div>
          </div>
          <div class="col-auto">
            <div class="quantity-control">
              <button class="btn btn-outline-secondary btn-sm" onclick="updateCartItemQuantity('${item.product_id}', ${item.quantity - 1})">
                <i class="bi bi-dash"></i>
              </button>
              <input type="number" class="form-control form-control-sm" 
                value="${item.quantity}" min="1" 
                onchange="updateCartItemQuantity('${item.product_id}', parseInt(this.value))">
              <button class="btn btn-outline-secondary btn-sm" onclick="updateCartItemQuantity('${item.product_id}', ${item.quantity + 1})">
                <i class="bi bi-plus"></i>
              </button>
            </div>
          </div>
          <div class="col-auto text-end">
            <div class="fw-bold">${formatCurrency(item.price * item.quantity)}</div>
            <button class="btn btn-link text-danger btn-sm p-0 mt-1" onclick="removeFromCart('${item.product_id}')">
              <i class="bi bi-trash"></i> Remove
            </button>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  updateCartSummary();
}

// ============================================
// UPDATE CART SUMMARY
// ============================================
function updateCartSummary() {
  const totals = getCartTotals();
  
  const subtotalEl = document.getElementById('cartSubtotal');
  const shippingEl = document.getElementById('cartShipping');
  const taxEl = document.getElementById('cartTax');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  
  if (subtotalEl) subtotalEl.textContent = formatCurrency(totals.subtotal);
  if (shippingEl) shippingEl.textContent = totals.shipping === 0 ? 'FREE' : formatCurrency(totals.shipping);
  if (taxEl) taxEl.textContent = formatCurrency(totals.tax);
  if (totalEl) totalEl.textContent = formatCurrency(totals.total);
  
  if (checkoutBtn) {
    checkoutBtn.disabled = cart.length === 0;
  }
  
  // Free shipping message
  const freeShippingMsg = document.getElementById('freeShippingMessage');
  if (freeShippingMsg) {
    if (totals.subtotal >= 500) {
      freeShippingMsg.innerHTML = '<i class="bi bi-check-circle text-success me-2"></i>You qualify for free shipping!';
      freeShippingMsg.className = 'alert alert-success py-2';
    } else {
      const remaining = 500 - totals.subtotal;
      freeShippingMsg.innerHTML = `<i class="bi bi-truck me-2"></i>Add ${formatCurrency(remaining)} more for free shipping`;
      freeShippingMsg.className = 'alert alert-info py-2';
    }
  }
  
  updateCartUI();
}

// ============================================
// EVENT LISTENERS
// ============================================
function initCartEventListeners() {
  // Add to cart buttons
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      const productId = this.dataset.productId;
      const quantity = parseInt(this.dataset.quantity || 1);
      
      this.disabled = true;
      this.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
      
      await addToCart(productId, quantity);
      
      this.disabled = false;
      this.innerHTML = '<i class="bi bi-cart-plus me-2"></i>Add to Cart';
    });
  });
  
  // Quantity input on product page
  const quantityInput = document.getElementById('productQuantity');
  if (quantityInput) {
    const minusBtn = document.getElementById('quantityMinus');
    const plusBtn = document.getElementById('quantityPlus');
    
    if (minusBtn) {
      minusBtn.addEventListener('click', () => {
        const current = parseInt(quantityInput.value);
        if (current > 1) quantityInput.value = current - 1;
      });
    }
    
    if (plusBtn) {
      plusBtn.addEventListener('click', () => {
        const current = parseInt(quantityInput.value);
        const max = parseInt(quantityInput.max || 999);
        if (current < max) quantityInput.value = current + 1;
      });
    }
  }
  
  // Proceed to checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      if (!AuthAPI.isLoggedIn()) {
        window.location.href = '/common/login.html?redirect=/buyer/checkout.html';
        return;
      }
      window.location.href = '/buyer/checkout.html';
    });
  }
  
  // Clear cart button
  const clearCartBtn = document.getElementById('clearCartBtn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear your cart?')) {
        clearCart();
      }
    });
  }
}

// ============================================
// APPLY COUPON
// ============================================
async function applyCoupon(code) {
  // This would typically validate with the backend
  try {
    // Placeholder for coupon validation
    showToast('Coupon functionality coming soon!', 'info');
  } catch (error) {
    showToast('Invalid coupon code', 'danger');
  }
}

// ============================================
// MINI CART DROPDOWN
// ============================================
function renderMiniCart() {
  const container = document.getElementById('miniCartItems');
  if (!container) return;
  
  if (cart.length === 0) {
    container.innerHTML = '<div class="text-center py-3 text-muted">Your cart is empty</div>';
    return;
  }
  
  let html = '';
  cart.slice(0, 3).forEach(item => {
    html += `
      <div class="d-flex gap-2 p-2 border-bottom">
        <img src="${item.image}" alt="${item.name}" 
          style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
        <div class="flex-grow-1">
          <div class="small fw-medium">${item.name}</div>
          <div class="small text-muted">${item.quantity} x ${formatCurrency(item.price)}</div>
        </div>
        <button class="btn btn-link text-danger p-0" onclick="removeFromCart('${item.product_id}')">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `;
  });
  
  if (cart.length > 3) {
    html += `<div class="text-center py-2 small text-muted">+ ${cart.length - 3} more items</div>`;
  }
  
  container.innerHTML = html;
}
