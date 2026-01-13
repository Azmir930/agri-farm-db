/**
 * Agriculture Product Marketplace
 * API Communication Layer
 */

const API_BASE = 'http://localhost/PHP_BACKEND';

/**
 * API Helper Class
 */
const API = {
  /**
   * Get stored auth token
   */
  getToken() {
    return localStorage.getItem('auth_token');
  },

  /**
   * Set auth token
   */
  setToken(token) {
    localStorage.setItem('auth_token', token);
  },

  /**
   * Remove auth token
   */
  removeToken() {
    localStorage.removeItem('auth_token');
  },

  /**
   * Get default headers
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  /**
   * Handle API response
   */
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        this.removeToken();
        window.location.href = '/common/login.html';
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(data.error || 'An error occurred');
    }
    
    return data;
  },

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    try {
      const url = new URL(API_BASE + endpoint);
      Object.keys(params).forEach(key => 
        url.searchParams.append(key, params[key])
      );
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    try {
      const response = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },

  /**
   * PUT request
   */
  async put(endpoint, data = {}) {
    try {
      const response = await fetch(API_BASE + endpoint, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  /**
   * DELETE request
   */
  async delete(endpoint) {
    try {
      const response = await fetch(API_BASE + endpoint, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },

  /**
   * Upload file
   */
  async upload(endpoint, formData) {
    try {
      const headers = {};
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: headers,
        body: formData,
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('API Upload Error:', error);
      throw error;
    }
  }
};

// ============================================
// AUTH API
// ============================================
const AuthAPI = {
  async login(email, password) {
    const response = await API.post('/auth/login.php', { email, password });
    if (response.token) {
      API.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  async register(userData) {
    return await API.post('/auth/register.php', userData);
  },

  async logout() {
    try {
      await API.post('/auth/logout.php');
    } finally {
      API.removeToken();
      localStorage.removeItem('user');
      window.location.href = '/common/login.html';
    }
  },

  async forgotPassword(email) {
    return await API.post('/auth/password_reset.php', { action: 'request', email });
  },

  async resetPassword(token, password) {
    return await API.post('/auth/password_reset.php', { 
      action: 'reset', 
      token, 
      password 
    });
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn() {
    return !!API.getToken();
  }
};

// ============================================
// PRODUCTS API
// ============================================
const ProductsAPI = {
  async getAll(params = {}) {
    return await API.get('/buyer/products.php', params);
  },

  async getById(productId) {
    return await API.get('/buyer/products.php', { id: productId });
  },

  async search(query, type = 'products', limit = 10) {
    return await API.get('/api/search.php', { q: query, type, limit });
  },

  async getCategories() {
    return await API.get('/api/categories.php');
  },

  // Farmer methods
  async create(productData) {
    return await API.post('/farmer/products.php', productData);
  },

  async update(productId, productData) {
    return await API.put('/farmer/products.php', { id: productId, ...productData });
  },

  async delete(productId) {
    return await API.delete(`/farmer/products.php?id=${productId}`);
  },

  async updateStock(productId, changeQuantity, changeType, notes = '') {
    return await API.post('/farmer/inventory.php', {
      product_id: productId,
      change_quantity: changeQuantity,
      change_type: changeType,
      notes
    });
  },

  async getInventory(params = {}) {
    return await API.get('/farmer/inventory.php', params);
  }
};

// ============================================
// CART API
// ============================================
const CartAPI = {
  async add(productId, quantity = 1) {
    return await API.post('/api/cart.php', { 
      action: 'add', 
      product_id: productId, 
      quantity 
    });
  },

  async update(productId, quantity) {
    return await API.post('/api/cart.php', { 
      action: 'update', 
      product_id: productId, 
      quantity 
    });
  },

  async remove(productId) {
    return await API.post('/api/cart.php', { 
      action: 'remove', 
      product_id: productId 
    });
  },

  async validate(items) {
    return await API.post('/buyer/cart.php', { items });
  },

  async checkStock(productId, quantity) {
    return await API.get('/api/stock.php', { product_id: productId, quantity });
  },

  // Local cart management
  getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  },

  saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  },

  clearCart() {
    localStorage.removeItem('cart');
  }
};

// ============================================
// ORDERS API
// ============================================
const OrdersAPI = {
  // Buyer methods
  async create(orderData) {
    return await API.post('/buyer/checkout.php', orderData);
  },

  async getBuyerOrders(params = {}) {
    return await API.get('/buyer/orders.php', params);
  },

  async getBuyerOrderById(orderId) {
    return await API.get('/buyer/orders.php', { id: orderId });
  },

  async cancelOrder(orderId, reason) {
    return await API.post('/buyer/orders.php', { 
      action: 'cancel', 
      order_id: orderId, 
      reason 
    });
  },

  // Farmer methods
  async getFarmerOrders(params = {}) {
    return await API.get('/farmer/orders.php', params);
  },

  async updateOrderStatus(orderId, status, notes = '') {
    return await API.post('/farmer/orders.php', { 
      order_id: orderId, 
      status, 
      notes 
    });
  },

  // Admin methods
  async getAllOrders(params = {}) {
    return await API.get('/admin/orders.php', params);
  },

  async adminUpdateOrder(orderId, data) {
    return await API.put('/admin/orders.php', { id: orderId, ...data });
  }
};

// ============================================
// REVIEWS API
// ============================================
const ReviewsAPI = {
  // Buyer methods
  async submit(reviewData) {
    return await API.post('/buyer/reviews.php', reviewData);
  },

  async update(reviewId, reviewData) {
    return await API.put('/buyer/reviews.php', { id: reviewId, ...reviewData });
  },

  async delete(reviewId) {
    return await API.delete(`/buyer/reviews.php?id=${reviewId}`);
  },

  async getProductReviews(productId, params = {}) {
    return await API.get('/buyer/reviews.php', { product_id: productId, ...params });
  },

  // Farmer methods
  async getFarmerReviews(params = {}) {
    return await API.get('/farmer/reviews.php', params);
  }
};

// ============================================
// WISHLIST API
// ============================================
const WishlistAPI = {
  async get() {
    return await API.get('/buyer/wishlist.php');
  },

  async add(productId) {
    return await API.post('/buyer/wishlist.php', { 
      action: 'add', 
      product_id: productId 
    });
  },

  async remove(productId) {
    return await API.post('/buyer/wishlist.php', { 
      action: 'remove', 
      product_id: productId 
    });
  },

  async toggle(productId) {
    return await API.post('/buyer/wishlist.php', { 
      action: 'toggle', 
      product_id: productId 
    });
  }
};

// ============================================
// ADMIN API
// ============================================
const AdminAPI = {
  // Users
  async getUsers(params = {}) {
    return await API.get('/admin/users.php', params);
  },

  async updateUser(userId, data) {
    return await API.put('/admin/users.php', { id: userId, ...data });
  },

  async approveKYC(userId) {
    return await API.post('/admin/users.php', { 
      action: 'approve_kyc', 
      user_id: userId 
    });
  },

  async rejectKYC(userId, reason) {
    return await API.post('/admin/users.php', { 
      action: 'reject_kyc', 
      user_id: userId, 
      reason 
    });
  },

  // Products
  async getProducts(params = {}) {
    return await API.get('/admin/products.php', params);
  },

  async moderateProduct(productId, action, reason = '') {
    return await API.post('/admin/products.php', { 
      action, 
      product_id: productId, 
      reason 
    });
  },

  // Payments
  async getPayments(params = {}) {
    return await API.get('/admin/payments.php', params);
  },

  async processRefund(paymentId, amount, reason) {
    return await API.post('/admin/payments.php', { 
      action: 'refund', 
      payment_id: paymentId, 
      amount, 
      reason 
    });
  },

  // Analytics
  async getAnalytics(period = 30) {
    return await API.get('/admin/analytics.php', { period });
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    API, 
    AuthAPI, 
    ProductsAPI, 
    CartAPI, 
    OrdersAPI, 
    ReviewsAPI, 
    WishlistAPI, 
    AdminAPI 
  };
}
