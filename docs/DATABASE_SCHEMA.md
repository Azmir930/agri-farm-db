# Agriculture Product Marketplace - Database Schema

## ER Diagram (Text-Based)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           AGRICULTURE MARKETPLACE ER DIAGRAM                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────┐
                                    │  User_Role  │
                                    │─────────────│
                                    │ PK: id      │
                                    │ role_name   │
                                    │ description │
                                    └──────┬──────┘
                                           │
                                           │ 1:N
                                           ▼
┌──────────────────┐              ┌─────────────────┐              ┌──────────────────┐
│ User_Activity_Log│              │      User       │              │  Password_Reset  │
│──────────────────│              │─────────────────│              │──────────────────│
│ PK: id           │◄─────────────│ PK: id          │─────────────►│ PK: id           │
│ FK: user_id      │     1:N      │ FK: role_id     │     1:N      │ FK: user_id      │
│ activity_type    │              │ email           │              │ token            │
│ description      │              │ password_hash   │              │ expires_at       │
│ ip_address       │              │ phone           │              │ used             │
│ created_at       │              │ is_active       │              │ created_at       │
└──────────────────┘              │ email_verified  │              └──────────────────┘
                                  │ created_at      │
                                  └────────┬────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼ 1:N                  ▼ 1:N                  ▼ 1:1
          ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
          │  User_Session   │    │    Address      │    │ KYC_Verification│
          │─────────────────│    │─────────────────│    │─────────────────│
          │ PK: id          │    │ PK: id          │    │ PK: id          │
          │ FK: user_id     │    │ FK: user_id     │    │ FK: user_id     │
          │ session_token   │    │ address_type    │    │ document_type   │
          │ ip_address      │    │ street          │    │ document_number │
          │ user_agent      │    │ city, state     │    │ document_url    │
          │ expires_at      │    │ postal_code     │    │ status          │
          │ created_at      │    │ country         │    │ verified_at     │
          └─────────────────┘    │ is_default      │    └─────────────────┘
                                 └─────────────────┘
                                           
           ┌───────────────────────────────┴───────────────────────────────┐
           │                                                               │
           ▼ 1:1                                                           ▼ 1:1
  ┌─────────────────┐                                             ┌─────────────────┐
  │     Farmer      │                                             │      Buyer      │
  │─────────────────│                                             │─────────────────│
  │ PK: id          │                                             │ PK: id          │
  │ FK: user_id     │                                             │ FK: user_id     │
  │ farm_name       │                                             │ company_name    │
  │ farm_size       │                                             │ business_type   │
  │ farming_type    │                                             │ gst_number      │
  │ bio             │                                             │ is_verified     │
  │ is_verified     │                                             └────────┬────────┘
  └────────┬────────┘                                                      │
           │                                                               │
           │ 1:N                                                           │
           ▼                                                               │
  ┌─────────────────┐       ┌─────────────────┐                            │
  │    Category     │       │ Unit_Of_Measure │                            │
  │─────────────────│       │─────────────────│                            │
  │ PK: id          │       │ PK: id          │                            │
  │ name            │       │ name            │                            │
  │ description     │       │ abbreviation    │                            │
  │ image_url       │       └────────┬────────┘                            │
  │ FK: parent_id   │                │                                     │
  └────────┬────────┘                │ 1:N                                 │
           │                         │                                     │
           │ 1:N                     │                                     │
           ▼                         ▼                                     │
  ┌─────────────────────────────────────────────────┐                      │
  │                    Product                       │                      │
  │─────────────────────────────────────────────────│                      │
  │ PK: id                                          │                      │
  │ FK: farmer_id, category_id, unit_of_measure_id  │                      │
  │ name, description, price, stock_quantity        │                      │
  │ min_order_qty, is_organic, harvest_date         │                      │
  │ status, created_at, updated_at                  │                      │
  └────────────────────┬────────────────────────────┘                      │
                       │                                                   │
         ┌─────────────┼─────────────┬───────────────┐                     │
         │             │             │               │                     │
         ▼ 1:N         ▼ 1:N         ▼ 1:N           ▼ N:M (via Wishlist)  │
