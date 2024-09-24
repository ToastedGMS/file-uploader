const { getLoginView, logInUser } = require('../controllers/loginController');

const router = require('express').Router();

router.get('/', getLoginView);

router.post('/', logInUser);

module.exports = router;
