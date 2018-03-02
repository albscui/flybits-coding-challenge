// File: routes/drink_routes.js

module.exports = function (app) {
    const drinks = require('../controllers/drink_controller.js');

    // Create a new Drinks
    app.post('/drinks', drinks.create);

    // Retrieve all Drinks
    app.get('/drinks', drinks.findAll);

    // Retrieve a single drink by drinkId
    app.get('/drinks/:drinkId', drinks.findOne);

    // Update a drink with drinkId
    app.put('/drinks/:drinkId', drinks.update);

    // Delete a drink
    app.delete('/drinks/:drinkId', drinks.delete);
};