┌─────────────────┐ ┌──────────────┐ ┌────────────┐ ┌─────────────────┐    │
│ Product_Image   │ │Inventory_Log │ │   Review   │ │    Wishlist     │    │
│─────────────────│ │──────────────│ │────────────│ │─────────────────│    │
│ PK: id          │ │ PK: id       │ │ PK: id     │ │ PK: id          │◄───┘
│ FK: product_id  │ │FK: product_id│ │FK:product_id│ │ FK: user_id     │
│ image_url       │ │ change_type  │ │FK: user_id │ │ FK: product_id  │
│ is_primary      │ │ quantity     │ │ rating     │ │ created_at      │
│ display_order   │ │ previous_qty │ │ comment    │ └─────────────────┘
└─────────────────┘ │ new_qty      │ │ created_at │
                    │ notes        │ └────────────┘
                    └──────────────┘
                                                   
                       ┌───────────────────────────────────────┐
                       │                Orders                  │
                       │───────────────────────────────────────│
                       │ PK: id                                 │
                       │ FK: buyer_id, shipping_address_id      │
                       │ order_number, status, subtotal         │
                       │ shipping_fee, tax, total_amount        │
                       │ notes, created_at, updated_at          │
                       └───────────────────┬───────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼ 1:N                  ▼ 1:1                  ▼ 1:1
          ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
          │  Order_Items    │    │    Payment      │    │    Delivery     │
          │─────────────────│    │─────────────────│    │─────────────────│
          │ PK: id          │    │ PK: id          │    │ PK: id          │
          │ FK: order_id    │    │ FK: order_id    │    │ FK: order_id    │
          │ FK: product_id  │    │ amount          │    │ status          │
          │ quantity        │    │ payment_method  │    │ tracking_number │
          │ unit_price      │    │ transaction_id  │    │ carrier         │
          │ subtotal        │    │ status          │    │ estimated_date  │
          │ discount        │    │ paid_at         │    │ delivered_at    │
          └─────────────────┘    └─────────────────┘    │ delivery_proof  │
                                                        └─────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
                                    RELATIONSHIP SUMMARY
═══════════════════════════════════════════════════════════════════════════════════════════════

1. User_Role (1) ──────────► User (N)           : One role can have many users
2. User (1) ───────────────► Farmer (1)         : A farmer is a type of user
3. User (1) ───────────────► Buyer (1)          : A buyer is a type of user  
4. User (1) ───────────────► User_Session (N)   : User can have multiple sessions
5. User (1) ───────────────► Password_Reset (N) : User can have multiple reset tokens
6. User (1) ───────────────► User_Activity_Log (N) : User has many activity logs
7. User (1) ───────────────► Address (N)        : User can have multiple addresses
8. User (1) ───────────────► KYC_Verification (1) : One KYC per user
9. User (1) ───────────────► Review (N)         : User can write many reviews
10. User (1) ──────────────► Wishlist (N)       : User can have many wishlist items
11. Farmer (1) ────────────► Product (N)        : Farmer can list many products
12. Category (1) ──────────► Product (N)        : Category contains many products
13. Category (1) ──────────► Category (N)       : Self-referential for subcategories
14. Unit_Of_Measure (1) ───► Product (N)        : One unit can be used by many products
15. Product (1) ───────────► Product_Image (N)  : Product has many images
16. Product (1) ───────────► Inventory_Log (N)  : Product has inventory history
17. Product (1) ───────────► Review (N)         : Product can have many reviews
18. Product (1) ───────────► Order_Items (N)    : Product appears in many orders
19. Buyer (1) ─────────────► Orders (N)         : Buyer can place many orders
20. Orders (1) ────────────► Order_Items (N)    : Order contains many items
21. Orders (1) ────────────► Payment (1)        : One payment per order
22. Orders (1) ────────────► Delivery (1)       : One delivery per order
23. Address (1) ───────────► Orders (N)         : Address used for many orders
```

---

## PostgreSQL CREATE TABLE Statements

### 1. User_Role Table
```sql
CREATE TABLE user_role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- For MySQL: Use CHAR(36) instead of UUID, JSON instead of JSONB
```

### 2. User Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES user_role(id) ON DELETE RESTRICT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
```

