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
		if (error) {
			req.flash('error', 'Unexpected error.');
			return res.render('upload');
		}
		if (!req.file) {
			req.flash('error', 'No file found.');
			return res.render('upload');
		}
		req.flash('success', 'File uploaded successfully.');
		return res.render('upload');
	});
}

module.exports = { getUploadView, handleUploadResponse };
