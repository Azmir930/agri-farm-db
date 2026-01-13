/**
 * Agriculture Product Marketplace
 * Main Application JavaScript
 */

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

// ============================================
// INITIALIZE APP
// ============================================
function initializeApp() {
  // Initialize tooltips
  initTooltips();
  
  // Initialize popovers
  initPopovers();
  
  // Initialize search
  initLiveSearch();
  
  // Initialize sidebar toggle (mobile)
  initSidebarToggle();
  
  // Initialize file uploads
  initFileUploads();
  
  // Initialize data tables
  initDataTables();
  
  // Initialize form validation
  initFormValidation();
  
  // Load notifications
  loadNotifications();
  
  // Initialize lazy loading
  initLazyLoading();
}

// ============================================
// TOOLTIPS
// ============================================
function initTooltips() {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  [...tooltipTriggerList].map(el => new bootstrap.Tooltip(el));
}

// ============================================
// POPOVERS
// ============================================
function initPopovers() {
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  [...popoverTriggerList].map(el => new bootstrap.Popover(el));
}

// ============================================
// LIVE SEARCH
// ============================================
function initLiveSearch() {
  const searchInput = document.getElementById('globalSearch');
  const searchResults = document.getElementById('searchResults');
  
  if (!searchInput || !searchResults) return;
  
  let debounceTimer;
  
  searchInput.addEventListener('input', function() {
    const query = this.value.trim();
    
    clearTimeout(debounceTimer);
    
    if (query.length < 2) {
      searchResults.style.display = 'none';
      return;
    }
    
    debounceTimer = setTimeout(async () => {
      try {
        const results = await ProductsAPI.search(query);
        renderSearchResults(results, searchResults);
      } catch (error) {
        console.error('Search error:', error);
      }
    }, 300);
  });
  
  // Close search results on click outside
  document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });
  
  // Show results on focus if there are results
  searchInput.addEventListener('focus', function() {
    if (searchResults.children.length > 0 && this.value.trim().length >= 2) {
      searchResults.style.display = 'block';
    }
  });
}

function renderSearchResults(results, container) {
  if (!results.data || results.data.length === 0) {
    container.innerHTML = '<div class="p-3 text-muted text-center">No products found</div>';
    container.style.display = 'block';
    return;
  }
  
  let html = '';
  results.data.forEach(product => {
    html += `
      <a href="/buyer/product-details.html?id=${product.id}" class="search-result-item">
        <img src="${product.image || '/assets/images/placeholder.jpg'}" alt="${product.name}">
        <div class="search-result-info">
          <div class="search-result-name">${product.name}</div>
          <div class="search-result-price">${formatCurrency(product.price)} / ${product.unit}</div>
        </div>
      </a>
    `;
  });
  
  if (results.total > results.data.length) {
    html += `
      <a href="/buyer/products.html?search=${encodeURIComponent(document.getElementById('globalSearch').value)}" 
        class="d-block text-center py-2 border-top text-primary">
        View all ${results.total} results
      </a>
    `;
  }
  
  container.innerHTML = html;
  container.style.display = 'block';
}

// ============================================
// SIDEBAR TOGGLE (MOBILE)
// ============================================
function initSidebarToggle() {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.dashboard-sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  if (!sidebarToggle || !sidebar) return;
  
  sidebarToggle.addEventListener('click', function() {
    sidebar.classList.toggle('show');
    overlay?.classList.toggle('show');
  });
  
  overlay?.addEventListener('click', function() {
    sidebar.classList.remove('show');
    this.classList.remove('show');
  });
}

// ============================================
// FILE UPLOADS
// ============================================
function initFileUploads() {
  const fileUploads = document.querySelectorAll('.file-upload');
  
  fileUploads.forEach(upload => {
    const input = upload.querySelector('input[type="file"]');
    const previewContainer = upload.nextElementSibling;
    
    // Drag and drop
    upload.addEventListener('dragover', e => {
      e.preventDefault();
      upload.classList.add('dragover');
    });
    
    upload.addEventListener('dragleave', () => {
      upload.classList.remove('dragover');
    });
    
    upload.addEventListener('drop', e => {
      e.preventDefault();
      upload.classList.remove('dragover');
      
      if (e.dataTransfer.files.length) {
        input.files = e.dataTransfer.files;
        handleFileSelect(input, previewContainer);
      }
    });
    
    // File select
    input.addEventListener('change', () => {
      handleFileSelect(input, previewContainer);
    });
  });
}

function handleFileSelect(input, previewContainer) {
  if (!previewContainer) return;
  
  previewContainer.innerHTML = '';
  
  Array.from(input.files).forEach((file, index) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.createElement('div');
      preview.className = 'image-preview';
      preview.innerHTML = `
        <img src="${e.target.result}" alt="Preview">
        <button type="button" class="remove-btn" onclick="removePreview(this, ${index})">
          <i class="bi bi-x"></i>
        </button>
      `;
      previewContainer.appendChild(preview);
    };
    reader.readAsDataURL(file);
  });
}

function removePreview(btn, index) {
  const preview = btn.closest('.image-preview');
  preview.remove();
  // Note: Can't modify FileList directly, would need DataTransfer API for full implementation
}