### 3. User_Session Table
```sql
CREATE TABLE user_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_session_user ON user_session(user_id);
CREATE INDEX idx_session_token ON user_session(session_token);
```

### 4. Password_Reset Table
```sql
CREATE TABLE password_reset (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_password_reset_token ON password_reset(token);
CREATE INDEX idx_password_reset_user ON password_reset(user_id);
```

### 5. User_Activity_Log Table
```sql
CREATE TABLE user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50),
    entity_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON user_activity_log(user_id);
CREATE INDEX idx_activity_type ON user_activity_log(activity_type);
CREATE INDEX idx_activity_created ON user_activity_log(created_at);
```

### 6. Farmer Table
```sql
CREATE TABLE farmer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(255) NOT NULL,
    farm_size DECIMAL(10, 2),
    farm_size_unit VARCHAR(20) DEFAULT 'acres',
    farming_type VARCHAR(100),
    bio TEXT,
    experience_years INTEGER,
    certifications TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_farmer_user ON farmer(user_id);
CREATE INDEX idx_farmer_verified ON farmer(is_verified);
```

### 7. Buyer Table
```sql
CREATE TABLE buyer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    business_type VARCHAR(100),
    gst_number VARCHAR(50),
    pan_number VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    credit_limit DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_buyer_user ON buyer(user_id);
CREATE INDEX idx_buyer_company ON buyer(company_name);
```

### 8. Address Table
```sql
CREATE TABLE address (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL DEFAULT 'shipping',
    label VARCHAR(50),
    street_address TEXT NOT NULL,
    apartment VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    landmark TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_address_type CHECK (address_type IN ('shipping', 'billing', 'farm'))
);

CREATE INDEX idx_address_user ON address(user_id);
CREATE INDEX idx_address_default ON address(user_id, is_default);
```

### 9. KYC_Verification Table
```sql
CREATE TABLE kyc_verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(100) NOT NULL,
    document_front_url TEXT NOT NULL,
    document_back_url TEXT,
    selfie_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_kyc_status CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    CONSTRAINT chk_document_type CHECK (document_type IN ('aadhaar', 'pan', 'passport', 'voter_id', 'driving_license'))
);

CREATE INDEX idx_kyc_user ON kyc_verification(user_id);
CREATE INDEX idx_kyc_status ON kyc_verification(status);
```

### 10. Category Table
```sql
CREATE TABLE category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES category(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_category_parent ON category(parent_id);
CREATE INDEX idx_category_slug ON category(slug);
CREATE INDEX idx_category_active ON category(is_active);
```

### 11. Unit_Of_Measure Table
```sql
CREATE TABLE unit_of_measure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    abbreviation VARCHAR(10) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    conversion_factor DECIMAL(15, 6) DEFAULT 1.0,
    base_unit_id UUID REFERENCES unit_of_measure(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_unit_category CHECK (category IN ('weight', 'volume', 'count', 'length', 'area'))
);

CREATE INDEX idx_unit_category ON unit_of_measure(category);
```

### 12. Product Table
```sql
CREATE TABLE product (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmer(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES category(id) ON DELETE RESTRICT,
    unit_of_measure_id UUID NOT NULL REFERENCES unit_of_measure(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(12, 2) NOT NULL,
    compare_price DECIMAL(12, 2),
    cost_price DECIMAL(12, 2),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    min_order_quantity INTEGER DEFAULT 1,
    max_order_quantity INTEGER,
    is_organic BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    harvest_date DATE,
    expiry_date DATE,
    origin_location VARCHAR(255),
    storage_instructions TEXT,
    nutritional_info JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    view_count INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_product_status CHECK (status IN ('draft', 'active', 'inactive', 'out_of_stock', 'discontinued')),
    CONSTRAINT chk_price_positive CHECK (price > 0),
    CONSTRAINT chk_stock_non_negative CHECK (stock_quantity >= 0)
);

CREATE INDEX idx_product_farmer ON product(farmer_id);
CREATE INDEX idx_product_category ON product(category_id);
CREATE INDEX idx_product_status ON product(status);
CREATE INDEX idx_product_slug ON product(slug);
CREATE INDEX idx_product_featured ON product(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_product_organic ON product(is_organic) WHERE is_organic = TRUE;
```

