const { getFolderView } = require('../controllers/folderController');

const router = require('express').Router();

router.get('/', getFolderView);

module.exports = router;
