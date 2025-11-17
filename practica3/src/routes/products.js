const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/products (public)
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find().lean();
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
});

// POST /api/products (requires auth)
router.post('/', auth, async (req, res, next) => {
  try {
    const { name, description, price, stock } = req.body;
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'name, price and stock are required' });
    }
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ message: 'price must be a number > 0' });
    }
    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ message: 'stock must be an integer >= 0' });
    }
    const product = new Product({ name, description, price, stock });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
