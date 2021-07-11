const { check, validationResult } = require('express-validator');

exports.createValidator = function(route, fields, files) {

    switch (route) {
        case 'create':
            return [check(fields.sku).notEmpty().withMessage("SKU is required.")];
        default:
            return [];
    }
}

exports.checkValidator = function(req, res) {
    const result = validationResult(req);
    if (result.isEmpty()) {
        return;
    }

    return res.status(422).json({ errors: result.array() });
}