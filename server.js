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

// Root entrypoint
app.get('/', (req, res) => {
    res.send("Welcome, feel free to try some of our coffee drinks!");
});

app.listen(port, () => {
    console.log("Server is listening on port " + port);
})