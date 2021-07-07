const Category = require('../models/Category');

exports.create = function(req, res) {
    const category = new Category(req.body);
    category.save(function(err, data) {
        if (err) {
            return res.status(400).json({
                "errors": errorHandler(err)
            });
        }
        res.json({ data });
    });
};