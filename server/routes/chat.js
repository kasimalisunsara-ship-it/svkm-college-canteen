const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Full Week Special Menu Catalog
const WEEKLY_SPECIALS = {
  Monday: {
    day: 'Monday',
    title: 'Indo-Chinese Fiesta 🥢',
    specialItem: 'Schezwan Veg Fried Rice + Crispy Veg Manchurian Combo',
    price: 110,
    description: 'Hot wok tossed Schezwan rice served with garlic Manchurian gravy and spring onion garnishing.',
    image: '/images/foods/fried-rice.jpg'
  },
  Tuesday: {
    day: 'Tuesday',
    title: 'Punjabi Chole Extravaganza 🫓',
    specialItem: 'Amritsari Chole Bhature (2 Large Bhature)',
    price: 100,
    description: 'Fluffy piping hot bhature served with slow-cooked spicy chickpea masala, fried green chili and pickled onions.',
    image: '/images/foods/chole-bhature.jpg'
  },
  Wednesday: {
    day: 'Wednesday',
    title: 'Royal Biryani Day 🍲',
    specialItem: 'Hyderabadi Veg Dum Biryani with Mirchi Ka Salan',
    price: 130,
    description: 'Long grain basmati rice layered with aromatic spices and saffron, served with spicy peanuts salan & mint raita.',
    image: '/images/foods/veg-biryani.jpg'
  },
  Thursday: {
    day: 'Thursday',
    title: 'Paneer Lover’s Delight 🧀',
    specialItem: 'Paneer Butter Masala with 2 Garlic Naan',
    price: 140,
    description: 'Char-grilled paneer cubes simmered in creamy butter tomato gravy, served with butter-brushed garlic naan.',
    image: '/images/foods/paneer-tikka.jpg'
  },
  Friday: {
    day: 'Friday',
    title: 'South Indian Feast 🥞',
    specialItem: 'Mysore Cheese Masala Dosa + Filter Coffee',
    price: 95,
    description: 'Crispy rice crepe spread with fiery red chutney, stuffed with spiced potato mash and melted cheese. Includes authentic filter chai.',
    image: '/images/foods/masala-dosa.jpg'
  },
  Saturday: {
    day: 'Saturday',
    title: 'Mumbai Street Food Carnival 🧈',
    specialItem: 'Extra Butter Pav Bhaji + Peri Peri Fries',
    price: 120,
    description: 'Generous portion of buttery bhaji with 3 soft toasted pavs and a side of crispy peri peri potato fries.',
    image: '/images/foods/pav-bhaji.jpg'
  },
  Sunday: {
    day: 'Sunday',
    title: 'Grand Campus Feast 🍨',
    specialItem: 'Special Maharaja Thali + Free Ice Cream Sundae',
    price: 170,
    description: 'Paneer Kadhai, Dal Makhani, Veg Pulao, 2 Parathas, Sweet Gulab Jamun, Salad, Papad & Vanilla Sundae.',
    image: '/images/foods/veg-thali.jpg'
  }
};

// GET Weekly Specials API
router.get('/specials', (req, res) => {
  res.json({
    specials: Object.values(WEEKLY_SPECIALS)
  });
});

