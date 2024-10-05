function logoutUser(req, res) {
	currentFolder = './uploads';
	req.logout((error) => {
		if (error) {
			console.error('Logout error:', error);
			return res.redirect('/folder');
		}
		res.redirect('/login');
	});
}
module.exports = { logoutUser };
