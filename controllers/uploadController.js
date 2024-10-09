const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getFolderContent } = require('./folderController');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, req.session.currentFolder);
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname); // Original file extension
		const name = path.basename(file.originalname, ext); // Original filename without extension
		cb(null, `${name}${ext}`); // New filename
	},
});

// Initialize multer with the custom storage
const upload = multer({ storage: storage });

function getUploadView(req, res) {
	if (req.isAuthenticated()) {
		res.render('upload');
	} else {
		res.redirect('/login');
	}
}

function handleUploadResponse(req, res) {
	upload.single('file')(req, res, async function (error) {
		const currentFolder = req.session.currentFolder;

		const messages = { error: null, success: null };
		const files = await getFolderContent(`${currentFolder}`);

		if (error) {
			messages.error = 'Unexpected error occurred.';
			return res.render('upload', { messages });
		}
		if (!req.file) {
			messages.error = 'No file found.';
			return res.render('upload', { messages });
		}

		messages.success = `File uploaded successfully: ${req.file.filename} to ${req.session.currentFolder}`;
		return res.render('folder', { messages, files, currentFolder });
	});
}

module.exports = {
	getUploadView,
	handleUploadResponse,
};
