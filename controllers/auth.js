const User = require('../models/user');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.signup = function(req, res) {
    const user = new User(req.body);
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