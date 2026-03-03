-- Insertar Store
INSERT INTO "Store" (id, name, address, phone, "isActive", "createdAt", "updatedAt")
VALUES ('store-1', 'YCC Main Store', 'Av. Principal 123', '555-1234', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar Terminal
INSERT INTO "Terminal" (id, "storeId", name, location, "isActive", "createdAt", "updatedAt")
VALUES ('terminal-1', 'store-1', 'Terminal 1', 'Main Counter', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar Usuario
INSERT INTO "User" (id, username, email, "passwordHash", "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
VALUES ('user-1', 'admin', 'admin@ycc.com', '$2a$10$abcdefghijklmnopqrstuv', 'Admin', 'User', 'ADMIN', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar Categorías
INSERT INTO "Category" (id, name, description, "isActive", "createdAt", "updatedAt")
VALUES 
  ('cat-bebidas', 'Bebidas', 'Bebidas y refrescos', true, NOW(), NOW()),
  ('cat-comida', 'Comida', 'Platillos principales', true, NOW(), NOW()),
  ('cat-postres', 'Postres', 'Postres y dulces', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar Productos
INSERT INTO "Product" (id, sku, name, description, "categoryId", price, cost, "taxRate", "trackInventory", "currentStock", "minStockLevel", "isActive", "createdAt", "updatedAt")
VALUES 
  ('prod-1', 'BEB-001', 'Coca Cola', 'Refresco 355ml', 'cat-bebidas', 25.00, 12.00, 0.16, true, 100, 10, true, NOW(), NOW()),
  ('prod-2', 'BEB-002', 'Agua Mineral', 'Agua 500ml', 'cat-bebidas', 15.00, 8.00, 0.16, true, 150, 20, true, NOW(), NOW()),
  ('prod-3', 'BEB-003', 'Jugo Naranja', 'Jugo natural 300ml', 'cat-bebidas', 35.00, 18.00, 0.16, true, 80, 15, true, NOW(), NOW()),
  ('prod-4', 'COM-001', 'Hamburguesa Clásica', 'Con queso y papas', 'cat-comida', 120.00, 60.00, 0.16, true, 50, 5, true, NOW(), NOW()),
  ('prod-5', 'COM-002', 'Pizza Margarita', 'Pizza mediana', 'cat-comida', 150.00, 75.00, 0.16, true, 30, 5, true, NOW(), NOW()),
  ('prod-6', 'COM-003', 'Ensalada César', 'Con pollo y aderezo', 'cat-comida', 95.00, 45.00, 0.16, true, 40, 5, true, NOW(), NOW()),
  ('prod-7', 'POS-001', 'Pastel Chocolate', 'Rebanada', 'cat-postres', 55.00, 25.00, 0.16, true, 25, 5, true, NOW(), NOW()),
  ('prod-8', 'POS-002', 'Helado Vainilla', '2 bolas', 'cat-postres', 45.00, 20.00, 0.16, true, 60, 10, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
