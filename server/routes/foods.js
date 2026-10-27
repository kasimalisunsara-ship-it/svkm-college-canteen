const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET all food items (supports search, category, availability, jain filter)
router.get('/', async (req, res) => {
  try {
    let foods = await db.getFoods();
    const { search, category, available, jain } = req.query;

    if (search) {
      const q = search.toLowerCase();
      foods = foods.filter(f =>
        f.name.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'all') {
      foods = foods.filter(f => f.categoryId === category || f.categoryName.toLowerCase() === category.toLowerCase());
    }

    if (available !== undefined && available !== 'all') {
      const isAvail = available === 'true';
      foods = foods.filter(f => f.isAvailable === isAvail);
    }

    if (jain === 'true') {
      foods = foods.filter(f => f.isJain === true);
    }

    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving food items.' });
  }
});

// GET single food item
router.get('/:id', async (req, res) => {
  try {
    const food = await db.findFoodById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found.' });
    }
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving food item.' });
  }
});

// POST create food item (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, categoryId, image, isAvailable, isJain } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Food name is required.' });
    }

    if (price === undefined || isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ message: 'Valid positive price is required.' });
    }

    if (!categoryId) {
      return res.status(400).json({ message: 'Category selection is required.' });
    }

    const category = await db.findCategoryById(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Selected category does not exist.' });
    }

    const newFood = await db.createFood({
      name: name.trim(),
      description: description ? description.trim() : '',
      price: Number(price),
      categoryId,
      categoryName: category.name,
      isVeg: true,
      isJain: Boolean(isJain),
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true
    });

    res.status(201).json({ message: 'Food item created successfully.', food: newFood });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create food item.' });
  }
});

// PUT update food item (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, image, isAvailable, isJain } = req.body;

    const existing = await db.findFoodById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Food item not found.' });
    }

    if (price !== undefined && (isNaN(price) || Number(price) <= 0)) {
      return res.status(400).json({ message: 'Valid positive price is required.' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined) updateData.price = Number(price);
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (image !== undefined) updateData.image = image;
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);
    if (isJain !== undefined) updateData.isJain = Boolean(isJain);

    const updated = await db.updateFood(id, updateData);
    res.json({ message: 'Food item updated successfully.', food: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update food item.' });
  }
});

// PATCH toggle availability (Admin only)
router.patch('/:id/availability', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const existing = await db.findFoodById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Food item not found.' });
    }

    const updated = await db.updateFood(id, { isAvailable: Boolean(isAvailable) });
    res.json({ message: `Availability updated to ${updated.isAvailable ? 'Available' : 'Unavailable'}.`, food: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update food availability.' });
  }
});

// DELETE food item (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await db.deleteFood(id);
    if (!success) {
      return res.status(404).json({ message: 'Food item not found.' });
    }
    res.json({ message: 'Food item deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete food item.' });
  }
});

module.exports = router;
