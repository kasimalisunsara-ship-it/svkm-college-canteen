const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const mysql = require('./mysql');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// SVKM Email Domain Validator
function isSvkmEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const lower = email.trim().toLowerCase();
  const validDomains = [
    'svkm.ac.in', 'svkm.edu.in', 'svkm.in', 'svkm.com',
    'nmims.edu', 'nmims.com', 'dwarkadas.ac.in'
  ];
  const domainPart = lower.split('@')[1] || '';
  const isDomainMatch = validDomains.some(d => domainPart === d || domainPart.endsWith('.' + d));
  const isKeywordMatch = lower.includes('svkm') || lower.includes('nmims');

  return isDomainMatch || isKeywordMatch;
}

// Fallback local file store cache in case MySQL is momentarily offline
let fallbackData = null;

function loadFallbackDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      fallbackData = JSON.parse(raw);
    } catch (e) {
      fallbackData = { users: [], categories: [], foods: [], orders: [] };
    }
  } else {
    fallbackData = { users: [], categories: [], foods: [], orders: [] };
  }
}
loadFallbackDB();

function saveFallbackDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(fallbackData, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving fallback DB:', e.message);
  }
}

// Format food record from SQL row
function formatFoodRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    price: Number(row.price),
    categoryId: row.category_id || row.categoryId,
    categoryName: row.category_name || row.categoryName || 'General',
    isVeg: Boolean(row.is_veg !== undefined ? row.is_veg : row.isVeg),
    isJain: Boolean(row.is_jain !== undefined ? row.is_jain : row.isJain),
    image: row.image,
    isAvailable: Boolean(row.is_available !== undefined ? row.is_available : row.isAvailable),
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt
  };
}

// Format user record from SQL row
function formatUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    sapId: row.sap_id || row.sapId,
    email: row.email,
    password: row.password,
    role: row.role,
    userType: row.user_type || row.userType || (row.role === 'admin' ? 'Admin' : 'Student'),
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt
  };
}

// Format category record from SQL row
function formatCategoryRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    image: row.image,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt
  };
}

// Format order record with items
function formatOrderRow(row, items = []) {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.order_number || row.orderId || row.id,
    orderNumber: row.order_number || row.orderId || row.id,
    userId: row.user_id || row.userId,
    userName: row.user_name || row.userName,
    userEmail: row.user_email || row.userEmail,
    userType: row.user_type || row.userType || 'Student',
    subtotal: Number(row.subtotal || row.grand_total || 0),
    platformFee: Number(row.platform_fee || 0),
    gstAmount: Number(row.gst_amount || 0),
    grandTotal: Number(row.grand_total || row.grandTotal || 0),
    paymentMethod: row.payment_method || row.paymentMethod || 'Cash',
    paymentStatus: row.payment_status || row.paymentStatus || 'Pending Counter Payment',
    transactionId: row.transaction_id || row.transactionId || null,
    status: row.status || 'Placed',
    pickupSlot: row.pickup_slot || row.pickupSlot || null,
    specialInstructions: row.special_instructions || row.specialInstructions || null,
    orderDate: row.order_date || row.orderDate || row.created_at,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
    items: items.map(it => ({
      id: it.id,
      foodId: it.food_id || it.foodId,
      name: it.item_name || it.name,
      image: it.item_image || it.image,
      categoryName: it.category_name || it.categoryName,
      price: Number(it.price),
      quantity: Number(it.quantity),
      subtotal: Number(it.subtotal)
    }))
  };
}

