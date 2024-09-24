const { addUserToDatabase } = require('../services/databaseService');

function getSignupView(req, res) {
	res.render('signup');
}

async function createUser(req, res) {
	const { email, password, password2 } = req.body;

	if (password != password2) {
		req.flash('error', 'Passwords do not match');
		return res.render('signup');
	}

	try {
		const newUser = await addUserToDatabase(email, password);
		req.flash('success', 'User created successfully!');
		res.redirect('/login');
	} catch (error) {
		req.flash('error', 'User creation failed.');
		res.render('signup');
	}
}

module.exports = { getSignupView, createUser };
