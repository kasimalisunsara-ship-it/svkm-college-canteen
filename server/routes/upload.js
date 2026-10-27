const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = `food_${Date.now()}_${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP, GIF) are allowed.'));
    }
  }
});

// POST /api/upload (Admin upload via multipart/form-data)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Error uploading file.' });
    }

    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      return res.json({
        success: true,
        message: 'Image uploaded successfully!',
        imageUrl
      });
    }

    // Handle Base64 Upload if provided in body
    if (req.body && req.body.base64Image) {
      try {
        const matches = req.body.base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return res.status(400).json({ message: 'Invalid base64 image data.' });
        }

        const ext = matches[1].split('/')[1] || 'jpg';
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `food_${Date.now()}_${Math.round(Math.random() * 1E9)}.${ext}`;
        const filePath = path.join(UPLOADS_DIR, filename);

        fs.writeFileSync(filePath, buffer);
        const imageUrl = `/uploads/${filename}`;

        return res.json({
          success: true,
          message: 'Base64 image saved successfully!',
          imageUrl
        });
      } catch (uploadErr) {
        console.error('Base64 Upload Error:', uploadErr);
        return res.status(500).json({ message: 'Failed to process base64 image.' });
      }
    }

    return res.status(400).json({ message: 'No image file or base64 data provided.' });
  });
});

module.exports = router;
