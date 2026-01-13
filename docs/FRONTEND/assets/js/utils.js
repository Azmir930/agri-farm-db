/**
 * Agriculture Product Marketplace
 * Utility Functions
 */

// ============================================
// CURRENCY FORMATTING
// ============================================
function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

// ============================================
// DATE FORMATTING
// ============================================
function formatDate(dateString, options = {}) {
  const date = new Date(dateString);
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-IN', { ...defaultOptions, ...options });
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  return formatDate(dateString);
}

// ============================================
// ALERTS & TOASTS
// ============================================
function showAlert(message, type = 'info', container = null) {
  const alertHtml = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  
  if (container) {
    container.insertAdjacentHTML('afterbegin', alertHtml);
  } else {
    const alertContainer = document.getElementById('alertContainer') || document.querySelector('.alert-container');
    if (alertContainer) {
      alertContainer.insertAdjacentHTML('afterbegin', alertHtml);
    }
  }
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    const alert = document.querySelector('.alert');
    if (alert) {
      bootstrap.Alert.getOrCreateInstance(alert).close();
    }
  }, 5000);
}

function showToast(message, type = 'info') {
  // Create toast container if not exists
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }
  
  const iconMap = {
    success: 'bi-check-circle-fill text-success',
    danger: 'bi-x-circle-fill text-danger',
    warning: 'bi-exclamation-triangle-fill text-warning',
    info: 'bi-info-circle-fill text-info'
  };
  
  const toastId = 'toast-' + Date.now();
  const toastHtml = `
    <div id="${toastId}" class="toast" role="alert">
      <div class="toast-header">
        <i class="bi ${iconMap[type]} me-2"></i>
        <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
        <small>Just now</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    </div>
  `;
  
  toastContainer.insertAdjacentHTML('beforeend', toastHtml);
  
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 4000 });
  toast.show();
  
  // Remove from DOM after hidden
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

// ============================================
// STRING UTILITIES
// ============================================
function truncate(str, length = 100) {
  if (str.length <= length) return str;
  return str.substring(0, length).trim() + '...';
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function titleCase(str) {
  return str.replace(/\w\S*/g, txt => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

// ============================================
// NUMBER UTILITIES
// ============================================
function formatNumber(num) {
  return new Intl.NumberFormat('en-IN').format(num);
}

function formatCompactNumber(num) {
  const formatter = new Intl.NumberFormat('en', { notation: 'compact' });
  return formatter.format(num);
}

function roundTo(num, decimals = 2) {
  return Number(Math.round(num + 'e' + decimals) + 'e-' + decimals);
}

// ============================================
// URL UTILITIES
// ============================================
function getUrlParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

function getUrlParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function updateUrlParam(key, value) {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.pushState({}, '', url);
}

function removeUrlParam(key) {
  const url = new URL(window.location.href);
  url.searchParams.delete(key);
  window.history.pushState({}, '', url);
}

// ============================================
// DEBOUNCE & THROTTLE
// ============================================
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================
// STORAGE UTILITIES
// ============================================
const Storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove(key) {
    localStorage.removeItem(key);
  },
  
  clear() {
    localStorage.clear();
  }
};

// ============================================
// VALIDATION UTILITIES
// ============================================
const Validate = {
  email(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  
  phone(phone) {
    return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
  },
  
  pincode(pincode) {
    return /^\d{6}$/.test(pincode);
  },
  
  password(password) {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  },
  
  required(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },
  
  minLength(value, length) {
    return value && value.length >= length;
  },
  
  maxLength(value, length) {
    return !value || value.length <= length;
  },
  
  numeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
  
  url(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

// ============================================
// RATING STARS
// ============================================
function renderStars(rating, maxRating = 5, size = 'sm') {
  let html = '<div class="rating">';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 1; i <= maxRating; i++) {
    if (i <= fullStars) {
      html += `<i class="bi bi-star-fill"></i>`;
    } else if (i === fullStars + 1 && hasHalfStar) {
      html += `<i class="bi bi-star-half"></i>`;
    } else {
      html += `<i class="bi bi-star empty"></i>`;
    }
  }
  
  html += '</div>';
  return html;
}

function initRatingInput(container) {
  const stars = container.querySelectorAll('i');
  const input = container.querySelector('input[type="hidden"]');
  
  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      const rating = index + 1;
      input.value = rating;
      
      stars.forEach((s, i) => {
        s.className = i < rating ? 'bi bi-star-fill' : 'bi bi-star';
      });
    });
    
    star.addEventListener('mouseenter', () => {
      stars.forEach((s, i) => {
        s.className = i <= index ? 'bi bi-star-fill' : 'bi bi-star';
      });
    });
  });
  
  container.addEventListener('mouseleave', () => {
    const currentRating = parseInt(input.value) || 0;
    stars.forEach((s, i) => {
      s.className = i < currentRating ? 'bi bi-star-fill' : 'bi bi-star';
    });
  });
}

