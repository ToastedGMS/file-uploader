const multer = require('multer');
const upload = multer({ dest: '/home/gabrielmgs/repos/file-uploader/uploads' });

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

		messages.success = 'File uploaded successfully.';
		return res.render('upload', { messages });
	});
}

module.exports = { getUploadView, handleUploadResponse };
