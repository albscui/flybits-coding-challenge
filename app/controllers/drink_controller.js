// File: controllers/drink_controller.js

const Drink = require("../models/drink_model.js");
const LIMIT = 10;

exports.create = function (req, res) {
    // Create and Save a new Drink
    if (!req.body.ingredients) {
        res.status(400).send({
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
                message: "Some error occured while creating the new Drink."
            });
        } else {
            res.send(data);
        }
    });
};

exports.createBatch = function (req, res) {
    const bag = req.body.map(i => new Drink(i));
    Drink.collection.insert(bag, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({
                message: "Some error occurred while batch creating drinks."
            });
        } else {
            res.send({
                message: data.result.n + " drinks were successfully added."
            });
        }
    });
};

exports.findAll = function (req, res) {
    // Retrieve and all drinks from the database

    // Filter the request query down to the keys in the schema
    const query = filterQueryByKeys(req.query, Object.keys(Drink.schema.paths));

    // The mongoose Query object
    var MQuery = Drink.find(query);

    // Chaining queries
    if (req.query.available_on) {
        var _dateQuery = new Date(req.query.available_on);
        MQuery = MQuery.where('start_avail_date').lte(_dateQuery).where('end_avail_date').gte(_dateQuery);
    }
    // Handy method for finding what drinks are currently available
    if (req.query.available_now === 'true') {
        var _now = new Date();
        MQuery = MQuery.where('start_avail_date').lte(_now).where('end_avail_date').gte(_now);
    }
    // Filter by various fields
    if (req.query.fields) {
        var _fields = req.query.fields.replace(',', ' ');
        MQuery = MQuery.select(_fields);
    }
    // Pagination
    var qLimit = Number(req.query.limit) || LIMIT;
    if (req.query.last_id) {
        MQuery = MQuery.where('_id').gt(req.query.last_id);
    }
    MQuery = MQuery.limit(qLimit);

    // Run query
    MQuery.exec((err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({
                message: "Some error occurred while retrieving drinks."
            });
        } else {
            if (Object.keys(data).length === 0) {
                res.send(data);
            } else {
                var uri = req.baseUrl + '?limit=' + qLimit + '&last_id=' + data[data.length - 1]._id
                res.send({
                    next: encodeURI(uri),
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
                res.status(404).send({
                    message: "Drink not found with id " + req.params.drinkId
                });
            }
            res.status(500).send({
                message: "Error retrieving drink with id " + req.params.drinkId
            });
        }
        if (!drink) {
            res.status(404).send({
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
                res.status(404).send({
                    message: "Drink not found with id " + req.params.drinkId
                });
            }
            res.status(500).send({
                message: "Error finding drink with id " + req.params.drinkId
            });
        }

        if (!drink) {
            res.status(404).send({
                message: "Drink not found with id " + req.params.drinkId
            });
        }

        // Override the drink document with the fields in the req.body
        drink.set(req.body);

        drink.save((err, updatedDrink) => {
            if (err) {
                console.error(err);
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
                res.status(404).send({
                    message: "Drink not found with id " + req.params.drinkId
                });
            }
            res.status(500).send({
                message: "Could not delete drink with id " + req.params.drinkId
            });
        }

        if (!drink) {
            res.status(404).send({
                message: "Drink not found with id " + req.params.drinkId
            });
        }

        res.send({
            message: "Drink deleted successfully!"
        });
    });
};

// Helper functions
function filterQueryByKeys(reqQ, keys) {
    const query = {};
    for (var k of keys) {
        if (k in reqQ) {
            query[k] = reqQ[k]
        }
    }
    return query;
}