//Imports
const express = require('express');
require('dotenv').config();

//App
const app = express();

//Routes
app.get('/', function(req, res) {
    res.send("Hello World");
});

const port = process.env.PORT || 8000;

app.listen(port, function() {
    console.log("Server is running at port " + port);
});