const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET Admin Dashboard Summary Statistics
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const foods = await db.getFoods();
    const categories = await db.getCategories();
    const orders = await db.getOrders();

    const totalFoodItems = foods.length;
    const availableFoodItems = foods.filter(f => f.isAvailable).length;
    const unavailableFoodItems = foods.filter(f => !f.isAvailable).length;
    const totalCategories = categories.length;
    const totalOrders = orders.length;

    const placedOrders = orders.filter(o => o.status === 'Placed').length;
    const preparingOrders = orders.filter(o => o.status === 'Preparing').length;
    const readyOrders = orders.filter(o => o.status === 'Ready').length;
    const completedOrders = orders.filter(o => o.status === 'Completed').length;

    const totalRevenue = orders
      .filter(o => o.status === 'Completed')
      .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    const recentOrders = orders.slice(0, 5);

    res.json({
      stats: {
        totalFoodItems,
        availableFoodItems,
        unavailableFoodItems,
        totalCategories,
        totalOrders,
        placedOrders,
        preparingOrders,
        readyOrders,
        completedOrders,
        totalRevenue
      },
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ message: 'Error compiling admin dashboard statistics.' });
  }
});

// GET Daily Earnings & Month-End Financial Report
router.get('/reports', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { month, year } = req.query;
    const orders = await db.getOrders();

    const targetDate = new Date();
    const selectedYear = year ? parseInt(year, 10) : targetDate.getFullYear();
    const selectedMonth = month ? parseInt(month, 10) - 1 : targetDate.getMonth();

    const totalDaysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[selectedMonth] || 'September';

    const dailyEarnings = [];
    let monthTotalRevenue = 0;
    let monthCompletedOrdersCount = 0;
    let monthTotalItemsSold = 0;

    let cashTotal = 0;
    let upiTotal = 0;
    let campusCardTotal = 0;

    const itemSalesMap = {};

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const monthStr = String(selectedMonth + 1).padStart(2, '0');
      const dateKey = `${selectedYear}-${monthStr}-${dayStr}`;

      const dayOrders = orders.filter(o => {
        const oDate = new Date(o.createdAt || o.orderDate);
        return (
          oDate.getFullYear() === selectedYear &&
          oDate.getMonth() === selectedMonth &&
          oDate.getDate() === day
        );
      });

      const completedDayOrders = dayOrders.filter(o => o.status === 'Completed' || o.status === 'Ready');

      let dayRevenue = 0;
      let dayCash = 0;
      let dayUpi = 0;
      let dayCard = 0;

      for (const order of completedDayOrders) {
        const amount = order.grandTotal || 0;
        dayRevenue += amount;
        monthTotalRevenue += amount;
        monthCompletedOrdersCount += 1;

        const pMethod = (order.paymentMethod || 'Cash').toLowerCase();
        if (pMethod.includes('upi')) {
          dayUpi += amount;
          upiTotal += amount;
        } else if (pMethod.includes('card')) {
          dayCard += amount;
          campusCardTotal += amount;
        } else {
          dayCash += amount;
          cashTotal += amount;
        }

        if (Array.isArray(order.items)) {
          for (const item of order.items) {
            monthTotalItemsSold += (item.quantity || 1);
            const iName = item.name || 'Cafeteria Dish';
            itemSalesMap[iName] = (itemSalesMap[iName] || 0) + (item.quantity || 1);
          }
        }
      }

      dailyEarnings.push({
        date: dateKey,
        dayNumber: day,
        dayOfWeek: new Date(selectedYear, selectedMonth, day).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: Number(dayRevenue.toFixed(2)),
        completedOrdersCount: completedDayOrders.length,
        totalOrdersCount: dayOrders.length,
        cashRevenue: Number(dayCash.toFixed(2)),
        upiRevenue: Number(dayUpi.toFixed(2)),
        campusCardRevenue: Number(dayCard.toFixed(2))
      });
    }

    const topSellingDishes = Object.entries(itemSalesMap)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const averageOrderValue = monthCompletedOrdersCount > 0
      ? Number((monthTotalRevenue / monthCompletedOrdersCount).toFixed(2))
      : 0;

    res.json({
      monthInfo: {
        month: selectedMonth + 1,
        year: selectedYear,
        monthName,
        totalDays: totalDaysInMonth
      },
      monthSummary: {
        totalRevenue: Number(monthTotalRevenue.toFixed(2)),
        completedOrdersCount: monthCompletedOrdersCount,
        totalItemsSold: monthTotalItemsSold,
        averageOrderValue,
        paymentBreakdown: {
          cashTotal: Number(cashTotal.toFixed(2)),
          upiTotal: Number(upiTotal.toFixed(2)),
          campusCardTotal: Number(campusCardTotal.toFixed(2))
        },
        topSellingDishes
      },
      dailyEarnings
    });
  } catch (err) {
    res.status(500).json({ message: 'Error compiling reports.' });
  }
});

module.exports = router;
