const { getDashboardView } = require('../controllers/dashboardController');

const router = require('express').Router();

router.get('/', getDashboardView);

module.exports = router;
