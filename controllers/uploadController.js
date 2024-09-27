const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, './uploads');
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9); // Unique suffix
		const ext = path.extname(file.originalname); // Original file extension
		const name = path.basename(file.originalname, ext); // Original filename without extension
		cb(null, `${name}-${uniqueSuffix}${ext}`); // New filename
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

module.exports = { getUploadView, handleUploadResponse };
