const User = require('../models/user');

exports.signup = function(req, res) {
    console.log("body.req", req.body);
    const user = new User(req.body);
    user.save(function(err, user) {
        if (err) {
            return res.status(400).json({
                err
            });
        }
        res.json({
            user
        });
    });
};