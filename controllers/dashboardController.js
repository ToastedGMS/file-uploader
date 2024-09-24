function getDashboardView(req, res) {
	if (req.isAuthenticated()) {
		return res.render('dashboard');
	} else {
		return res.redirect('/login');
	}
}

module.exports = { getDashboardView };
