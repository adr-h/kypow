CREATE TABLE IF NOT EXISTS Customers (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT
);

CREATE TABLE IF NOT EXISTS Products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    stock_quantity INTEGER NOT NULL,
    category TEXT
);

CREATE TABLE IF NOT EXISTS Orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    order_date TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
);

CREATE TABLE IF NOT EXISTS OrderItems (
    order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_order REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

CREATE TABLE IF NOT EXISTS Reviews (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    review_date TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

-- Seed data for Customers
INSERT INTO Customers (first_name, last_name, email, password_hash, address, city, postal_code, country) VALUES
('Alice', 'Smith', 'alice@example.com', 'hash1', '123 Main St', 'Springfield', '12345', 'USA'),
('Bob', 'Johnson', 'bob@example.com', 'hash2', '456 Oak Ave', 'Metropolis', '67890', 'USA');

-- Seed data for Products
INSERT INTO Products (name, description, price, stock_quantity, category) VALUES
('Widget', 'A useful widget', 19.99, 100, 'Gadgets'),
('Gizmo', 'A fancy gizmo', 29.99, 50, 'Gadgets');

-- Seed data for Orders
INSERT INTO Orders (customer_id, order_date, total_amount, status) VALUES
(1, '2024-06-01', 39.98, 'Processing'),
(2, '2024-06-02', 19.99, 'Shipped');

-- Seed data for OrderItems
INSERT INTO OrderItems (order_id, product_id, quantity, price_at_order) VALUES
(1, 1, 2, 19.99),
(2, 1, 1, 19.99);

-- Seed data for Reviews
INSERT INTO Reviews (customer_id, product_id, rating, comment, review_date) VALUES
(1, 1, 5, 'Great widget!', '2024-06-03'),
(2, 2, 4, 'Gizmo is good.', '2024-06-04');
