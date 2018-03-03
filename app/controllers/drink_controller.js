// File: controllers/drink_controller.js

const Drink = require("../models/drink_model.js");
var qLimit = 100;

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
            return res.status(500).send({
                message: "Some error occured while creating the new Drink."
            });
        } else {
            return res.send(data);
        }
    });
};

exports.createBatch = function (req, res) {
    const bag = [];
    for (var i = 0; i < req.body.length; i++) {
        var drink = new Drink(req.body[i]);
        bag.push(drink);
    }
    Drink.collection.insert(bag, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send({
                message: "Some error occurred while batch creating drinks."
            });
        } else {
            return res.send({
                message: data.result.n + " drinks were successfully added."
            });
        }
    })
};

exports.findAll = function (req, res) {
    // Retrieve and return all drinks from the database

    // Filter the request query down to the keys in the schema
    const query = {}
    for (var k of Object.keys(Drink.schema.paths)) {
        if (k in req.query) {
            query[k] = req.query[k];
        }
    }

    // The mongoose Query object
    var Query = Drink.find(query);

    // Chaining queries
    if (req.query.available_on) {
        var _dateQuery = new Date(req.query.availableOn);
        Query = Query.where('start_avail_date').lte(_dateQuery).where('end_avail_date').gte(_dateQuery);
    }
    // Handy method for finding what drinks are currently available
    if (req.query.available_now === 'true') {
        var _now = new Date();
        Query = Query.where('start_avail_date').lte(_now).where('end_avail_date').gte(_now);
    }
    // Filter by various fields
    if (req.query.fields) {
        var _fields = req.query.fields.replace(',', ' ');
        Query = Query.select(_fields);
    }
    // Pagination
    if (req.query.limit) {
        qLimit = Number(req.query.limit);
        if (req.query.last_id) {
            Query = Query.where('_id').gt(req.query.last_id);
        }
    }
    Query = Query.limit(qLimit);

    Query.exec((err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send({
                message: "Some error occurred while retrieving drinks."
            });
        } else {
            if (Object.keys(data).length === 0) {
                return res.send(data);
            } else {
                return res.send({
                    next: "limit=" + qLimit + "&" + "last_id=" + data[data.length - 1]._id,
                    limit: qLimit,
                    size: data.length,
                    results: data
                });
            }

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
                return es.status(500).send({
                    message: "Could not update drink with id " + req.params.drinkId
                });
            } else {
                return res.send(updatedDrink);
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

        return res.send({
            message: "Drink deleted successfully!"
        });
    });
};