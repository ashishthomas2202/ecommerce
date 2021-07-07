const express = require('express');
const router = express.Router();

const { requireSignin, isAuth, isAdmin, isEmployee } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const level = 0;

router.get('/secret/:userId', requireSignin, isAuth, isEmployee(level), function(req, res) {
    res.json({
        user: req.profile
    });
})

router.param('userId', userById);

module.exports = router;