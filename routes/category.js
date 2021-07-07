const express = require('express');
const router = express.Router();

const { create } = require('../controllers/category');
const { requireSignin, isAuth, isEmployee, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');

const level = 1;

router.post('/category/create/:userId', requireSignin, isAuth, isEmployee(level), create);

router.param('userId', userById);

module.exports = router;