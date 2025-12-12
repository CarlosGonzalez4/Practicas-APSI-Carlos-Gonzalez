const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

const router = express.Router();

// GET /api/cart
router.get('/', auth, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId').lean();
    if (!cart) {
      return res.status(200).json({ items: [] });
    }
    // format response: include product details + quantity
    const items = cart.items.map(i => ({
      product: {
        _id: i.productId._id,
        name: i.productId.name,
        description: i.productId.description,
        price: i.productId.price,
        stock: i.productId.stock
      },
      quantity: i.quantity
    }));
    res.status(200).json({ items });
  } catch (err) {
    next(err);
  }
});

// PUT /api/cart/add
router.put('/add', auth, async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: 'productId and quantity are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'quantity must be an integer > 0' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // get or create cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(it => it.productId.toString() === productId);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const newTotal = currentQtyInCart + quantity;

    if (newTotal > product.stock) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    if (existingItem) {
      existingItem.quantity = newTotal;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    // respond with updated cart (populated)
    const populated = await cart.populate('items.productId');
    const items = populated.items.map(i => ({
      product: {
        _id: i.productId._id,
        name: i.productId.name,
        description: i.productId.description,
        price: i.productId.price,
        stock: i.productId.stock
      },
      quantity: i.quantity
    }));
    res.status(200).json({ items });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
