// File: server.js

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
const mongoDB = process.env.MONGO_URL || "mongodb://mongo:27017/flybitscoffee";
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;

// Mongoose connection event handlers
mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err, '\nExiting now...');
    process.exit(1);
})
mongoose.connection.once('open', () => {
    console.log('Mongoose opened connection on ' + mongoDB);
});
mongoose.connection.on('connect', () => {
    console.log('Mongoose successfully connected to ' + mongoDB);
});
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose connection disconnected');
});
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('Mongoose connection disconnected through app termination');
        process.exit(0);
    });
});

// Root entrypoint
app.get('/', (req, res) => {
    res.send({
        message: "Welcome, feel free to try some of our coffee drinks!"
    });
});

// Menu entrypoint
app.get('/menu', (req, res) => {
    res.send({
        message: "We only have drinks right now, but feel free to check them out at /menu/drinks"
    });
});

// Drinks entrypoints
const drinks = require('./app/routes/drink_routes.js');
app.use('/menu/drinks', drinks);

app.listen(port, () => {
    console.log("Server is listening on port " + port);
})