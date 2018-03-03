// File: models/drink_model.js

const mongoose = require('mongoose');

const DrinkSchema = mongoose.Schema({
    name: String,
    drink_type: {type: String, enum: ["Water", "Coffee", "Tea", "Expresso"]},
    price: Number,
    size: {type: String, enum: ['S', 'M', 'L']},
    start_avail_date: {type: Date, default: Date.now},
    end_avail_date: Date,
    ingredients: []
});

module.exports = mongoose.model('Drink', DrinkSchema);