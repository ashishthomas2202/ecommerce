const express = require('express');
const router = express.Router();

const { requireSignin, isAuth, isEmployee, isAdmin } = require('../controllers/auth');
const { read, productById, create } = require('../controllers/product');
const { userById } = require('../controllers/user');
const level = 1;

router.get('/product/:productId', read)
router.post('/product/create/:userId', requireSignin, isAuth, isEmployee(level), create);

router.param('userId', userById);
router.param('productId', productById);

module.exports = router;