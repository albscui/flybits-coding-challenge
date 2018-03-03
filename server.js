// File: server.js

// TODO:
// - handle upper case and lowercase
// - add pagination
// - worry about modifying dates

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Database configuration
const mongoDB = process.env.MONGO_URL;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;

// mongoose.connection.on('error', console.error.bind(console, "MongoDB connection error: " + mongoDB));
mongoose.connection.once('open', console.log.bind(console, "Successfully connected to MongoDB: " + mongoDB));

// Root entrypoint
app.get('/', (req, res) => {
    res.send({message: "Welcome, feel free to try some of our coffee drinks!"});
});

// Menu entrypoint
app.get('/menu', (req, res) => {
    res.send({message: "We only have drinks right now, but feel free to check them out at /menu/drinks"});
});

// Drinks entrypoints
const drinks = require('./app/routes/drink_routes.js');
app.use('/menu/drinks', drinks);

app.listen(port, () => {
    console.log("Server is listening on port " + port);
})