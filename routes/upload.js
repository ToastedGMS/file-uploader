const {
	getUploadView,
	handleUploadResponse,
	createFolder,
} = require('../controllers/uploadController');

const router = require('express').Router();

router.get('/', getUploadView);

router.post('/', handleUploadResponse);

router.post('/create-dir', createFolder);

module.exports = router;
