const express = require('express');
const router = express.Router();

const { categoryById, create, update, remove } = require('../controllers/category');
const { requireSignin, isAuth, isEmployee, isAdmin } = require('../controllers/auth');
const { createValidator, checkValidator } = require('../validators/category');
const { userById } = require('../controllers/user');

const level = 1;

router.post('/category/create/:userId', requireSignin, isAuth, isEmployee(level), createValidator('create'), checkValidator, create);
router.put('/category/edit/:categoryId/:userId', requireSignin, isAuth, isEmployee(level), createValidator('update'), checkValidator, update);
router.delete('/category/edit/:categoryId/:userId', requireSignin, isAuth, isEmployee(level), remove);


router.param('userId', userById);
router.param('categoryId', categoryById);

module.exports = router;