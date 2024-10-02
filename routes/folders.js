const {
	getFolderView,
	getNewFolder,
	getPreviousFolder,
} = require('../controllers/folderController');

const router = require('express').Router();

router.get('/', getFolderView);

router.get('/selection', getNewFolder);

router.get('/previous', getPreviousFolder);

module.exports = router;
