const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await db.getCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving categories.' });
  }
});

// POST create category (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const categories = await db.getCategories();
    const existing = categories.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) {
      return res.status(409).json({ message: 'Category already exists.' });
    }

    const newCat = await db.createCategory({
      name: name.trim(),
      description: description ? description.trim() : '',
      image: image || null
    });

    res.status(201).json({ message: 'Category created successfully.', category: newCat });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create category.' });
  }
});

// PUT update category (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const { id } = req.params;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const updated = await db.updateCategory(id, {
      name: name.trim(),
      description: description ? description.trim() : '',
      image: image !== undefined ? image : undefined
    });

    if (!updated) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.json({ message: 'Category updated successfully.', category: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update category.' });
  }
});

// DELETE category (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const foods = await db.getFoods();
    
    // Check if food items use this category
    const assignedFoods = foods.filter(f => f.categoryId === id);
    if (assignedFoods.length > 0) {
      return res.status(400).json({
        message: `Cannot delete category. There are ${assignedFoods.length} food items currently assigned to this category.`
      });
    }

    const success = await db.deleteCategory(id);
    if (!success) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete category.' });
  }
});

module.exports = router;
