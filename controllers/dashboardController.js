function getDashboardView(req, res) {
	if (req.isAuthenticated()) {
		return res.redirect('/folder');
	} else {
		return res.redirect('/login');
	}
}

module.exports = { getDashboardView };
