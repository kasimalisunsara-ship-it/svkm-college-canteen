const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Valid status transitions map
const VALID_TRANSITIONS = {
  'Placed': ['Preparing'],
  'Preparing': ['Ready'],
  'Ready': ['Completed'],
  'Completed': [] // Terminal state
};

// POST Place Order (SVKM Student / Staff with Payment Method selection)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, paymentMethod, transactionId, pickupSlot, specialInstructions } = req.body;

    // Backend authorization check: must be SVKM email or admin
    const user = await db.findUserById(req.user.id);
    if (req.user.role !== 'admin' && (!user || !db.isSvkmEmail(user.email))) {
      return res.status(403).json({
        message: 'This canteen ordering system is exclusively available to SVKM students and teaching staff.'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart cannot be empty. Please select food items.' });
    }

    const allFoods = await db.getFoods();
    const processedItems = [];
    let subtotalSum = 0;

    for (const item of items) {
      const qty = parseInt(item.quantity, 10);
      if (!qty || qty <= 0) {
        return res.status(400).json({ message: 'Invalid item quantity specified.' });
      }

      // Never trust client prices! Query verified price from database
      let food = null;
      if (item.foodId || item.id) {
        food = await db.findFoodById(item.foodId || item.id);
      }
      if (!food && item.name) {
        food = allFoods.find(f => f.name.toLowerCase() === item.name.toLowerCase());
      }

      if (food && food.isAvailable === false) {
        return res.status(400).json({ message: `'${food.name}' is currently unavailable. Please remove it from your cart.` });
      }

      const name = food ? food.name : (item.name || 'Cafeteria Item');
      const image = food ? food.image : (item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');
      const categoryName = food ? food.categoryName : (item.categoryName || 'Snacks');
      const verifiedPrice = food ? Number(food.price) : 50; // Server-validated price
      const itemSubtotal = verifiedPrice * qty;

      processedItems.push({
        foodId: food ? food.id : (item.foodId || item.id || `custom-${Date.now()}`),
        name,
        image,
        categoryName,
        price: verifiedPrice,
        quantity: qty,
        subtotal: itemSubtotal
      });

      subtotalSum += itemSubtotal;
    }

    const chosenPaymentMethod = paymentMethod || 'Cash';
    const paymentStatus = chosenPaymentMethod === 'Online UPI' || chosenPaymentMethod === 'Campus Card' ? 'Paid' : 'Pending Counter Payment';
    const generatedTxnId = transactionId || (chosenPaymentMethod === 'Online UPI' ? `UPI-${Date.now().toString().slice(-8)}` : null);

    const platformFee = 0;
    const gstAmount = 0;
    const grandTotal = Number((subtotalSum + platformFee + gstAmount).toFixed(2));

    const newOrder = await db.createOrder({
      userId: req.user.id,
      userName: user ? user.name : req.user.name,
      userEmail: user ? user.email : req.user.email,
      userType: user ? (user.userType || user.role) : 'Student',
      items: processedItems,
      subtotal: subtotalSum,
      platformFee,
      gstAmount,
      grandTotal,
      paymentMethod: chosenPaymentMethod,
      paymentStatus: paymentStatus,
      transactionId: generatedTxnId,
      pickupSlot: pickupSlot || null,
      specialInstructions: specialInstructions || null
    });

    res.status(201).json({
      message: 'Order placed successfully!',
      order: newOrder
    });
  } catch (err) {
    console.error('Order placement error:', err);
    res.status(500).json({ message: 'Failed to place order due to server error.' });
  }
});

// GET orders list
router.get('/', authenticateToken, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await db.getOrders();
    } else {
      orders = await db.getOrdersByUserId(req.user.id);
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving orders.' });
  }
});

// GET single order by ID or human-readable orderId
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await db.findOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only view your own orders.' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving order.' });
  }
});

// PUT update order status (Admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ message: 'Target status is required.' });
    }

    const order = await db.findOrderById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const currentStatus = order.status;
    const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

    if (currentStatus === status) {
      return res.status(400).json({ message: `Order is already in '${currentStatus}' status.` });
    }

    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from '${currentStatus}' to '${status}'. Expected sequence: Placed → Preparing → Ready → Completed.`
      });
    }

    const updatedOrder = await db.updateOrderStatus(order.id, status);
    res.json({
      message: `Order status updated to '${status}'.`,
      order: updatedOrder
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status.' });
  }
});

module.exports = router;
