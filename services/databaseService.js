const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addUserToDatabase(email, password) {
	const hashedPassword = await bcrypt.hash(password, 10);

	try {
		const newUser = await prisma.user.create({
			data: { email, password: hashedPassword },
		});

		return newUser;
	} catch (error) {
		console.error('Error creating user', error);
		throw error;
	}
}

module.exports = { addUserToDatabase };
