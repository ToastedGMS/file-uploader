const passport = require('passport');
const messages = { error: null, success: null };

function getLoginView(req, res) {
	res.render('login', { messages });
}

async function logInUser(req, res, next) {
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

			req.session.rootFolder = `./uploads/${user.id}`;
			req.session.folderHistory = [];
			req.session.currentFolder = `./uploads/${user.id}`;

			return res.redirect('/folder');
		});
	})(req, res, next);
}

module.exports = { getLoginView, logInUser };
