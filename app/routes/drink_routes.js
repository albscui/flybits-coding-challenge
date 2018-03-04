// File: routes/drink_routes.js

const express = require('express');
const router = express.Router();
const drinks = require('../controllers/drink_controller.js');

// Create new drinks
router.post('/', drinks.create);

// Create new drinks batch style
router.post('/batch', drinks.createBatch);

// Retrieve all drinks
router.get('/', drinks.findAll);

// Retrieve a single drink by drinkId
router.get('/:drinkId', drinks.findOne);

// Update a drink with drinkId
router.put('/:drinkId', drinks.update);

// Delete a drink
router.delete('/:drinkId', drinks.delete);

module.exports = router;