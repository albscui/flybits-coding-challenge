// File: controllers/drink_controller.js

const Drink = require("../models/drink_model.js");

exports.create = function (req, res) {
    // Create and Save a new Drink
    if (!req.body.ingredients) {
        return res.status(400).send({
            message: "Drink must have ingredients!"
        });
    }

    var drink = new Drink({
        name: req.body.name || "Untitled Drink",
        drink_type: req.body.drink_type,
        price: req.body.price,
        size: req.body.size,
        start_avail_date: req.body.start_avail_date,
        end_avail_date: req.body.end_avail_date,
        ingredients: req.body.ingredients
    });

    drink.save((err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({
                message: "Some error occured while creating the Drink."
            });
        } else {
            res.send(data);
        }
    });
};

exports.findAll = function (req, res) {
    // Retrieve and return all drinks from the database
    Drink.find(req.query, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({
                message: "Some error occurred while retrieving drinks."
            });
            return;
        } else {
            res.send(data);
        }
    });
};

exports.findOne = function (req, res) {
    Drink.findById(req.params.drinkId, (err, drink) => {
        if (err) {
            console.error(err);
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Drink not found with id " + req.params.drinkId
                });
            }
            return res.status(500).send({
                message: "Error retrieving drink with id " + req.params.drinkId
            });
        }
        if (!drink) {
            return res.status(404).send({
                message: "Drink not found with id " + req.params.drinkId
            });
        }

        res.send(drink);
    });
};

exports.update = function (req, res) {
    // Update a drink identified by the drinkId in the request
    Drink.findById(req.params.drinkId, (err, drink) => {
        if (err) {
            console.error(err);
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Drink not found with id " + req.params.drinkId
                });
            }
            return res.status(500).send({
                message: "Error finding drink with id " + req.params.drinkId
            });
        }

        if (!drink) {
            return res.status(404).send({
                message: "Drink not found with id " + req.params.drinkId
            });
        }

        drink.set(req.body);
        drink.save((err, updatedDrink) => {
            if (err) {
                res.status(500).send({
                    message: "Could not update drink with id " + req.params.drinkId
                });
            } else {
                res.send(updatedDrink);
            }
        });
    });
};

exports.delete = function (req, res) {
    // Delete a drink with the specified drinkId in the request
    Drink.findByIdAndRemove(req.params.drinkId, (err, drink) => {
        if (err) {
            console.error(err);
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Drink not found with id " + req.params.drinkId
                });
            }
            return res.status(500).send({
                message: "Could not delete drink with id " + req.params.drinkId
            });
        }

        if (!drink) {
            return res.status(404).send({
                message: "Drink not found with id " + req.params.drinkId
            });
        }

        res.send({
            message: "Drink deleted successfully!"
        });
    });
};