// POST AI Chat Query Endpoint
router.post('/query', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ reply: 'Please ask me anything about Pure Veg & Jain cafeteria menu or week specials!' });
    }

    const query = message.toLowerCase().trim();
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const allFoods = await db.getFoods();

    // 1. Jain Food Query
    if (query.includes('jain')) {
      const jainFoods = allFoods.filter(f => f.isJain && f.isAvailable);
      const listText = jainFoods.map(f => `• **${f.name}** (${f.categoryName}) — **₹${f.price}**\n  *${f.description}*`).join('\n\n');

      return res.json({
        reply: `🪷 **SVKM Cafeteria 100% Jain Specials (No Onion/Garlic/Root Veg)**:\n\n${listText}\n\nAll Jain items are prepared in a dedicated, hygienic kitchen area! You can filter Jain food directly on the menu page.`
      });
    }

    // 2. Full Week Special Query
    if (query.includes('full week') || query.includes('weekly') || query.includes('all days') || query.includes('week special')) {
      const listText = Object.values(WEEKLY_SPECIALS)
        .map(s => `• **${s.day}**: ${s.specialItem} — **₹${s.price}**`)
        .join('\n');

      return res.json({
        reply: `🌟 **SVKM Cafeteria Full Week Special Menu Schedule**:\n\n${listText}\n\nAll items are cooked fresh daily! What day's special would you like to order today?`,
        type: 'weekly_specials',
        specials: Object.values(WEEKLY_SPECIALS)
      });
    }

    // 3. Specific Day Query
    const mentionedDay = days.find(d => query.includes(d));
    if (mentionedDay) {
      const capitalized = mentionedDay.charAt(0).toUpperCase() + mentionedDay.slice(1);
      const spec = WEEKLY_SPECIALS[capitalized];
      if (spec) {
        return res.json({
          reply: `✨ **${spec.day}'s Cafeteria Special**: **${spec.specialItem}**\n\n📌 *Description*: ${spec.description}\n💰 *Price*: **₹${spec.price}**`,
          type: 'day_special',
          special: spec
        });
      }
    }

    // 4. Today's Special
    if (query.includes('today') || query.includes('today\'s')) {
      const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const spec = WEEKLY_SPECIALS[todayName] || WEEKLY_SPECIALS['Monday'];
      return res.json({
        reply: `🔥 **Today's (${todayName}) Campus Special**: **${spec.specialItem}** for **₹${spec.price}**!\n\n${spec.description}`,
        type: 'day_special',
        special: spec
      });
    }

    // 5. Recommendation / Price Under / Budget Query
    if (query.includes('under') || query.includes('cheap') || query.includes('budget') || query.includes('recommend')) {
      const foods = allFoods.filter(f => f.isAvailable);
      const cheapFoods = foods.filter(f => f.price <= 100).slice(0, 4);
      const recText = cheapFoods.map(f => `• **${f.name}** (${f.categoryName}): ₹${f.price}`).join('\n');
      return res.json({
        reply: `😋 Here are top tasty recommendations under ₹100:\n\n${recText}\n\nYou can order these right now from the menu!`
      });
    }

    // 6. Operating Hours
    if (query.includes('time') || query.includes('hour') || query.includes('open') || query.includes('timing')) {
      return res.json({
        reply: `⏰ **SVKM Cafeteria Timings**:\n\n• **Monday – Saturday**: 8:00 AM – 8:30 PM\n• **Sunday**: 9:00 AM – 5:00 PM\n\nPure Veg & Jain hot meals are served continuously throughout the day!`
      });
    }

    // 7. Generic Menu Item Lookup
    const matchedFood = allFoods.find(f => query.includes(f.name.toLowerCase()) || (f.categoryName && query.includes(f.categoryName.toLowerCase())));

    if (matchedFood) {
      return res.json({
        reply: `🍽️ **${matchedFood.name}**\n\nCategory: ${matchedFood.categoryName}\nDietary: 🟢 Veg ${matchedFood.isJain ? '| 🪷 Jain Special' : ''}\nPrice: ₹${matchedFood.price}\nStatus: ${matchedFood.isAvailable ? '✅ Currently Available' : '❌ Out of stock'}\nDescription: ${matchedFood.description}`
      });
    }

    // Default AI Assistant Response
    return res.json({
      reply: `🤖 I'm **BiteBot AI**, your SVKM Canteen assistant!\n\nYou can ask me:\n• *"Show me Jain food options"* 🪷\n• *"Show me the full week special menu"* 📅\n• *"What is today's special?"* 🍲\n• *"Recommend snacks under ₹50"* 🪙\n• *"Cafeteria timings"* ⏰`
    });
  } catch (err) {
    res.status(500).json({ reply: 'Sorry, I encountered an issue accessing cafeteria menu records.' });
  }
});

module.exports = router;
