const User = require('../models/user');
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