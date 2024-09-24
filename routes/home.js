const { getHomeView } = require('../controllers/homeController');

const router = require('express').Router();

router.get('/', getHomeView);

module.exports = router;