// ============================================
// ORDER STATUS BADGE
// ============================================
function getStatusBadge(status) {
  const statusMap = {
    pending: { class: 'badge-pending', label: 'Pending' },
    confirmed: { class: 'badge-processing', label: 'Confirmed' },
    processing: { class: 'badge-processing', label: 'Processing' },
    shipped: { class: 'badge-shipped', label: 'Shipped' },
    delivered: { class: 'badge-delivered', label: 'Delivered' },
    cancelled: { class: 'badge-cancelled', label: 'Cancelled' },
    refunded: { class: 'badge-cancelled', label: 'Refunded' }
  };
  
  const config = statusMap[status.toLowerCase()] || { class: 'badge-secondary', label: status };
  return `<span class="badge badge-status ${config.class}">${config.label}</span>`;
}

// ============================================
// COPY TO CLIPBOARD
// ============================================
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Copied to clipboard!', 'success');
    return true;
  }
}

// ============================================
// SCROLL UTILITIES
// ============================================
function scrollToTop(smooth = true) {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
}

function scrollToElement(element, offset = 0) {
  const target = typeof element === 'string' ? document.querySelector(element) : element;
  if (!target) return;
  
  const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

// ============================================
// LOADING STATE
// ============================================
function showLoading(container = document.body) {
  const loader = document.createElement('div');
  loader.className = 'loading-overlay';
  loader.id = 'loadingOverlay';
  loader.innerHTML = `
    <div class="text-center">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="mt-2 text-muted">Loading...</div>
    </div>
  `;
  container.appendChild(loader);
}

function hideLoading() {
  document.getElementById('loadingOverlay')?.remove();
}

// ============================================
// IMAGE UTILITIES
// ============================================
function getImagePlaceholder(width = 300, height = 200, text = '') {
  return `https://via.placeholder.com/${width}x${height}/EEEEEE/999999?text=${encodeURIComponent(text || `${width}x${height}`)}`;
}

function handleImageError(img, placeholder = null) {
  img.onerror = null;
  img.src = placeholder || '/assets/images/placeholder.jpg';
}

// ============================================
// DEVICE DETECTION
// ============================================
const Device = {
  isMobile() {
    return window.innerWidth < 768;
  },
  
  isTablet() {
    return window.innerWidth >= 768 && window.innerWidth < 992;
  },
  
  isDesktop() {
    return window.innerWidth >= 992;
  },
  
  isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
};

// ============================================
// EXPORT FOR MODULES
// ============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatCurrency,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    showAlert,
    showToast,
    truncate,
    slugify,
    capitalize,
    titleCase,
    formatNumber,
    formatCompactNumber,
    roundTo,
    getUrlParams,
    getUrlParam,
    updateUrlParam,
    removeUrlParam,
    debounce,
    throttle,
    Storage,
    Validate,
    renderStars,
    getStatusBadge,
    copyToClipboard,
    scrollToTop,
    scrollToElement,
    showLoading,
    hideLoading,
    Device
  };
}
