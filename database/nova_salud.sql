CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol_id INT,
  activo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL,
  stock_minimo INT NOT NULL,
  categoria_id INT,
  proveedor_id INT,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

CREATE TABLE ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2) NOT NULL,
  usuario_id INT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE detalle_venta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (venta_id) REFERENCES ventas(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE movimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  cantidad INT NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

INSERT INTO roles (nombre) VALUES ('admin'), ('vendedor');

INSERT INTO categorias (nombre) VALUES
('Analgésicos'), ('Antibióticos'), ('Vitaminas'),
('Cuidado personal'), ('Primeros auxilios');

INSERT INTO proveedores (nombre) VALUES
('Distribuidora Lima SAC'), ('Farmacéutica del Norte'), ('Import Pharma EIRL');

INSERT INTO usuarios (nombre, email, password, rol_id) VALUES
('Cristhian', 'admin@novasalud.com', '$2b$10$oZ7UaxqH4.EJaf4HBI2ylOSaHIy.BebAAVsBLJg9ar1qWL1L8V/MC', 1),
('Vendedor Prueba', 'vendedor@novasalud.com', '$2b$10$oZ7UaxqH4.EJaf4HBI2ylOSaHIy.BebAAVsBLJg9ar1qWL1L8V/MC', 2);

INSERT INTO productos (nombre, precio, stock, stock_minimo, categoria_id, proveedor_id) VALUES
('Paracetamol 500mg', 0.50, 120, 20, 1, 1),
('Ibuprofeno 400mg', 0.80, 4, 15, 1, 1),
('Amoxicilina 500mg', 1.50, 60, 25, 2, 2),
('Vitamina C 1000mg', 1.20, 8, 15, 3, 3),
('Alcohol en gel 500ml', 3.50, 40, 10, 4, 2),
('Venda elástica 10cm', 2.10, 3, 10, 5, 3),
('Omeprazol 20mg', 0.90, 90, 20, 1, 1),
('Termómetro digital', 25.00, 5, 2, 5, 3);
