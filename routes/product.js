const express = require('express');
const router = express.Router();

const { requireSignin, isAuth, isEmployee, isAdmin } = require('../controllers/auth');
const { read, productById, create, remove } = require('../controllers/product');
const { userById } = require('../controllers/user');
const level = 1;

router.post('/product/create/:userId', requireSignin, isAuth, isEmployee(level), create);
router.get('/product/:productId', read);
router.delete('/product/:productId/:userId', requireSignin, isAuth, isEmployee(level), remove);

router.param('userId', userById);
router.param('productId', productById);

module.exports = router;