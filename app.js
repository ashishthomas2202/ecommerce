//Imports
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

require('dotenv').config();

//Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');


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


//Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
// app.use(expressValidator());

//Routes Middleware
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);



//Routes
app.get('/', function(req, res) {
    res.send("Hello World");
});

app.post('/', function(req, res) {
    console.log(req.body);
});

const port = process.env.PORT || 8080;

app.listen(port, function() {
    console.log("Server is running at port " + port);
});