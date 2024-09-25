const { getUploadView } = require('../controllers/uploadController');

const router = require('express').Router();

router.get('/', getUploadView);

module.exports = router;
