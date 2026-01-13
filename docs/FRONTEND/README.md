# Agriculture Product Marketplace - Frontend Documentation

Complete HTML5, CSS3, JavaScript, and Bootstrap 5 frontend for the Agriculture Product Marketplace.

## 📁 Folder Structure

```
FRONTEND/
├── assets/
│   ├── css/
│   │   ├── style.css           # Main custom styles
│   │   ├── dashboard.css       # Dashboard-specific styles
│   │   └── components.css      # Reusable component styles
│   ├── js/
│   │   ├── main.js             # Main application logic
│   │   ├── auth.js             # Authentication functions
│   │   ├── api.js              # API communication layer
│   │   ├── cart.js             # Cart functionality
│   │   └── utils.js            # Utility functions
│   └── images/
│       └── (product images, logos, etc.)
├── common/
│   ├── login.html              # Login page
│   ├── register.html           # Registration page
│   ├── forgot-password.html    # Password reset
│   └── profile.html            # Profile settings
├── buyer/
│   ├── dashboard.html          # Buyer dashboard
│   ├── products.html           # Browse products
│   ├── product-details.html    # Single product view
│   ├── cart.html               # Shopping cart
│   ├── checkout.html           # Checkout page
│   ├── orders.html             # Order history
│   ├── wishlist.html           # Wishlist page
│   └── reviews.html            # Submit/view reviews
├── farmer/
│   ├── dashboard.html          # Farmer dashboard
│   ├── products.html           # Manage products
│   ├── add-product.html        # Add new product
│   ├── inventory.html          # Inventory management
│   ├── orders.html             # Order management
│   └── reviews.html            # View reviews
├── admin/
│   ├── dashboard.html          # Admin dashboard
│   ├── users.html              # User management
│   ├── products.html           # Product moderation
│   ├── orders.html             # Order management
│   ├── payments.html           # Payment tracking
│   └── analytics.html          # Analytics dashboard
└── index.html                  # Landing page
```

## 🚀 Setup Instructions

### 1. Prerequisites

- Web browser (Chrome, Firefox, Safari, Edge)
- Web server (Apache, Nginx, or any HTTP server)
- PHP backend running (see PHP_BACKEND docs)

### 2. Installation

1. Copy the `FRONTEND` folder to your web server's public directory
2. Update `assets/js/api.js` with your backend URL:
   ```javascript
   const API_BASE = 'http://localhost/PHP_BACKEND';
   ```

### 3. Local Development (without web server)

For testing, you can use a simple HTTP server:
```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .

# PHP built-in server
php -S localhost:8080
```

## 🔧 Dependencies (CDN)

All dependencies are loaded via CDN in each HTML file:

```html
<!-- Bootstrap 5 CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Bootstrap Icons -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">

<!-- Bootstrap 5 JS (with Popper) -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
```

## 🎨 Color Scheme

```css
:root {
  --primary-green: #2E7D32;      /* Main brand color */
  --primary-light: #4CAF50;      /* Light green */
  --primary-dark: #1B5E20;       /* Dark green */
  --secondary-brown: #795548;    /* Earth tone */
  --accent-orange: #FF9800;      /* Accent color */
  --background-light: #F5F5F5;   /* Light background */
  --text-dark: #212121;          /* Dark text */
  --text-light: #757575;         /* Light text */
  --success: #4CAF50;
  --warning: #FF9800;
  --danger: #F44336;
  --info: #2196F3;
}
```

## 📱 Responsive Breakpoints

Using Bootstrap 5 breakpoints:
- `xs`: < 576px (Mobile portrait)
- `sm`: ≥ 576px (Mobile landscape)
- `md`: ≥ 768px (Tablet)
- `lg`: ≥ 992px (Desktop)
- `xl`: ≥ 1200px (Large desktop)
- `xxl`: ≥ 1400px (Extra large)

## 🔐 Authentication Flow

1. User visits login/register page
2. Form submission sends data to PHP backend
3. Backend returns JWT token on success
4. Token stored in localStorage
5. Token included in all subsequent API requests
6. Protected pages check for valid token

## 📊 Page Descriptions

### Common Pages
- **login.html**: Email/password login with "Remember me" option
- **register.html**: Multi-step registration for Farmer/Buyer
- **forgot-password.html**: Email-based password reset
- **profile.html**: Update personal info, change password

### Buyer Pages
- **dashboard.html**: Quick stats, recent orders, recommended products
- **products.html**: Grid/list view with search, filters, sorting
- **product-details.html**: Full product info, reviews, add to cart
- **cart.html**: Cart items, quantity controls, total calculation
- **checkout.html**: Shipping address, payment method selection
- **orders.html**: Order history with status tracking
- **wishlist.html**: Saved products for later
- **reviews.html**: Submit and view product reviews

### Farmer Pages
- **dashboard.html**: Sales stats, pending orders, low stock alerts
- **products.html**: CRUD operations for products
- **add-product.html**: Multi-image upload, pricing, stock levels
- **inventory.html**: Stock management, restock history
- **orders.html**: Order fulfillment, status updates
- **reviews.html**: Customer feedback on products

### Admin Pages
- **dashboard.html**: System-wide analytics, quick actions
- **users.html**: User management, KYC approval
- **products.html**: Product moderation, category management
- **orders.html**: All orders overview, dispute resolution
- **payments.html**: Payment tracking, refund management
- **analytics.html**: Charts, graphs, exportable reports

## 🔄 API Integration

All API calls go through `assets/js/api.js`:

```javascript
// Example: Fetch products
const products = await API.get('/buyer/products.php?page=1&limit=12');

// Example: Login
const response = await API.post('/auth/login.php', { email, password });

// Example: Add to cart
await API.post('/api/cart.php', { action: 'add', product_id, quantity });
```

## 📝 Notes

- All forms include client-side validation
- Error messages displayed using Bootstrap alerts
- Loading states shown with spinners
- Modals used for confirmations and quick actions
- Toast notifications for success/error feedback
- Pagination for all list views
- Print-friendly order receipts
