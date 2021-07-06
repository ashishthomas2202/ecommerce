const express = require('express');
const router = express.Router();

const { signup } = require('../controllers/auth');

const { createValidator, checkValidator } = require('../validators/auth');

router.post('/signup', createValidator('signup'), checkValidator, signup);

module.exports = router;