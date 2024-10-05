const passport = require('passport');

function getLoginView(req, res) {
	res.render('login');
}

async function logInUser(req, res, next) {
	const messages = { error: null, success: null };

	passport.authenticate('local', (err, user, info) => {
		if (err) {
			return next(err);
		}
		if (!user) {
			messages.error = info.message;
			return res.render('login', { messages });
		}
		req.logIn(user, (err) => {
			if (err) {
				return next(err);
			}
			rootFolder = `${currentFolder}/${user.id}`;
			currentFolder = rootFolder;
			return res.redirect('/folder');
		});
	})(req, res, next);
}

module.exports = { getLoginView, logInUser };
