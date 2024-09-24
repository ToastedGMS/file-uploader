const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

function initialize(passport, prisma) {
	async function authenticateUser(email, password, done) {
		try {
			const user = await prisma.user.findUnique({ where: { email } });

			if (!user) {
				return done(null, false, { message: 'Email or password incorrect' });
			}

			const checkPassword = await bcrypt.compare(password, user.password);

			if (checkPassword) {
				return done(null, user);
			} else {
				return done(null, false, { message: 'Email or password incorrect' });
			}
		} catch (error) {
			console.error('Error during passport initialize function', error);
			return done(error);
		}
	}

	passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

	// Passport serialization
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});
	passport.deserializeUser(async (id, done) => {
		try {
			const user = await prisma.user.findUnique({ where: { id } });
			done(null, user);
		} catch (err) {
			done(err);
		}
	});
}
module.exports = initialize;