### 13. Product_Image Table
```sql
CREATE TABLE product_image (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_image_product ON product_image(product_id);
CREATE INDEX idx_product_image_primary ON product_image(product_id, is_primary);
```

### 14. Inventory_Log Table
```sql
CREATE TABLE inventory_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL,
    quantity_changed INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_change_type CHECK (change_type IN ('restock', 'sale', 'adjustment', 'return', 'damage', 'expired'))
);

CREATE INDEX idx_inventory_product ON inventory_log(product_id);
CREATE INDEX idx_inventory_type ON inventory_log(change_type);
CREATE INDEX idx_inventory_created ON inventory_log(created_at);
```

### 15. Orders Table
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES buyer(id) ON DELETE RESTRICT,
    shipping_address_id UUID NOT NULL REFERENCES address(id) ON DELETE RESTRICT,
    billing_address_id UUID REFERENCES address(id) ON DELETE RESTRICT,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    shipping_fee DECIMAL(12, 2) DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    coupon_code VARCHAR(50),
    notes TEXT,
    internal_notes TEXT,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_order_status CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'))
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at);
```

### 16. Order_Items Table
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE RESTRICT,
    farmer_id UUID NOT NULL REFERENCES farmer(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    discount DECIMAL(12, 2) DEFAULT 0.00,
    subtotal DECIMAL(12, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_quantity_positive CHECK (quantity > 0),
    CONSTRAINT chk_item_status CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'))
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_farmer ON order_items(farmer_id);
```

### 17. Payment Table
```sql
CREATE TABLE payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL,
    payment_gateway VARCHAR(50),
    transaction_id VARCHAR(255),
    gateway_response JSONB,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    failure_reason TEXT,
    refund_amount DECIMAL(12, 2) DEFAULT 0.00,
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_payment_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded')),
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('cod', 'upi', 'card', 'netbanking', 'wallet', 'bank_transfer'))
);

CREATE INDEX idx_payment_order ON payment(order_id);
CREATE INDEX idx_payment_status ON payment(status);
CREATE INDEX idx_payment_transaction ON payment(transaction_id);
```

### 18. Delivery Table
```sql
CREATE TABLE delivery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    carrier_tracking_url TEXT,
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    out_for_delivery_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    delivery_proof_url TEXT,
    recipient_name VARCHAR(255),
    recipient_signature_url TEXT,
    delivery_notes TEXT,
    failed_attempts INTEGER DEFAULT 0,
    last_failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_delivery_status CHECK (status IN ('pending', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'))
);

CREATE INDEX idx_delivery_order ON delivery(order_id);
CREATE INDEX idx_delivery_status ON delivery(status);
CREATE INDEX idx_delivery_tracking ON delivery(tracking_number);
```

### 19. Review Table
```sql
CREATE TABLE review (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL,
    title VARCHAR(255),
    comment TEXT,
    pros TEXT,
    cons TEXT,
    images TEXT[],
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT unique_user_product_review UNIQUE (user_id, product_id)
);

CREATE INDEX idx_review_product ON review(product_id);
CREATE INDEX idx_review_user ON review(user_id);
CREATE INDEX idx_review_rating ON review(rating);
CREATE INDEX idx_review_approved ON review(is_approved);
```

### 20. Wishlist Table
```sql
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    notes TEXT,
    notify_on_price_drop BOOLEAN DEFAULT TRUE,
    notify_on_restock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_product_wishlist UNIQUE (user_id, product_id)
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_wishlist_product ON wishlist(product_id);
```

---

## Sample Data (INSERT Statements)

### 1. User_Role Sample Data
```sql
INSERT INTO user_role (id, role_name, description, permissions) VALUES
('11111111-1111-1111-1111-111111111111', 'admin', 'System administrator with full access', '{"all": true}'),
('22222222-2222-2222-2222-222222222222', 'farmer', 'Agricultural product seller', '{"products": ["create", "read", "update", "delete"], "orders": ["read", "update"]}'),
('33333333-3333-3333-3333-333333333333', 'buyer', 'Product buyer/customer', '{"products": ["read"], "orders": ["create", "read"], "reviews": ["create", "read", "update"]}');
```

