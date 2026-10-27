const mongoose = require('mongoose');

// Mongoose Schemas for Online Database Persistence

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  sapId: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  userType: { type: String, default: 'Student' },
  createdAt: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const foodSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  categoryId: { type: String, required: true },
  categoryName: { type: String, required: true },
  isVeg: { type: Boolean, default: true },
  isJain: { type: Boolean, default: false },
  image: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  orderNumber: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String },
  userEmail: { type: String },
  items: { type: Array, default: [] },
  subtotal: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'Cash' },
  paymentStatus: { type: String, default: 'Completed' },
  status: { type: String, default: 'Placed' },
  pickupSlot: { type: String },
  specialInstructions: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const Food = mongoose.model('Food', foodSchema);
const Order = mongoose.model('Order', orderSchema);

let isConnected = false;
let dbUri = process.env.MONGODB_URI || 'mongodb+srv://demo:demo123@cluster0.mongodb.net/svkm_cafeteria?retryWrites=true&w=majority';

async function connectMongoDB(customUri) {
  const uri = customUri || process.env.MONGODB_URI;
  if (!uri) {
    console.log('ℹ️  No MONGODB_URI set in .env. Operating in Online-Ready Local Mode.');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    dbUri = uri;
    console.log('====================================================');
    console.log('🟢 ONLINE DATABASE CONNECTED (MongoDB Atlas)');
    console.log('====================================================');
    return true;
  } catch (err) {
    console.warn('⚠️ MongoDB Atlas online connection note:', err.message);
    isConnected = false;
    return false;
  }
}

function getOnlineStatus() {
  return {
    isConnected,
    dbType: isConnected ? 'MongoDB Atlas (Online Cloud Database)' : 'Local File Sync Database (Online Ready)',
    status: isConnected ? 'online' : 'ready_online',
    uriConfigured: Boolean(process.env.MONGODB_URI)
  };
}

module.exports = {
  connectMongoDB,
  getOnlineStatus,
  User,
  Category,
  Food,
  Order
};
