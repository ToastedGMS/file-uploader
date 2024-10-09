const {
	getFolderView,
	getNewFolder,
	getPreviousFolder,
	renameDirectory,
	deleteFolder,
	deleteFile,
	downloadFile,
	createFolder,
} = require('../controllers/folderController');

const router = require('express').Router();

router.get('/', getFolderView);

router.get('/selection', getNewFolder);

router.get('/previous', getPreviousFolder);

router.post('/rename-dir', renameDirectory);

router.post('/remove-dir', deleteFolder);

router.post('/create-dir', createFolder);

router.post('/delete-file', deleteFile);

router.get('/download-file', downloadFile);

module.exports = router;
