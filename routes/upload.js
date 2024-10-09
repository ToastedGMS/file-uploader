const {
	getUploadView,
	handleUploadResponse,
} = require('../controllers/uploadController');

const router = require('express').Router();

router.get('/', getUploadView);

router.post('/', handleUploadResponse);

module.exports = router;
