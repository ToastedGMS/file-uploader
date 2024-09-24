const { logoutUser } = require('../controllers/logoutController');

const router = require('express').Router();

router.get('/', logoutUser);

module.exports = router;
