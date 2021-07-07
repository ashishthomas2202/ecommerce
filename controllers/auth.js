const User = require('../models/user');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.signup = function(req, res) {
    const user = new User(req.body);

    let firstname = user.firstName;
    user.firstName = firstname[0].toUpperCase() + firstname.substring(1).toLowerCase();

    let lastname = user.lastName;
    user.lastName = lastname[0].toUpperCase() + lastname.substring(1).toLowerCase();

    user.save(function(err, user) {
        if (err) {
            return res.status(400).json({
                "errors": errorHandler(err)
            });
        }

        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({
            user
        });
    });
};

exports.signin = function(req, res) {

    // kmsi = keep me sign in (1 = true, 0 = false)
    const { email, password, kmsi } = req.body;
    User.findOne({ email }, function(err, user) {
        if (err || !user) {
            return res.status(400).json({
                "errors": [{
                    "msg": "User with this email does not exist. Please signup",
                    "value": email,
                    "param": "email"
                }]
            });
        }

        //if user is found, match the email and password from the database
        // create authenticate method in user model 
        if (!user.authenticate(password)) {
            return res.status(401).json({
                "errors": [{
                        "msg": "Email and password dont match",
                        "param": "email"
                    }, {
                        "msg": "Email and password dont match",
                        "param": "password"
                    }

                ]
            });
        }
        // generate a signed token with user id and secret
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

        // persist the token as 'ua' in cookie with expiry date : 15 hours = 54000s
        if (kmsi)
            res.cookie('ua', token);
        else
            res.cookie('ua', token, { expire: new Date() + 54000 });

        //return response with the user and token to frontend client
        const { _id, firstName, lastName, email, role } = user;
        return res.json({
            token,
            user: {
                _id,
                email,
                firstName,
                lastName,
                role
            }
        });


    });
};