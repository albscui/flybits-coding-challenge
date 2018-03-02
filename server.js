// server.js

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
var dbConfig = require("./db_config.js");
const mongoDB = dbConfig.url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;

mongoose.connection.on('error', function () {
    console.log("Could not connect to the database. Exiting now...");
    process.exit();
});

mongoose.connection.once('open', function () {
    console.log("Successfully connected to MongoDB");
});

// Root entrypoint
app.get('/', (req, res) => {
    res.send("Welcome, feel free to try some of our coffee drinks!");
});

// Add extra entrypoints
require('./app/routes/drink_routes.js')(app);

app.listen(port, () => {
    console.log("Server is listening on port " + port);
})