const express = require('express');
const router = express.Router();

const { categoryById, create, update } = require('../controllers/category');
const { requireSignin, isAuth, isEmployee, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');

const level = 1;

router.post('/category/create/:userId', requireSignin, isAuth, isEmployee(level), create);
router.put('/category/edit/:categoryId/:userId', requireSignin, isAuth, isEmployee(level), update);


router.param('userId', userById);
router.param('categoryId', categoryById);

module.exports = router;