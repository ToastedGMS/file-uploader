const passport = require('passport');

function getLoginView(req, res) {
	res.render('login');
}

async function logInUser(req, res, next) {
	passport.authenticate('local', (err, user, info) => {
		if (err) {
			return next(err);
		}
		if (!user) {
			req.flash('error', info.message);
			return res.redirect('/login');
		}
		req.logIn(user, (err) => {
			if (err) {
				return next(err);
			}
			return res.redirect('/dashboard');
		});
	})(req, res, next);
}

module.exports = { getLoginView, logInUser };