### 2. Users Sample Data
```sql
INSERT INTO users (id, role_id, email, password_hash, first_name, last_name, phone, is_active, email_verified) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'admin@agrimarket.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCO', 'System', 'Admin', '+91-9000000001', TRUE, TRUE),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'farmer.raju@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCO', 'Raju', 'Sharma', '+91-9876543210', TRUE, TRUE),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'farmer.meena@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCO', 'Meena', 'Patel', '+91-9876543211', TRUE, TRUE),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'buyer.amit@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCO', 'Amit', 'Kumar', '+91-9876543212', TRUE, TRUE),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'buyer.priya@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCO', 'Priya', 'Singh', '+91-9876543213', TRUE, TRUE);
```

### 3. User_Session Sample Data
```sql
INSERT INTO user_session (id, user_id, session_token, ip_address, user_agent, device_type, expires_at) VALUES
('s1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sess_abc123def456', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0)', 'desktop', NOW() + INTERVAL '7 days'),
('s2222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'sess_ghi789jkl012', '192.168.1.101', 'Mozilla/5.0 (iPhone)', 'mobile', NOW() + INTERVAL '7 days'),
('s3333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'sess_mno345pqr678', '192.168.1.102', 'Mozilla/5.0 (Android)', 'mobile', NOW() + INTERVAL '7 days');
```

### 4. Password_Reset Sample Data
```sql
INSERT INTO password_reset (id, user_id, token, expires_at, used) VALUES
('pr111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'reset_token_abc123', NOW() + INTERVAL '1 hour', FALSE),
('pr222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'reset_token_def456', NOW() - INTERVAL '2 hours', TRUE),
('pr333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'reset_token_ghi789', NOW() + INTERVAL '30 minutes', FALSE);
```

### 5. User_Activity_Log Sample Data
```sql
INSERT INTO user_activity_log (id, user_id, activity_type, description, entity_type, ip_address) VALUES
('al111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'login', 'User logged in successfully', NULL, '192.168.1.100'),
('al222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'product_create', 'Created new product: Organic Tomatoes', 'product', '192.168.1.100'),
('al333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'order_place', 'Placed order #ORD-2024-001', 'order', '192.168.1.102');
```

### 6. Farmer Sample Data
```sql
INSERT INTO farmer (id, user_id, farm_name, farm_size, farming_type, bio, experience_years, is_verified, rating) VALUES
('f1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Green Valley Organic Farm', 25.5, 'organic', 'Third-generation farmer specializing in organic vegetables', 15, TRUE, 4.75),
('f2222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Sunrise Grains Farm', 50.0, 'traditional', 'Growing premium wheat and rice for over 20 years', 22, TRUE, 4.50),
('f3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Demo Farm', 10.0, 'mixed', 'Demo farm for testing purposes', 5, FALSE, 0.00);
```

### 7. Buyer Sample Data
```sql
INSERT INTO buyer (id, user_id, company_name, business_type, gst_number, is_verified) VALUES
('b1111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Fresh Foods Mart', 'retailer', 'GST29ABCDE1234F1Z5', TRUE),
('b2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, 'individual', NULL, FALSE),
('b3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'AgriMart Wholesale', 'wholesaler', 'GST29XYZAB5678G2H6', TRUE);
```

### 8. Address Sample Data
```sql
INSERT INTO address (id, user_id, address_type, label, street_address, city, state, postal_code, country, is_default) VALUES
('ad111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'farm', 'Farm Address', 'Village Rampur, Near River Bank', 'Jaipur', 'Rajasthan', '302001', 'India', TRUE),
('ad222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'shipping', 'Home', '123 MG Road, Sector 5', 'Mumbai', 'Maharashtra', '400001', 'India', TRUE),
('ad333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'billing', 'Office', '456 Business Park, Block A', 'Mumbai', 'Maharashtra', '400002', 'India', FALSE),
('ad444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'shipping', 'Home', '789 Green Avenue', 'Delhi', 'Delhi', '110001', 'India', TRUE);
```

