const {
	getSignupView,
	createUser,
} = require('../controllers/signupController');

const router = require('express').Router();

router.get('/', getSignupView);

router.post('/', createUser);

module.exports = router;
