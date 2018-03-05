// File: controllers/drink_controller.js

const Drink = require("../models/drink_model.js");
const LIMIT = 10;

exports.create = function (req, res) {
    try {
        var drink = new Drink(preProcessCreateRequest(req.body));

        drink.save((err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).send({
                    message: "Some error occured while creating a drink."
                });
            } else {
                res.send({
                    message: "Created a new drink",
                    results: data
                });
            }
        });
    } catch (e) {
        console.error(e);
        return res.status(500).send({
            message: e
        });
    }
};

exports.createBatch = function (req, res) {
    const bag = req.body.map(i => new Drink(i));
    Drink.collection.insert(bag, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send({
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

    // Preprocess the request query down to the keys in the schema
    var queryProcessed = preProcessQuery(req.query);
    var queryFiltered = filterObjectByKeys(queryProcessed, Object.keys(Drink.schema.paths));

    // The mongoose Query object
    var MQuery = Drink.find(queryFiltered);

    // Chaining queries
    if (queryProcessed.available_on) {
        var _dateQuery = new Date(queryProcessed.available_on);
        MQuery = MQuery.where('start_avail_date').lte(_dateQuery).where('end_avail_date').gte(_dateQuery);
    }
    // Handy method for finding what drinks are currently available
    if (queryProcessed.available_now === 'true') {
        var _now = new Date();
        MQuery = MQuery.where('start_avail_date').lte(_now).where('end_avail_date').gte(_now);
    }
    // Filter by various fields
    if (queryProcessed.fields) {
        MQuery = MQuery.select(queryProcessed.fields);
    }
    // Pagination
    var qLimit = Number(queryProcessed.limit) || LIMIT;
    if (queryProcessed.last_id) {
        MQuery = MQuery.where('_id').gt(queryProcessed.last_id);
    }
    MQuery = MQuery.limit(qLimit);

    // Run query
    MQuery.exec((err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send({
                message: "Some error occured with this query."
            });
        } else {
            if (Object.keys(data).length === 0) {
                res.send({
                    message: "Sorry, no documents in the database corresponds to this query.",
                    results: data
                });
            } else {
                var uri = req.baseUrl + '?limit=' + qLimit + '&last_id=' + data[data.length - 1]._id
                res.send({
                    message: "Documents found. Click on next for the next page",
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
    // Find a drink identified by the drinkId in the request
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

        res.send({
            message: "Found it!",
            results: drink
        });
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

        // Override the drink document with the fields in the req.body
        drink.set(req.body);

        drink.save((err, updatedDrink) => {
            if (err) {
                console.error(err);
                return res.status(500).send({
                    message: "Could not update drink with id " + req.params.drinkId
                });
            } else {
                res.send({
                    message: "Updated one drink.",
                    results: updatedDrink
                });
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

// Helper functions

function preProcessCreateRequest(body) {
    const result = {};
    for (var k in body) {
        var val = body[k];
        if (k === 'start_avail_date' || k === 'end_avail_date') {
            if (typeof (val) !== 'string') {
                throw "Dates must be String!";
            }
        } else if (k === 'ingredients') {
            if (typeof(val) === 'string') {
                val = [val];
            } else if (val instanceof Array) {
                for (v of val) {
                    if (typeof v !== 'string') {
                        throw "Ingredients must be String!";
                    }
                }
            } else {
                throw "Ingredients must be either a string or an Array of strings";
            }
        }
        result[k] = val;
    }
    return result;
}

function filterObjectByKeys(obj, keys) {
    const result = Object.keys(obj).filter(key => keys.includes(key)).reduce((_obj, _key) => {
        _obj[_key] = obj[_key];
        return _obj;
    }, {});
    return result;
}

function preProcessQuery(preQuery) {
    const result = {};
    for (var k in preQuery) {
        var val = preQuery[k];

        // Update val according to our data requirements
        if (k === 'ingredients') {
            if (typeof (val) === 'string') {
                val = val.split(',');
            }
            val = {
                $all: val.map(i => i.toLowerCase())
            };
        } else if (k === 'fields') {
            if (val instanceof Array) {
                val = val.join(' ');
            } else if (typeof val === 'string') {
                val = val.replace(',', ' ');
            }
        }
        result[k] = val;
    }
    return result;
}