const { body, validationResult } = require('express-validator');

exports.createValidator = function(route) {

    switch (route) {
        case 'create':
        case 'update':
            return [
                body('name').notEmpty().withMessage('Category name is required.').isLength({ min: 3, max: 32 }).withMessage('Category name must be between 3 to 32 characters')
            ];
        default:
            return [];
    }
}

exports.checkValidator = function(req, res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) {
        return next();
    }

    return res.status(422).json({ errors: result.array() });
}