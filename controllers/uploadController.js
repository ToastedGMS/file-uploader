function getUploadView(req, res) {
	if (req.isAuthenticated()) {
		res.render('upload');
	} else {
		res.redirect('/login');
	}
}

module.exports = { getUploadView };
