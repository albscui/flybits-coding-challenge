// File: server.js

// TODO: use /menu/drinks
// add pagination

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
const dbConfig = require("./db_config.js");
const mongoDB = dbConfig.url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;

//Bind connection to error event (to get notification of connection errors)
mongoose.connection.on('error', () => {
    console.error("Could not connect to the database. Exiting now...");
    process.exit();
});

mongoose.connection.once('open', () => {
    console.log("Successfully connected to MongoDB");
});

// Root entrypoint
app.get('/', (req, res) => {
    res.send("Welcome, feel free to try some of our coffee drinks!");
});

// menu entrypoint
app.get('/menu', (req, res) => {
    res.send("We only have drinks right now (we are new), but feel free to check them out at /menu/drinks");
});

// Drinks entrypoints
const drinks = require('./app/routes/drink_routes.js');
app.use('/menu/drinks', drinks);

app.listen(port, () => {
    console.log("Server is listening on port " + port);
})