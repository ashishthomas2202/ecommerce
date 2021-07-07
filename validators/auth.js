const { body, validationResult } = require('express-validator');

exports.createValidator = function(route) {

    switch (route) {
        case 'signup':
            return [
                body('firstName').notEmpty().withMessage('First name is required'),
                body('lastName').notEmpty().withMessage('Last name is required'),
                body('email').notEmpty().withMessage('Email is required').normalizeEmail().isEmail().withMessage("Email is invalid"),
                body('password').notEmpty().withMessage('Password is required').isLength({ min: 6, max: 40 }).withMessage("Password must be between 6 to 40 characters")
            ];
        case 'signin':
            return [
                body('email').notEmpty().withMessage('Email is required').normalizeEmail().isEmail().withMessage("Email is invalid"),
                body('password').notEmpty().withMessage('Password is required').isLength({ min: 6, max: 40 }).withMessage("Password must be between 6 to 40 characters")
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