const { addUserToDatabase } = require('../services/databaseService');
const { promisify } = require('util');
const fs = require('fs');
const mkdir = promisify(fs.mkdir);

function getSignupView(req, res) {
	res.render('signup');
}

async function createUser(req, res) {
	const { email, password, password2 } = req.body;
	const messages = { error: null, success: null };

	if (password !== password2) {
		messages.error = 'Passwords do not match';
		return res.render('signup', { messages });
	}

	try {
		const newUser = await addUserToDatabase(email, password);
		const newFolder = path.join(__dirname, 'uploads', String(newUser.id));

		// Create the folder asynchronously using the promisified version of mkdir
		await mkdir(newFolder);

		messages.success = 'User created successfully!';
		res.render('login', { messages });
	} catch (error) {
		console.error('Error:', error);

		// Roll back user creation if folder creation fails
		if (newUser) {
			await prisma.user.delete({ where: { id: newUser.id } });
		}

		messages.error = 'User creation failed.';
		res.render('signup', { messages });
	}
}

module.exports = { getSignupView, createUser };
