const User = require('../models/user');

exports.userById = function(req, res, next, id) {

    User.findById(id).exec(function(err, user) {
        if (err || !user) {
            return res.status(400).json({
                "errors": [{
                    "msg": "User not found",
                    "param": "user"
                }]
            });
        }
        req.profile = user;
        next();

    });
}