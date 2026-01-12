# Agriculture Product Marketplace - PHP Backend

Complete PHP/MySQL backend for the Agriculture Product Marketplace.

## 📁 Folder Structure

```
PHP_BACKEND/
├── config/
│   ├── database.php      # Database connection (PDO)
│   ├── session.php       # Session management
│   └── helpers.php       # Utility functions
├── auth/
│   ├── register.php      # User registration
│   ├── login.php         # User login
│   ├── logout.php        # User logout
│   ├── password_reset.php # Password reset flow
│   └── middleware.php    # Auth middleware
├── farmer/
│   ├── products.php      # Product CRUD
│   ├── inventory.php     # Stock management
│   ├── orders.php        # Order tracking
│   └── reviews.php       # View reviews
├── buyer/
│   ├── products.php      # Browse products
│   ├── cart.php          # Cart validation
│   ├── checkout.php      # Order creation
│   ├── orders.php        # Order history
│   ├── reviews.php       # Submit reviews
│   └── wishlist.php      # Wishlist management
├── admin/
│   ├── users.php         # User management
│   ├── products.php      # Product moderation
│   ├── orders.php        # Order management
│   ├── payments.php      # Payment tracking
│   └── analytics.php     # Dashboard stats
└── api/
    ├── search.php        # Live search
    ├── cart.php          # Cart operations
    ├── stock.php         # Stock checking
    └── categories.php    # Category listing
```

## 🚀 Setup Instructions

### 1. Database Setup

1. Create a MySQL database named `agriculture_marketplace`
2. Run the SQL from `docs/DATABASE_SCHEMA.md` to create tables
3. Insert the sample data

### 2. Configuration

Update `config/database.php` with your credentials:

```php
private $host = "localhost";
private $db_name = "agriculture_marketplace";
private $username = "your_username";
private $password = "your_password";
```

### 3. Server Setup (XAMPP/WAMP)

1. Copy the `PHP_BACKEND` folder to `htdocs/` (XAMPP) or `www/` (WAMP)
2. Start Apache and MySQL
3. Access via `http://localhost/PHP_BACKEND/`

### 4. Apache .htaccess (Optional - for clean URLs)

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php?url=$1 [QSA,L]
```

## 🔐 Authentication

### Register a User
```bash
POST /auth/register.php
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "securepass123",
  "confirm_password": "securepass123",
  "role": "buyer"
}
```

### Login
```bash
POST /auth/login.php
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}

# Response includes token for API calls
{
  "success": true,
  "token": "abc123...",
  "user": { ... }
}
```

### Using the Token
```bash
Authorization: Bearer abc123...
```

## 📦 API Examples

### Browse Products
```bash
GET /buyer/products.php?page=1&limit=12&category=cat-001&sort=price_low
```

### Live Search
```bash
GET /api/search.php?q=tomato&type=products&limit=10
```

### Add to Cart (Validate)
```bash
POST /api/cart.php
{
  "action": "add",
  "product_id": "prod-001",
  "quantity": 5
}
```

### Checkout
```bash
POST /buyer/checkout.php
Authorization: Bearer <token>

{
  "items": [
    {"product_id": "prod-001", "quantity": 5}
  ],
  "shipping_address_id": "addr-001",
  "payment_method": "cod"
}
```

### Farmer: Update Stock
```bash
POST /farmer/inventory.php
Authorization: Bearer <token>

{
  "product_id": "prod-001",
  "change_quantity": 50,
  "change_type": "restock",
  "notes": "New harvest"
}
```

### Admin: Get Analytics
```bash
GET /admin/analytics.php?period=30
Authorization: Bearer <admin_token>
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with cost factor 12
- **SQL Injection Prevention**: PDO prepared statements
- **XSS Protection**: Input sanitization
- **Session Security**: HttpOnly, Secure cookies
- **Token-based Auth**: 64-character random tokens
- **Role-based Access**: Middleware enforcement

## 📊 Response Format

All endpoints return JSON:

```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_records": 100
  }
}
```

Error responses:
```json
{
  "error": "Error message",
  "details": ["Validation error 1", "Validation error 2"]
}
```

## 🔄 Frontend Integration

### Connecting React to PHP Backend

```typescript
// src/lib/api.ts
const API_BASE = 'http://localhost/PHP_BACKEND';

export async function fetchProducts(params: ProductParams) {
  const searchParams = new URLSearchParams(params);
  const response = await fetch(`${API_BASE}/buyer/products.php?${searchParams}`);
  return response.json();
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
}
```

### CORS Configuration

Add to each PHP file or use a central config:
```php
header("Access-Control-Allow-Origin: http://localhost:5173"); // Vite dev server
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
```

## 📝 Notes

- All IDs use UUIDs for security
- Soft deletes (is_active flag) preserve data integrity
- Inventory changes are logged for audit trail
- Password reset tokens expire in 1 hour
- Session tokens expire in 24 hours