### 9. KYC_Verification Sample Data
```sql
INSERT INTO kyc_verification (id, user_id, document_type, document_number, document_front_url, status, verified_at) VALUES
('kyc11111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aadhaar', 'XXXX-XXXX-1234', 'https://storage.example.com/kyc/aadhaar_front_1.jpg', 'approved', NOW() - INTERVAL '30 days'),
('kyc22222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'pan', 'ABCDE1234F', 'https://storage.example.com/kyc/pan_front_2.jpg', 'approved', NOW() - INTERVAL '15 days'),
('kyc33333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'aadhaar', 'XXXX-XXXX-5678', 'https://storage.example.com/kyc/aadhaar_front_3.jpg', 'pending', NULL);
```

### 10. Category Sample Data
```sql
INSERT INTO category (id, parent_id, name, slug, description, display_order, is_active) VALUES
('cat11111-1111-1111-1111-111111111111', NULL, 'Vegetables', 'vegetables', 'Fresh farm vegetables', 1, TRUE),
('cat22222-2222-2222-2222-222222222222', NULL, 'Fruits', 'fruits', 'Fresh seasonal fruits', 2, TRUE),
('cat33333-3333-3333-3333-333333333333', NULL, 'Grains & Cereals', 'grains-cereals', 'Rice, wheat, and other grains', 3, TRUE),
('cat44444-4444-4444-4444-444444444444', 'cat11111-1111-1111-1111-111111111111', 'Leafy Greens', 'leafy-greens', 'Spinach, lettuce, and other leafy vegetables', 1, TRUE),
('cat55555-5555-5555-5555-555555555555', 'cat11111-1111-1111-1111-111111111111', 'Root Vegetables', 'root-vegetables', 'Carrots, potatoes, and other root vegetables', 2, TRUE);
```

### 11. Unit_Of_Measure Sample Data
```sql
INSERT INTO unit_of_measure (id, name, abbreviation, category, conversion_factor) VALUES
('uom11111-1111-1111-1111-111111111111', 'Kilogram', 'kg', 'weight', 1.0),
('uom22222-2222-2222-2222-222222222222', 'Gram', 'g', 'weight', 0.001),
('uom33333-3333-3333-3333-333333333333', 'Quintal', 'qtl', 'weight', 100.0),
('uom44444-4444-4444-4444-444444444444', 'Dozen', 'dz', 'count', 12.0),
('uom55555-5555-5555-5555-555555555555', 'Piece', 'pc', 'count', 1.0);
```

### 12. Product Sample Data
```sql
INSERT INTO product (id, farmer_id, category_id, unit_of_measure_id, name, slug, description, price, stock_quantity, min_order_quantity, is_organic, status, rating) VALUES
('prod1111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'cat44444-4444-4444-4444-444444444444', 'uom11111-1111-1111-1111-111111111111', 'Organic Spinach', 'organic-spinach', 'Fresh organic spinach from our farm, pesticide-free', 45.00, 500, 1, TRUE, 'active', 4.80),
('prod2222-2222-2222-2222-222222222222', 'f1111111-1111-1111-1111-111111111111', 'cat55555-5555-5555-5555-555555555555', 'uom11111-1111-1111-1111-111111111111', 'Fresh Tomatoes', 'fresh-tomatoes', 'Vine-ripened red tomatoes, perfect for cooking', 35.00, 800, 2, TRUE, 'active', 4.65),
('prod3333-3333-3333-3333-333333333333', 'f2222222-2222-2222-2222-222222222222', 'cat33333-3333-3333-3333-333333333333', 'uom33333-3333-3333-3333-333333333333', 'Premium Basmati Rice', 'premium-basmati-rice', 'Long grain aromatic basmati rice, aged for 2 years', 8500.00, 50, 1, FALSE, 'active', 4.90),
('prod4444-4444-4444-4444-444444444444', 'f2222222-2222-2222-2222-222222222222', 'cat33333-3333-3333-3333-333333333333', 'uom33333-3333-3333-3333-333333333333', 'Organic Wheat', 'organic-wheat', 'Stone-ground organic wheat, high in fiber', 4200.00, 100, 1, TRUE, 'active', 4.70);
```

