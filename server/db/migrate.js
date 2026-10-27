const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = parseInt(process.env.DB_PORT, 10) || 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'svkm_canteen';

const SCHEMA_FILE = path.join(__dirname, 'schema.sql');
const DB_JSON_FILE = path.join(__dirname, '..', 'data', 'db.json');

async function runMigration() {
  console.log('====================================================');
  console.log(' Starting SVKM Canteen Database Migration');
  console.log(` Target Server: ${dbHost}:${dbPort}`);
  console.log(` Target Database: ${dbName}`);
  console.log('====================================================\n');

  let rawConnection;
  try {
    // 1. Connect to MySQL without specifying database first
    rawConnection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      multipleStatements: true
    });
    console.log('Connected to MySQL Server successfully.');
  } catch (err) {
    console.error('Failed to connect to MySQL Server:', err.message);
    console.error('\nPlease verify that:');
    console.error('1. MySQL Server service is running on your machine (e.g., net start MySQL80)');
    console.error('2. DB_HOST, DB_PORT, DB_USER, and DB_PASSWORD in server/.env are correct.');
    process.exit(1);
  }

  try {
    // 2. Create database if not exists
    console.log(`Ensuring database '${dbName}' exists...`);
    await rawConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rawConnection.query(`USE \`${dbName}\`;`);
    console.log(`Database '${dbName}' selected.`);

    // 3. Read and execute schema.sql
    console.log('Executing schema definition...');
    const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
    await rawConnection.query(schemaSql);
    console.log('All 8 database tables verified / created successfully.');

    // 4. Seed default pickup slots if empty
    const [slots] = await rawConnection.query('SELECT COUNT(*) as count FROM pickup_slots');
    if (slots[0].count === 0) {
      console.log('Seeding cafeteria pickup time slots...');
      const defaultSlots = [
        ['11:30 AM - 12:00 PM', 50],
        ['12:00 PM - 12:30 PM', 60],
        ['12:30 PM - 01:00 PM', 75],
        ['01:00 PM - 01:30 PM', 75],
        ['01:30 PM - 02:00 PM', 60],
        ['02:00 PM - 02:30 PM', 40],
        ['03:30 PM - 04:00 PM', 50],
        ['04:00 PM - 04:30 PM', 50]
      ];
      for (const [name, cap] of defaultSlots) {
        await rawConnection.query(
          'INSERT INTO pickup_slots (slot_name, max_capacity, current_orders, is_active) VALUES (?, ?, 0, 1)',
          [name, cap]
        );
      }
      console.log(`Inserted ${defaultSlots.length} default pickup slots.`);
    }

    // 5. Migrate data from db.json if available
    if (fs.existsSync(DB_JSON_FILE)) {
      console.log('\nFound existing data in db.json. Migrating records to MySQL...');
      const rawData = fs.readFileSync(DB_JSON_FILE, 'utf8');
      const data = JSON.parse(rawData);

      // A. Migrate Users
      if (Array.isArray(data.users) && data.users.length > 0) {
        let insertedUsers = 0;
        for (const u of data.users) {
          const [exists] = await rawConnection.query('SELECT id FROM users WHERE id = ? OR email = ? OR sap_id = ?', [u.id, u.email, u.sapId]);
          if (exists.length === 0) {
            await rawConnection.query(
              'INSERT INTO users (id, name, sap_id, email, password, role, user_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [
                u.id,
                u.name || 'SVKM User',
                u.sapId ? String(u.sapId) : `SAP-${Date.now()}`,
                u.email,
                u.password,
                u.role || 'student',
                u.userType || (u.role === 'admin' ? 'Admin' : 'Student'),
                u.createdAt ? new Date(u.createdAt) : new Date()
              ]
            );
            insertedUsers++;
          } else {
            await rawConnection.query(
              'UPDATE users SET name = ?, password = ?, role = ?, user_type = ? WHERE id = ?',
              [u.name, u.password, u.role, u.userType || (u.role === 'admin' ? 'Admin' : 'Student'), exists[0].id]
            );
          }
        }
        console.log(`Users: ${insertedUsers} new records migrated (${data.users.length} total existing).`);
      }

      // B. Migrate Categories
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        let insertedCats = 0;
        for (const c of data.categories) {
          const [exists] = await rawConnection.query('SELECT id FROM categories WHERE id = ? OR name = ?', [c.id, c.name]);
          if (exists.length === 0) {
            await rawConnection.query(
              'INSERT INTO categories (id, name, description, image, created_at) VALUES (?, ?, ?, ?, ?)',
              [
                c.id,
                c.name,
                c.description || '',
                c.image || null,
                c.createdAt ? new Date(c.createdAt) : new Date()
              ]
            );
            insertedCats++;
          }
        }
        console.log(`Categories: ${insertedCats} new records migrated (${data.categories.length} total existing).`);
      }

      // C. Migrate Food Items
      if (Array.isArray(data.foods) && data.foods.length > 0) {
        let insertedFoods = 0;
        for (const f of data.foods) {
          const [exists] = await rawConnection.query('SELECT id FROM food_items WHERE id = ?', [f.id]);
          if (exists.length === 0) {
            await rawConnection.query(
              `INSERT INTO food_items 
               (id, name, description, price, category_id, category_name, is_veg, is_jain, image, is_available, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                f.id,
                f.name,
                f.description || '',
                Number(f.price) || 0,
                f.categoryId,
                f.categoryName || 'General',
                f.isVeg !== undefined ? (f.isVeg ? 1 : 0) : 1,
                f.isJain ? 1 : 0,
                f.image || '/images/foods/samosa.jpg',
                f.isAvailable !== undefined ? (f.isAvailable ? 1 : 0) : 1,
                f.createdAt ? new Date(f.createdAt) : new Date()
              ]
            );
            insertedFoods++;
          }
        }
        console.log(`Food Items: ${insertedFoods} new records migrated (${data.foods.length} total existing).`);
      }

      // D. Migrate Orders & Order Items
      if (Array.isArray(data.orders) && data.orders.length > 0) {
        let insertedOrders = 0;
        for (const o of data.orders) {
          const [exists] = await rawConnection.query('SELECT id FROM orders WHERE id = ? OR order_number = ?', [o.id, o.orderId]);
          if (exists.length === 0) {
            // Verify user exists first to respect FK
            let orderUserId = o.userId;
            const [userExists] = await rawConnection.query('SELECT id FROM users WHERE id = ?', [orderUserId]);
            if (userExists.length === 0) {
              const [firstUser] = await rawConnection.query('SELECT id FROM users LIMIT 1');
              if (firstUser.length > 0) {
                orderUserId = firstUser[0].id;
              }
            }

            if (orderUserId) {
              await rawConnection.query(
                `INSERT INTO orders 
                 (id, order_number, user_id, user_name, user_email, user_type, subtotal, platform_fee, gst_amount, grand_total, payment_method, payment_status, transaction_id, status, pickup_slot, special_instructions, order_date, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  o.id,
                  o.orderId || `CFO-2026-${Date.now().toString().slice(-6)}`,
                  orderUserId,
                  o.userName || 'SVKM Customer',
                  o.userEmail || 'student@svkm.ac.in',
                  o.userType || 'Student',
                  Number(o.subtotal || o.grandTotal || 0),
                  Number(o.platformFee || 0),
                  Number(o.gstAmount || 0),
                  Number(o.grandTotal || 0),
                  o.paymentMethod || 'Cash',
                  o.paymentStatus || 'Pending Counter Payment',
                  o.transactionId || null,
                  o.status || 'Placed',
                  o.pickupSlot || null,
                  o.specialInstructions || null,
                  o.orderDate ? new Date(o.orderDate) : new Date(),
                  o.createdAt ? new Date(o.createdAt) : new Date()
                ]
              );

              // Insert order items
              if (Array.isArray(o.items)) {
                for (const it of o.items) {
                  await rawConnection.query(
                    `INSERT INTO order_items 
                     (order_id, food_id, item_name, item_image, category_name, price, quantity, subtotal)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                      o.id,
                      it.foodId || null,
                      it.name || 'Cafeteria Item',
                      it.image || null,
                      it.categoryName || 'Snacks',
                      Number(it.price || 0),
                      Number(it.quantity || 1),
                      Number(it.subtotal || (it.price * it.quantity) || 0)
                    ]
                  );
                }
              }

              // Insert status history
              await rawConnection.query(
                'INSERT INTO order_status_history (order_id, status, changed_by, notes) VALUES (?, ?, ?, ?)',
                [o.id, o.status || 'Placed', 'system', 'Migrated from previous records']
              );

              insertedOrders++;
            }
          }
        }
        console.log(`Orders: ${insertedOrders} new records migrated (${data.orders.length} total existing).`);
      }
    }

    console.log('\n====================================================');
    console.log(' DATABASE MIGRATION COMPLETED SUCCESSFULLY!');
    console.log(' All tables and records are active in MySQL svkm_canteen.');
    console.log('====================================================\n');
  } catch (migErr) {
    console.error('Migration error:', migErr);
    throw migErr;
  } finally {
    if (rawConnection) {
      await rawConnection.end();
    }
  }
}

if (require.main === module) {
  runMigration().catch((e) => {
    console.error('Migration script failed:', e.message);
    process.exit(1);
  });
}

module.exports = { runMigration };
