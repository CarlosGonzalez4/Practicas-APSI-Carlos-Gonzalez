const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const { jsonErrorHandler, genericErrorHandler } = require('./middleware/errorHandlers');

const app = express();

app.use(cors());
app.use(express.json());

// JSON parse errors -> custom handler
app.use(jsonErrorHandler);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// generic error handler
app.use(genericErrorHandler);

module.exports = app;

