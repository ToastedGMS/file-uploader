const {
	getFolderView,
	getNewFolder,
	getPreviousFolder,
	renameDirectory,
	deleteFolder,
	deleteFile,
} = require('../controllers/folderController');

const router = require('express').Router();

router.get('/', getFolderView);

router.get('/selection', getNewFolder);

router.get('/previous', getPreviousFolder);

router.post('/rename-dir', renameDirectory);

router.post('/remove-dir', deleteFolder);

router.post('/delete-file', deleteFile);

module.exports = router;
