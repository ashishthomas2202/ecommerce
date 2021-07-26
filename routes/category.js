const express = require('express');
const router = express.Router();

const { categoryById, create, read, update, remove, list } = require('../controllers/category');
const { requireSignin, isAuth, isEmployee, isAdmin } = require('../controllers/auth');
const { createValidator, checkValidator } = require('../validators/category');
const { userById } = require('../controllers/user');

const level = 1;

router.param('userId', userById);
router.param('categoryId', categoryById);

router.post('/category/create/:userId', requireSignin, isAuth, isEmployee(level), createValidator('create'), checkValidator, create);
router.get('/category/:categoryId', read);
router.put('/category/edit/:categoryId/:userId', requireSignin, isAuth, isEmployee(level), createValidator('update'), checkValidator, update);
router.delete('/category/edit/:categoryId/:userId', requireSignin, isAuth, isEmployee(level), remove);
router.get('/categories/list', list);




module.exports = router;