### 13. Product_Image Sample Data
```sql
INSERT INTO product_image (id, product_id, image_url, alt_text, is_primary, display_order) VALUES
('pi111111-1111-1111-1111-111111111111', 'prod1111-1111-1111-1111-111111111111', 'https://storage.example.com/products/spinach-1.jpg', 'Fresh organic spinach bundle', TRUE, 1),
('pi222222-2222-2222-2222-222222222222', 'prod1111-1111-1111-1111-111111111111', 'https://storage.example.com/products/spinach-2.jpg', 'Spinach leaves close-up', FALSE, 2),
('pi333333-3333-3333-3333-333333333333', 'prod2222-2222-2222-2222-222222222222', 'https://storage.example.com/products/tomatoes-1.jpg', 'Red ripe tomatoes', TRUE, 1),
('pi444444-4444-4444-4444-444444444444', 'prod3333-3333-3333-3333-333333333333', 'https://storage.example.com/products/rice-1.jpg', 'Premium basmati rice grains', TRUE, 1);
```

### 14. Inventory_Log Sample Data
```sql
INSERT INTO inventory_log (id, product_id, change_type, quantity_changed, previous_quantity, new_quantity, notes) VALUES
('inv11111-1111-1111-1111-111111111111', 'prod1111-1111-1111-1111-111111111111', 'restock', 500, 0, 500, 'Initial stock'),
('inv22222-2222-2222-2222-222222222222', 'prod1111-1111-1111-1111-111111111111', 'sale', -10, 500, 490, 'Order #ORD-2024-001'),
('inv33333-3333-3333-3333-333333333333', 'prod2222-2222-2222-2222-222222222222', 'restock', 800, 0, 800, 'Initial stock'),
('inv44444-4444-4444-4444-444444444444', 'prod3333-3333-3333-3333-333333333333', 'restock', 50, 0, 50, 'New harvest batch');
```

### 15. Orders Sample Data
```sql
INSERT INTO orders (id, buyer_id, shipping_address_id, order_number, status, subtotal, shipping_fee, tax_amount, total_amount) VALUES
('ord11111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'ad222222-2222-2222-2222-222222222222', 'ORD-2024-001', 'delivered', 1250.00, 50.00, 65.00, 1365.00),
('ord22222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'ad444444-4444-4444-4444-444444444444', 'ORD-2024-002', 'shipped', 8500.00, 100.00, 430.00, 9030.00),
('ord33333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'ad222222-2222-2222-2222-222222222222', 'ORD-2024-003', 'pending', 520.00, 40.00, 28.00, 588.00);
```

### 16. Order_Items Sample Data
```sql
INSERT INTO order_items (id, order_id, product_id, farmer_id, product_name, quantity, unit_price, subtotal, status) VALUES
('oi111111-1111-1111-1111-111111111111', 'ord11111-1111-1111-1111-111111111111', 'prod1111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'Organic Spinach', 10, 45.00, 450.00, 'delivered'),
('oi222222-2222-2222-2222-222222222222', 'ord11111-1111-1111-1111-111111111111', 'prod2222-2222-2222-2222-222222222222', 'f1111111-1111-1111-1111-111111111111', 'Fresh Tomatoes', 20, 35.00, 700.00, 'delivered'),
('oi333333-3333-3333-3333-333333333333', 'ord22222-2222-2222-2222-222222222222', 'prod3333-3333-3333-3333-333333333333', 'f2222222-2222-2222-2222-222222222222', 'Premium Basmati Rice', 1, 8500.00, 8500.00, 'shipped'),
('oi444444-4444-4444-4444-444444444444', 'ord33333-3333-3333-3333-333333333333', 'prod1111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'Organic Spinach', 5, 45.00, 225.00, 'pending');
```

