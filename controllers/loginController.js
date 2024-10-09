const passport = require('passport');
const messages = { error: null, success: null };
const path = require('path');

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

			req.session.rootFolder = path.join(
				__dirname,
				'..',
				'uploads',
				`${user.id}`
			);
			req.session.currentFolder = req.session.rootFolder; // Same as above

			req.session.folderHistory = [];

			req.session.save((err) => {
				if (err) {
					return next(err);
				}
				// Redirect to folder view after session is saved
				return res.redirect('/folder');
			});
		});
	})(req, res, next);
}

module.exports = { getLoginView, logInUser };
