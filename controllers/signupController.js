const { addUserToDatabase } = require('../services/databaseService');

function getSignupView(req, res) {
	res.render('signup');
}

async function createUser(req, res) {
	const { email, password, password2 } = req.body;
	const messages = { error: null, success: null };

	if (password != password2) {
		messages.error = 'Passwords do not match';
		return res.render('signup');
	}

	try {
		const newUser = await addUserToDatabase(email, password);
		messages.success = 'User created successfully!';
		res.redirect('/login');
	} catch (error) {
		messages.error = 'User creation failed.';
		res.render('signup');
	}
}

module.exports = { getSignupView, createUser };
