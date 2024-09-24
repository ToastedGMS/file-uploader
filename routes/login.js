const { getLoginView } = require('../controllers/loginController');

const router = require('express').Router();

router.get('/', getLoginView);

module.exports = router;
