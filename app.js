//Imports
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

//Import Routes
const authRoutes = require('./routes/auth');

//App
const app = express();

//Database
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
}).then(function() {
    console.log("DB is connected");
});

//Routes Middleware
app.use('/api', authRoutes);


//Routes
app.get('/', function(req, res) {
    res.send("Hello World");
});

const port = process.env.PORT || 8000;

app.listen(port, function() {
    console.log("Server is running at port " + port);
});