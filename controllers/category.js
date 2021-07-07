const Category = require('../models/Category');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.categoryById = function(req, res, next, id) {

    Category.findById(id).exec(function(err, category) {
        if (err || !category) {
            return res.status(400).json({
                "errors": [{
                    "msg": "Category not found",
                    "param": "id"
                }]
            });
        }
        req.category = category;
        next();

    });
};

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

exports.update = function(req, res) {

    const category = req.category;
    // console.log(category);
    category.name = req.body.name;
    category.save(function(err, data) {
        if (err) {
            return res.status(400).json({
                "errors": errorHandler(err)
            });
        }
        res.json({ data });
    });

};

exports.remove = function(req, res) {

    const category = req.category;
    console.log(req.category);
    category.remove(function(err, deletedCategory) {
        if (err) {
            return res.status(400).json({
                "errors": errorHandler(err)
            });
        }
        res.json({
            deletedCategory,
            message: "Category deleted successfully"
        });
    });

};