const db = {
  isSvkmEmail,

  // ==========================================
  // USERS OPERATIONS
  // ==========================================
  getUsers: async () => {
    try {
      const rows = await mysql.query(
        'SELECT id, name, sap_id, email, password, role, user_type, created_at, updated_at FROM users ORDER BY created_at DESC'
      );
      return rows.map(formatUserRow);
    } catch (err) {
      console.warn('MySQL getUsers fallback:', err.message);
      return fallbackData.users;
    }
  },

  findUserByEmail: async (email) => {
    if (!email) return null;
    try {
      const rows = await mysql.query(
        'SELECT id, name, sap_id, email, password, role, user_type, created_at, updated_at FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
        [email.trim()]
      );
      return rows.length > 0 ? formatUserRow(rows[0]) : null;
    } catch (err) {
      console.warn('MySQL findUserByEmail fallback:', err.message);
      return fallbackData.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    }
  },

  findUserBySapId: async (sapId) => {
    if (!sapId) return null;
    try {
      const rows = await mysql.query(
        'SELECT id, name, sap_id, email, password, role, user_type, created_at, updated_at FROM users WHERE sap_id = ? LIMIT 1',
        [sapId.toString().trim()]
      );
      return rows.length > 0 ? formatUserRow(rows[0]) : null;
    } catch (err) {
      console.warn('MySQL findUserBySapId fallback:', err.message);
      return fallbackData.users.find(u => u.sapId && u.sapId.toString().trim() === sapId.toString().trim());
    }
  },

  findUserByIdentifier: async (identifier) => {
    if (!identifier) return null;
    const clean = identifier.toString().trim();
    try {
      const rows = await mysql.query(
        'SELECT id, name, sap_id, email, password, role, user_type, created_at, updated_at FROM users WHERE sap_id = ? OR LOWER(email) = LOWER(?) LIMIT 1',
        [clean, clean.toLowerCase()]
      );
      return rows.length > 0 ? formatUserRow(rows[0]) : null;
    } catch (err) {
      console.warn('MySQL findUserByIdentifier fallback:', err.message);
      return fallbackData.users.find(u =>
        (u.sapId && u.sapId.toString().trim().toLowerCase() === clean.toLowerCase()) ||
        (u.email && u.email.toLowerCase() === clean.toLowerCase())
      );
    }
  },

  findUserById: async (id) => {
    if (!id) return null;
    try {
      const rows = await mysql.query(
        'SELECT id, name, sap_id, email, password, role, user_type, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
        [id]
      );
      return rows.length > 0 ? formatUserRow(rows[0]) : null;
    } catch (err) {
      console.warn('MySQL findUserById fallback:', err.message);
      return fallbackData.users.find(u => u.id === id);
    }
  },

  createUser: async (user) => {
    const newUser = {
      id: user.id || uuidv4(),
      name: user.name,
      sapId: user.sapId,
      email: user.email.toLowerCase(),
      password: user.password,
      role: user.role || 'student',
      userType: user.userType || (user.role === 'admin' ? 'Admin' : 'Student'),
      createdAt: new Date().toISOString()
    };

    try {
      await mysql.query(
        `INSERT INTO users (id, name, sap_id, email, password, role, user_type, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [newUser.id, newUser.name, newUser.sapId, newUser.email, newUser.password, newUser.role, newUser.userType, new Date()]
      );
    } catch (err) {
      console.warn('MySQL createUser fallback:', err.message);
    }

    // Always update fallback memory
    fallbackData.users.push(newUser);
    saveFallbackDB();
    return newUser;
  },

  // ==========================================
  // CATEGORIES OPERATIONS
  // ==========================================
  getCategories: async () => {
    try {
      const rows = await mysql.query(
        'SELECT id, name, description, image, created_at, updated_at FROM categories ORDER BY name ASC'
      );
      return rows.map(formatCategoryRow);
    } catch (err) {
      console.warn('MySQL getCategories fallback:', err.message);
      return fallbackData.categories;
    }
  },

  findCategoryById: async (id) => {
    if (!id) return null;
    try {
      const rows = await mysql.query(
        'SELECT id, name, description, image, created_at, updated_at FROM categories WHERE id = ? LIMIT 1',
        [id]
      );
      return rows.length > 0 ? formatCategoryRow(rows[0]) : null;
    } catch (err) {
      console.warn('MySQL findCategoryById fallback:', err.message);
      return fallbackData.categories.find(c => c.id === id);
    }
  },

  createCategory: async (cat) => {
    const newCat = {
      id: cat.id || `cat-${uuidv4().substring(0, 8)}`,
      name: cat.name.trim(),
      description: cat.description ? cat.description.trim() : '',
      image: cat.image || null,
      createdAt: new Date().toISOString()
    };

    try {
      await mysql.query(
        'INSERT INTO categories (id, name, description, image, created_at) VALUES (?, ?, ?, ?, ?)',
        [newCat.id, newCat.name, newCat.description, newCat.image, new Date()]
      );
    } catch (err) {
      console.warn('MySQL createCategory fallback:', err.message);
    }

    fallbackData.categories.push(newCat);
    saveFallbackDB();
    return newCat;
  },

  updateCategory: async (id, updateData) => {
    try {
      const fields = [];
      const values = [];

      if (updateData.name !== undefined) {
        fields.push('name = ?');
        values.push(updateData.name.trim());
      }
      if (updateData.description !== undefined) {
        fields.push('description = ?');
        values.push(updateData.description.trim());
      }
      if (updateData.image !== undefined) {
        fields.push('image = ?');
        values.push(updateData.image);
      }

      if (fields.length > 0) {
        values.push(id);
        await mysql.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values);
        
        // If name changed, update category_name in food_items
        if (updateData.name) {
          await mysql.query('UPDATE food_items SET category_name = ? WHERE category_id = ?', [updateData.name.trim(), id]);
        }
      }
    } catch (err) {
      console.warn('MySQL updateCategory fallback:', err.message);
    }

    const idx = fallbackData.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      fallbackData.categories[idx] = { ...fallbackData.categories[idx], ...updateData, updatedAt: new Date().toISOString() };
      saveFallbackDB();
      return fallbackData.categories[idx];
    }
    return db.findCategoryById(id);
  },

  deleteCategory: async (id) => {
    try {
      const result = await mysql.query('DELETE FROM categories WHERE id = ?', [id]);
      const deletedFromSql = result && result.affectedRows > 0;

      const idx = fallbackData.categories.findIndex(c => c.id === id);
      if (idx !== -1) {
        fallbackData.categories.splice(idx, 1);
        saveFallbackDB();
      }
      return deletedFromSql || idx !== -1;
    } catch (err) {
      console.warn('MySQL deleteCategory fallback:', err.message);
      const idx = fallbackData.categories.findIndex(c => c.id === id);
      if (idx === -1) return false;
      fallbackData.categories.splice(idx, 1);
      saveFallbackDB();
      return true;
    }
  },

  // ==========================================
  // FOOD ITEMS OPERATIONS
  // ==========================================
  getFoods: async () => {
    try {
      const rows = await mysql.query(
        `SELECT f.id, f.name, f.description, f.price, f.category_id, 
                COALESCE(c.name, f.category_name, 'General') AS category_name,
                f.is_veg, f.is_jain, f.image, f.is_available, f.created_at, f.updated_at
         FROM food_items f
         LEFT JOIN categories c ON f.category_id = c.id
         ORDER BY f.created_at ASC`
      );
      return rows.map(formatFoodRow);
    } catch (err) {
      console.warn('MySQL getFoods fallback:', err.message);
      return fallbackData.foods;
    }
  },

  findFoodById: async (id) => {
    if (!id) return null;
    try {
      const rows = await mysql.query(
        `SELECT f.id, f.name, f.description, f.price, f.category_id, 
                COALESCE(c.name, f.category_name, 'General') AS category_name,
                f.is_veg, f.is_jain, f.image, f.is_available, f.created_at, f.updated_at
         FROM food_items f
         LEFT JOIN categories c ON f.category_id = c.id
         WHERE f.id = ? OR LOWER(f.name) = LOWER(?)
         LIMIT 1`,
        [id.toString(), id.toString()]
      );
      return rows.length > 0 ? formatFoodRow(rows[0]) : null;
    } catch (err) {
      console.warn('MySQL findFoodById fallback:', err.message);
      return fallbackData.foods.find(f => f.id === id || f.id == id || (f.name && f.name.toLowerCase() === id.toString().toLowerCase()));
    }
  },

  createFood: async (food) => {
    const category = await db.findCategoryById(food.categoryId);
    const categoryName = category ? category.name : (food.categoryName || 'General');

    const newFood = {
      id: food.id || `food-${uuidv4().substring(0, 8)}`,
      name: food.name.trim(),
      description: food.description ? food.description.trim() : '',
      price: Number(food.price),
      categoryId: food.categoryId,
      categoryName: categoryName,
      isVeg: food.isVeg !== undefined ? Boolean(food.isVeg) : true,
      isJain: food.isJain !== undefined ? Boolean(food.isJain) : false,
      image: food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      isAvailable: food.isAvailable !== undefined ? Boolean(food.isAvailable) : true,
      createdAt: new Date().toISOString()
    };

    try {
      await mysql.query(
        `INSERT INTO food_items 
         (id, name, description, price, category_id, category_name, is_veg, is_jain, image, is_available, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newFood.id,
          newFood.name,
          newFood.description,
          newFood.price,
          newFood.categoryId,
          newFood.categoryName,
          newFood.isVeg ? 1 : 0,
          newFood.isJain ? 1 : 0,
          newFood.image,
          newFood.isAvailable ? 1 : 0,
          new Date()
        ]
      );
    } catch (err) {
      console.warn('MySQL createFood fallback:', err.message);
    }

    fallbackData.foods.push(newFood);
    saveFallbackDB();
    return newFood;
  },

  updateFood: async (id, updateData) => {
    try {
      const fields = [];
      const values = [];

      if (updateData.name !== undefined) {
        fields.push('name = ?');
        values.push(updateData.name.trim());
      }
      if (updateData.description !== undefined) {
        fields.push('description = ?');
        values.push(updateData.description.trim());
      }
      if (updateData.price !== undefined) {
        fields.push('price = ?');
        values.push(Number(updateData.price));
      }
      if (updateData.categoryId !== undefined) {
        fields.push('category_id = ?');
        values.push(updateData.categoryId);

        const category = await db.findCategoryById(updateData.categoryId);
        if (category) {
          fields.push('category_name = ?');
          values.push(category.name);
        }
      }
      if (updateData.image !== undefined) {
        fields.push('image = ?');
        values.push(updateData.image);
      }
      if (updateData.isAvailable !== undefined) {
        fields.push('is_available = ?');
        values.push(updateData.isAvailable ? 1 : 0);
      }
      if (updateData.isJain !== undefined) {
        fields.push('is_jain = ?');
        values.push(updateData.isJain ? 1 : 0);
      }

      if (fields.length > 0) {
        values.push(id);
        await mysql.query(`UPDATE food_items SET ${fields.join(', ')} WHERE id = ?`, values);
      }
    } catch (err) {
      console.warn('MySQL updateFood fallback:', err.message);
    }

    const idx = fallbackData.foods.findIndex(f => f.id === id);
    if (idx !== -1) {
      fallbackData.foods[idx] = { ...fallbackData.foods[idx], ...updateData, updatedAt: new Date().toISOString() };
      saveFallbackDB();
      return fallbackData.foods[idx];
    }
    return db.findFoodById(id);
  },

  deleteFood: async (id) => {
    try {
      const result = await mysql.query('DELETE FROM food_items WHERE id = ?', [id]);
      const deletedFromSql = result && result.affectedRows > 0;

      const idx = fallbackData.foods.findIndex(f => f.id === id);
      if (idx !== -1) {
        fallbackData.foods.splice(idx, 1);
        saveFallbackDB();
      }
      return deletedFromSql || idx !== -1;
    } catch (err) {
      console.warn('MySQL deleteFood fallback:', err.message);
      const idx = fallbackData.foods.findIndex(f => f.id === id);
      if (idx === -1) return false;
      fallbackData.foods.splice(idx, 1);
      saveFallbackDB();
      return true;
    }
  },

  // ==========================================
  // ORDERS OPERATIONS (ACID TRANSACTIONS)
  // ==========================================
  getOrders: async () => {
    try {
      const orders = await mysql.query(
        `SELECT id, order_number, user_id, user_name, user_email, user_type,
                subtotal, platform_fee, gst_amount, grand_total, payment_method,
                payment_status, transaction_id, status, pickup_slot, special_instructions,
                order_date, created_at, updated_at
         FROM orders
         ORDER BY created_at DESC`
      );

      if (orders.length === 0) return [];

      const orderIds = orders.map(o => o.id);
      const [items] = await mysql.getPool().query(
        `SELECT id, order_id, food_id, item_name, item_image, category_name, price, quantity, subtotal
         FROM order_items
         WHERE order_id IN (?)`,
        [orderIds]
      );

      const itemsByOrderId = {};
      for (const item of items) {
        if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
        itemsByOrderId[item.order_id].push(item);
      }

      return orders.map(o => formatOrderRow(o, itemsByOrderId[o.id] || []));
    } catch (err) {
      console.warn('MySQL getOrders fallback:', err.message);
      return fallbackData.orders;
    }
  },

  findOrderById: async (id) => {
    if (!id) return null;
    try {
      const rows = await mysql.query(
        `SELECT id, order_number, user_id, user_name, user_email, user_type,
                subtotal, platform_fee, gst_amount, grand_total, payment_method,
                payment_status, transaction_id, status, pickup_slot, special_instructions,
                order_date, created_at, updated_at
         FROM orders
         WHERE id = ? OR order_number = ?
         LIMIT 1`,
        [id, id]
      );

      if (rows.length === 0) return null;

      const items = await mysql.query(
        `SELECT id, order_id, food_id, item_name, item_image, category_name, price, quantity, subtotal
         FROM order_items
         WHERE order_id = ?`,
        [rows[0].id]
      );

      return formatOrderRow(rows[0], items);
    } catch (err) {
      console.warn('MySQL findOrderById fallback:', err.message);
      return fallbackData.orders.find(o => o.id === id || o.orderId === id || o.orderNumber === id);
    }
  },

  getOrdersByUserId: async (userId) => {
    if (!userId) return [];
    try {
      const orders = await mysql.query(
        `SELECT id, order_number, user_id, user_name, user_email, user_type,
                subtotal, platform_fee, gst_amount, grand_total, payment_method,
                payment_status, transaction_id, status, pickup_slot, special_instructions,
                order_date, created_at, updated_at
         FROM orders
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [userId]
      );

      if (orders.length === 0) return [];

      const orderIds = orders.map(o => o.id);
      const [items] = await mysql.getPool().query(
        `SELECT id, order_id, food_id, item_name, item_image, category_name, price, quantity, subtotal
         FROM order_items
         WHERE order_id IN (?)`,
        [orderIds]
      );

      const itemsByOrderId = {};
      for (const item of items) {
        if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
        itemsByOrderId[item.order_id].push(item);
      }

      return orders.map(o => formatOrderRow(o, itemsByOrderId[o.id] || []));
    } catch (err) {
      console.warn('MySQL getOrdersByUserId fallback:', err.message);
      return fallbackData.orders.filter(o => o.userId === userId);
    }
  },

  createOrder: async (orderData) => {
    fallbackData.orderCounter = (fallbackData.orderCounter || 100) + 1;
    const numPadded = String(fallbackData.orderCounter).padStart(6, '0');
    const orderNumber = `CFO-2026-${numPadded}`;
    const orderId = `ord-${uuidv4().substring(0, 8)}`;

    const newOrder = {
      id: orderId,
      orderId: orderNumber,
      orderNumber: orderNumber,
      userId: orderData.userId,
      userName: orderData.userName,
      userEmail: orderData.userEmail,
      userType: orderData.userType || 'Student',
      items: orderData.items || [],
      subtotal: Number(orderData.subtotal || orderData.grandTotal || 0),
      platformFee: Number(orderData.platformFee || 0),
      gstAmount: Number(orderData.gstAmount || 0),
      grandTotal: Number(orderData.grandTotal || 0),
      paymentMethod: orderData.paymentMethod || 'Cash',
      paymentStatus: orderData.paymentStatus || 'Pending Counter Payment',
      transactionId: orderData.transactionId || null,
      status: 'Placed',
      pickupSlot: orderData.pickupSlot || null,
      specialInstructions: orderData.specialInstructions || null,
      orderDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Execute atomic MySQL transaction
    let connection;
    try {
      connection = await mysql.getConnection();
      await connection.beginTransaction();

      // 1. Insert Order
      await connection.query(
        `INSERT INTO orders 
         (id, order_number, user_id, user_name, user_email, user_type, subtotal, platform_fee, gst_amount, grand_total, payment_method, payment_status, transaction_id, status, pickup_slot, special_instructions, order_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newOrder.id,
          newOrder.orderNumber,
          newOrder.userId,
          newOrder.userName,
          newOrder.userEmail,
          newOrder.userType,
          newOrder.subtotal,
          newOrder.platformFee,
          newOrder.gstAmount,
          newOrder.grandTotal,
          newOrder.paymentMethod,
          newOrder.paymentStatus,
          newOrder.transactionId,
          newOrder.status,
          newOrder.pickupSlot,
          newOrder.specialInstructions,
          new Date(),
          new Date()
        ]
      );

      // 2. Insert Order Items
      if (Array.isArray(newOrder.items) && newOrder.items.length > 0) {
        for (const it of newOrder.items) {
          await connection.query(
            `INSERT INTO order_items 
             (order_id, food_id, item_name, item_image, category_name, price, quantity, subtotal)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              newOrder.id,
              it.foodId || null,
              it.name || 'Cafeteria Item',
              it.image || null,
              it.categoryName || 'Snacks',
              Number(it.price || 0),
              Number(it.quantity || 1),
              Number(it.subtotal || 0)
            ]
          );
        }
      }

      // 3. Insert Initial Order Status History
      await connection.query(
        'INSERT INTO order_status_history (order_id, status, changed_by, notes) VALUES (?, ?, ?, ?)',
        [newOrder.id, 'Placed', 'student', 'Order submitted and placed successfully.']
      );

      // 4. Insert Payments Record if completed
      if (newOrder.paymentStatus.includes('Paid')) {
        await connection.query(
          'INSERT INTO payments (order_id, transaction_reference, amount, payment_method, payment_status) VALUES (?, ?, ?, ?, ?)',
          [newOrder.id, newOrder.transactionId || `TXN-${Date.now()}`, newOrder.grandTotal, newOrder.paymentMethod, newOrder.paymentStatus]
        );
      }

      await connection.commit();
    } catch (txErr) {
      if (connection) await connection.rollback();
      console.warn('MySQL Transaction createOrder fallback:', txErr.message);
    } finally {
      if (connection) connection.release();
    }

    fallbackData.orders.unshift(newOrder);
    saveFallbackDB();
    return newOrder;
  },

  updateOrderStatus: async (id, status) => {
    let paymentStatusUpdate = null;
    if (status === 'Completed' || status === 'Ready') {
      paymentStatusUpdate = 'Paid Cash (Received at Counter)';
    }

    let connection;
    try {
      connection = await mysql.getConnection();
      await connection.beginTransaction();

      // Find the order record
      const [existing] = await connection.query('SELECT * FROM orders WHERE id = ? OR order_number = ?', [id, id]);
      if (existing.length > 0) {
        const orderRecord = existing[0];
        let pStatus = orderRecord.payment_status;

        if (status === 'Completed' || status === 'Ready') {
          if (orderRecord.payment_method === 'Cash') {
            pStatus = 'Paid Cash (Received at Counter)';
          } else {
            pStatus = 'Paid via ' + (orderRecord.payment_method || 'UPI');
          }
        }

        await connection.query(
          'UPDATE orders SET status = ?, payment_status = ?, updated_at = NOW() WHERE id = ?',
          [status, pStatus, orderRecord.id]
        );

        await connection.query(
          'INSERT INTO order_status_history (order_id, status, changed_by, notes) VALUES (?, ?, ?, ?)',
          [orderRecord.id, status, 'staff', `Order status progressed to ${status}.`]
        );

        await connection.commit();
      }
    } catch (err) {
      if (connection) await connection.rollback();
      console.warn('MySQL updateOrderStatus fallback:', err.message);
    } finally {
      if (connection) connection.release();
    }

    const order = fallbackData.orders.find(o => o.id === id || o.orderId === id || o.orderNumber === id);
    if (order) {
      order.status = status;
      if (status === 'Completed' || status === 'Ready') {
        if (order.paymentMethod === 'Cash') {
          order.paymentStatus = 'Paid Cash (Received at Counter)';
        } else {
          order.paymentStatus = 'Paid via ' + (order.paymentMethod || 'UPI');
        }
      }
      order.updatedAt = new Date().toISOString();
      saveFallbackDB();
      return order;
    }

    return db.findOrderById(id);
  }
};

module.exports = db;
