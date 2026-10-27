const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'svkm_canteen',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

let pool = null;
let isConnected = false;
let lastError = null;

function getPool() {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
    } catch (err) {
      console.error('Failed to initialize MySQL pool:', err.message);
      lastError = err.message;
    }
  }
  return pool;
}

// Test connectivity
async function testConnection() {
  try {
    const p = getPool();
    if (!p) throw new Error('MySQL connection pool could not be initialized.');

    const connection = await p.getConnection();
    const [rows] = await connection.query('SELECT 1 + 1 AS result, NOW() as currentTime, DATABASE() as currentDb');
    connection.release();

    isConnected = true;
    lastError = null;

    return {
      success: true,
      isConnected: true,
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      currentTime: rows[0].currentTime
    };
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    return {
      success: false,
      isConnected: false,
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      error: err.message
    };
  }
}

// Execute parameterized query
async function query(sql, params = []) {
  const p = getPool();
  if (!p) {
    throw new Error('MySQL pool is not available.');
  }
  const [results] = await p.query(sql, params);
  return results;
}

// Acquire a dedicated connection for multi-step transactions
async function getConnection() {
  const p = getPool();
  if (!p) {
    throw new Error('MySQL pool is not available.');
  }
  return await p.getConnection();
}

function getStatus() {
  return {
    isConnected,
    dbType: 'MySQL Server (Relational Database)',
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    lastError
  };
}

module.exports = {
  getPool,
  query,
  getConnection,
  testConnection,
  getStatus,
  dbConfig
};
