const express = require('express');
const router = express.Router();

const { signup, signin, signout, requireSignin } = require('../controllers/auth');

const { createValidator, checkValidator } = require('../validators/auth');

router.post('/signup', createValidator('signup'), checkValidator, signup);
router.post('/signin', createValidator('signin'), checkValidator, signin);
router.get('/signout', signout);


module.exports = router;