// ============================================
// DATA TABLES
// ============================================
function initDataTables() {
  // Add sorting functionality to tables with .sortable class
  document.querySelectorAll('table.sortable th[data-sort]').forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', function() {
      const table = this.closest('table');
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
      const column = this.dataset.sort;
      const isNumeric = this.dataset.type === 'number';
      const currentOrder = this.dataset.order || 'asc';
      const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
      
      // Reset other headers
      table.querySelectorAll('th[data-sort]').forEach(header => {
        header.dataset.order = '';
        header.querySelector('.sort-icon')?.remove();
      });
      
      // Set new order
      this.dataset.order = newOrder;
      this.innerHTML += `<i class="bi bi-chevron-${newOrder === 'asc' ? 'up' : 'down'} sort-icon ms-1"></i>`;
      
      // Sort rows
      rows.sort((a, b) => {
        const aVal = a.querySelector(`td:nth-child(${this.cellIndex + 1})`).textContent.trim();
        const bVal = b.querySelector(`td:nth-child(${this.cellIndex + 1})`).textContent.trim();
        
        if (isNumeric) {
          return newOrder === 'asc' 
            ? parseFloat(aVal) - parseFloat(bVal)
            : parseFloat(bVal) - parseFloat(aVal);
        }
        
        return newOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
      
      // Reorder DOM
      rows.forEach(row => tbody.appendChild(row));
    });
  });
}

// ============================================
// FORM VALIDATION
// ============================================
function initFormValidation() {
  const forms = document.querySelectorAll('.needs-validation');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      }
      form.classList.add('was-validated');
    });
  });
}

// ============================================
// NOTIFICATIONS
// ============================================
async function loadNotifications() {
  const container = document.getElementById('notificationsList');
  if (!container) return;
  
  // Placeholder - would load from API
  const notifications = [
    { type: 'order', message: 'New order #ORD-001 received', time: '5 min ago', unread: true },
    { type: 'payment', message: 'Payment received for order #ORD-002', time: '1 hour ago', unread: true },
    { type: 'review', message: 'New review on Fresh Tomatoes', time: '2 hours ago', unread: false },
  ];
  
  let html = '';
  notifications.forEach(notif => {
    const iconClass = {
      order: 'bi-bag text-primary',
      payment: 'bi-credit-card text-success',
      review: 'bi-star text-warning',
      alert: 'bi-exclamation-triangle text-danger'
    }[notif.type] || 'bi-bell';
    
    html += `
      <div class="notification-item ${notif.unread ? 'unread' : ''}">
        <div class="notification-icon">
          <i class="bi ${iconClass}"></i>
        </div>
        <div class="notification-content">
          <div class="notification-text">${notif.message}</div>
          <div class="notification-time">${notif.time}</div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Update notification count
  const unreadCount = notifications.filter(n => n.unread).length;
  document.querySelectorAll('.notification-count').forEach(el => {
    el.textContent = unreadCount;
    el.style.display = unreadCount > 0 ? '' : 'none';
  });
}

// ============================================
// LAZY LOADING
// ============================================
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

// ============================================
// PAGINATION
// ============================================
function renderPagination(currentPage, totalPages, container, callback) {
  if (!container || totalPages <= 1) return;
  
  let html = '<nav><ul class="pagination justify-content-center">';
  
  // Previous button
  html += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage - 1}">
        <i class="bi bi-chevron-left"></i>
      </a>
    </li>
  `;
  
  // Page numbers
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  
  if (startPage > 1) {
    html += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
    if (startPage > 2) {
      html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    html += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `;
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    html += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
  }
  
  // Next button
  html += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">
        <i class="bi bi-chevron-right"></i>
      </a>
    </li>
  `;
  
  html += '</ul></nav>';
  container.innerHTML = html;
  
  // Add click handlers
  container.querySelectorAll('.page-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const page = parseInt(this.dataset.page);
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        callback(page);
      }
    });
  });
}

// ============================================
// CONFIRMATION DIALOG
// ============================================
function confirmAction(message, title = 'Confirm Action') {
  return new Promise((resolve) => {
    // Use Bootstrap modal if available
    const modalHtml = `
      <div class="modal fade" id="confirmModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>${message}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-danger" id="confirmBtn">Confirm</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Remove existing modal if any
    document.getElementById('confirmModal')?.remove();
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    
    document.getElementById('confirmBtn').addEventListener('click', () => {
      modal.hide();
      resolve(true);
    });
    
    document.getElementById('confirmModal').addEventListener('hidden.bs.modal', () => {
      document.getElementById('confirmModal').remove();
      resolve(false);
    });
    
    modal.show();
  });
}

// ============================================
// PRINT FUNCTIONALITY
// ============================================
function printContent(elementId) {
  const content = document.getElementById(elementId);
  if (!content) return;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      <link href="/assets/css/style.css" rel="stylesheet">
      <style>
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body class="p-4">
      ${content.innerHTML}
      <script>window.onload = function() { window.print(); window.close(); }</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// ============================================
// EXPORT TO CSV
// ============================================
function exportToCSV(tableId, filename = 'export.csv') {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  let csv = [];
  const rows = table.querySelectorAll('tr');
  
  rows.forEach(row => {
    const cells = row.querySelectorAll('th, td');
    const rowData = [];
    cells.forEach(cell => {
      // Remove any commas and wrap in quotes
      let data = cell.textContent.trim().replace(/"/g, '""');
      rowData.push(`"${data}"`);
    });
    csv.push(rowData.join(','));
  });
  
  const csvContent = csv.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
