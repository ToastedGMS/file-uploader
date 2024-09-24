const { getSignupView } = require('../controllers/signupController');

const router = require('express').Router();

router.get('/', getSignupView);

module.exports = router;
