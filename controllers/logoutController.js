function logoutUser(req, res) {
	req.logout((error) => {
		if (error) {
			console.error('Logout error:', error);
			return res.redirect('/folder');
		}
		res.redirect('/login');
	});
}
module.exports = { logoutUser };
