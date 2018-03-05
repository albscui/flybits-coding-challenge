// File: models/drink_model.js

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const DrinkSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    drink_type: {
        type: String,
        enum: ["water", "coffee", "tea", "expresso", "cold brew", "iced coffee", "iced tea"],
        lowercase: true
    },
    price: Number,
    size: {
        type: String,
        enum: ['S', 'M', 'L'],
        uppercase: true
    },
    start_avail_date: {
        type: Date,
        default: Date.now,
        validate: {
            validator: function (d) {
                return d < this.end_avail_date;
            }
        }
    },
    end_avail_date: {
        type: Date,
        default: new Date("2042"),
        validate: {
            validator: function (d) {
                return d > this.start_avail_date;
            },
            message: "End date must be after start date."
        }
    },
    ingredients: {
        type: [String],
        required: [true, "A drink must contain ingredients!"],
        set: function (ingredients) {
            // sets every thing to a string then lowercase it, also removes duplicates
            return ingredients.map(i => i.toLowerCase()).filter((element, i, a) => i === a.indexOf(element));
        },
        default: undefined
    }
});

// Potentially build an index for faster queries and prevent duplicate entries
// DrinkSchema.index({name: 1, drink_type: 1, price: -1, size: 1}, {unique: true})

module.exports = mongoose.model('Drink', DrinkSchema);