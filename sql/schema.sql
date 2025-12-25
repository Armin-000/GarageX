CREATE DATABASE IF NOT EXISTS car_garage
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE car_garage;

CREATE TABLE IF NOT EXISTS cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO cars (make, model, year, price) VALUES
  ('Opel', 'Astra J Sports Tourer', 2013, 7500.00),
  ('Volkswagen', 'Golf 7', 2016, 11500.00),
  ('BMW', '320d', 2015, 14500.00);