### 17. Payment Sample Data
```sql
INSERT INTO payment (id, order_id, amount, payment_method, payment_gateway, transaction_id, status, paid_at) VALUES
('pay11111-1111-1111-1111-111111111111', 'ord11111-1111-1111-1111-111111111111', 1365.00, 'upi', 'razorpay', 'pay_ABC123XYZ', 'completed', NOW() - INTERVAL '5 days'),
('pay22222-2222-2222-2222-222222222222', 'ord22222-2222-2222-2222-222222222222', 9030.00, 'netbanking', 'razorpay', 'pay_DEF456UVW', 'completed', NOW() - INTERVAL '2 days'),
('pay33333-3333-3333-3333-333333333333', 'ord33333-3333-3333-3333-333333333333', 588.00, 'cod', NULL, NULL, 'pending', NULL);
```

### 18. Delivery Sample Data
```sql
INSERT INTO delivery (id, order_id, status, tracking_number, carrier, estimated_delivery_date, delivered_at) VALUES
('del11111-1111-1111-1111-111111111111', 'ord11111-1111-1111-1111-111111111111', 'delivered', 'TRACK123456789', 'Delhivery', CURRENT_DATE - INTERVAL '3 days', NOW() - INTERVAL '4 days'),
('del22222-2222-2222-2222-222222222222', 'ord22222-2222-2222-2222-222222222222', 'in_transit', 'TRACK987654321', 'BlueDart', CURRENT_DATE + INTERVAL '2 days', NULL),
('del33333-3333-3333-3333-333333333333', 'ord33333-3333-3333-3333-333333333333', 'pending', NULL, NULL, CURRENT_DATE + INTERVAL '5 days', NULL);
```

### 19. Review Sample Data
```sql
INSERT INTO review (id, product_id, user_id, rating, title, comment, is_verified_purchase, is_approved) VALUES
('rev11111-1111-1111-1111-111111111111', 'prod1111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 5, 'Excellent Quality!', 'The spinach was incredibly fresh and flavorful. Will order again!', TRUE, TRUE),
('rev22222-2222-2222-2222-222222222222', 'prod2222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 4, 'Good tomatoes', 'Nice and ripe, perfect for salads. Delivery was quick.', TRUE, TRUE),
('rev33333-3333-3333-3333-333333333333', 'prod3333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 5, 'Best rice ever!', 'The aroma and taste are exceptional. Premium quality basmati.', TRUE, TRUE);
```

### 20. Wishlist Sample Data
```sql
INSERT INTO wishlist (id, user_id, product_id, notify_on_price_drop, notify_on_restock) VALUES
('wl111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'prod4444-4444-4444-4444-444444444444', TRUE, TRUE),
('wl222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'prod1111-1111-1111-1111-111111111111', TRUE, FALSE),
('wl333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'prod2222-2222-2222-2222-222222222222', FALSE, TRUE);
```

---

## MySQL Equivalents (Key Differences)

If you need MySQL syntax instead, here are the key differences:

| PostgreSQL | MySQL |
|------------|-------|
| `UUID` | `CHAR(36)` or `BINARY(16)` |
| `gen_random_uuid()` | `UUID()` |
| `JSONB` | `JSON` |
| `TEXT[]` (array) | Use JSON or separate table |
| `INET` | `VARCHAR(45)` |
| `TIMESTAMP WITH TIME ZONE` | `DATETIME` or `TIMESTAMP` |
| `NOW()` | `NOW()` or `CURRENT_TIMESTAMP` |
| `INTERVAL '7 days'` | `DATE_ADD(NOW(), INTERVAL 7 DAY)` |
| `BOOLEAN` | `TINYINT(1)` or `BOOLEAN` |
| `DECIMAL(10,2)` | `DECIMAL(10,2)` (same) |

---

## Database Best Practices Applied

1. **Normalization**: Tables are in 3NF with no redundant data
2. **Primary Keys**: All tables use UUID for better distribution and security
3. **Foreign Keys**: Proper CASCADE/RESTRICT rules based on business logic
4. **Indexes**: Created on frequently queried columns and foreign keys
5. **Constraints**: CHECK constraints for enums and valid ranges
6. **Audit Trails**: Created/updated timestamps on all tables
7. **Soft Deletes**: Status fields instead of hard deletes where appropriate
8. **Security**: Role-based access control structure ready for RLS policies
