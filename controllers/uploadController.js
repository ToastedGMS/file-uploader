const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
	upload.single('file')(req, res, function (error) {
		const messages = { error: null, success: null };

		if (error) {
			messages.error = 'Unexpected error occurred.';
			return res.render('upload', { messages });
		}
		if (!req.file) {
			messages.error = 'No file found.';
			return res.render('upload', { messages });
		}

		messages.success = `File uploaded successfully: ${req.file.filename}`;
		return res.render('upload', { messages });
	});
}

function createFolder(req, res) {
	fs.mkdir(`./uploads/${req.body.dir}`, { recursive: true }, (err) => {
		const messages = { error: null, success: null };

		if (err) {
			messages.error = `Error creating folder: ${err.message}`;
		} else {
			messages.success = `Folder created successfully: /${req.body.dir}`;
		}

		// Pass messages to the 'upload' view
		return res.render('upload', { messages });
	});
}

function getFolderContent(req, res) {
	const folder = './uploads';

	fs.readdir(folder, (err, files) => {
		if (err) {
			return res.status(500).send('Unable to scan folder: ' + err);
		}
		console.log('files:', files);
	});
}

module.exports = {
	getUploadView,
	handleUploadResponse,
	createFolder,
	getFolderContent,
};
