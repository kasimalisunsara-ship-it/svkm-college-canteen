-- ====================================================================
-- SVKM College Canteen Management System Database Schema
-- Database Name: svkm_canteen
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `svkm_canteen` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `svkm_canteen`;

-- 1. Users Table (Students, Teaching Staff, Administrators)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `sap_id` VARCHAR(50) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'staff', 'admin') NOT NULL DEFAULT 'student',
  `user_type` VARCHAR(50) NOT NULL DEFAULT 'Student',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`),
  UNIQUE KEY `idx_users_sap_id` (`sap_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `image` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Food Items Table
CREATE TABLE IF NOT EXISTS `food_items` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `category_id` VARCHAR(50) NOT NULL,
  `category_name` VARCHAR(100) DEFAULT NULL,
  `is_veg` TINYINT(1) NOT NULL DEFAULT 1,
  `is_jain` TINYINT(1) NOT NULL DEFAULT 0,
  `image` VARCHAR(500) NOT NULL,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_food_items_category` (`category_id`),
  KEY `idx_food_items_available` (`is_available`),
  CONSTRAINT `fk_food_items_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Pickup Slots Table
CREATE TABLE IF NOT EXISTS `pickup_slots` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `slot_name` VARCHAR(100) NOT NULL,
  `max_capacity` INT NOT NULL DEFAULT 50,
  `current_orders` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_pickup_slots_name` (`slot_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(50) NOT NULL,
  `order_number` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `user_name` VARCHAR(100) DEFAULT NULL,
  `user_email` VARCHAR(120) DEFAULT NULL,
  `user_type` VARCHAR(50) DEFAULT 'Student',
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `platform_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `gst_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `grand_total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'Cash',
  `payment_status` VARCHAR(60) NOT NULL DEFAULT 'Pending Counter Payment',
  `transaction_id` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('Placed', 'Preparing', 'Ready', 'Completed') NOT NULL DEFAULT 'Placed',
  `pickup_slot` VARCHAR(100) DEFAULT NULL,
  `special_instructions` TEXT DEFAULT NULL,
  `order_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_orders_order_number` (`order_number`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_date` (`created_at`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `order_id` VARCHAR(50) NOT NULL,
  `food_id` VARCHAR(50) DEFAULT NULL,
  `item_name` VARCHAR(150) NOT NULL,
  `item_image` VARCHAR(500) DEFAULT NULL,
  `category_name` VARCHAR(100) DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_food` (`food_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_food` FOREIGN KEY (`food_id`) REFERENCES `food_items` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Payments Table
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `order_id` VARCHAR(50) NOT NULL,
  `transaction_reference` VARCHAR(100) DEFAULT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `payment_status` VARCHAR(60) NOT NULL,
  `paid_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_order` (`order_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Order Status History Table
CREATE TABLE IF NOT EXISTS `order_status_history` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `order_id` VARCHAR(50) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `changed_by` VARCHAR(100) DEFAULT 'system',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status_history_order` (`order_id`),
  CONSTRAINT `fk_status_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
