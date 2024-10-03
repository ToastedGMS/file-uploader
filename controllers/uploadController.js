const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getFolderContent } = require('./folderController');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, currentFolder);
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
		const messages = { error: null, success: null };
		const files = await getFolderContent();

		if (error) {
			messages.error = 'Unexpected error occurred.';
			return res.render('upload', { messages });
		}
		if (!req.file) {
			messages.error = 'No file found.';
			return res.render('upload', { messages });
		}

		messages.success = `File uploaded successfully: ${req.file.filename} to ${currentFolder}`;
		return res.render('folder', { messages, files });
	});
}

function createFolder(req, res) {
	fs.mkdir(
		`${currentFolder}/${req.body.dir}`,
		{ recursive: true },
		async (err) => {
			const messages = { error: null, success: null };
			const files = await getFolderContent();

			if (err) {
				messages.error = `Error creating folder: ${err.message}`;
			} else {
				messages.success = `Folder created successfully: ${currentFolder}/${req.body.dir}`;
			}

			// Pass messages to the 'upload' view
			return res.render('folder', { messages, files });
		}
	);
}

module.exports = {
	getUploadView,
	handleUploadResponse,
	createFolder,
};
