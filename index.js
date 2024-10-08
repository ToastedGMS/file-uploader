require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const initialize = require('./config/passport-config');
const { PrismaClient } = require('@prisma/client');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const prisma = new PrismaClient();
module.exports = { prisma };

const app = express();
initialize(passport, prisma);

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// Session setup
app.use(
	session({
		secret: process.env.SESSION_SECRET || 'secret_key_lmao',
		resave: false,
		saveUninitialized: false,
		store: new PrismaSessionStore(prisma, {
			checkPeriod: 2 * 60 * 1000, //ms
			dbRecordIdIsSessionId: true,
			dbRecordIdFunction: undefined,
		}),
	})
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Routes
const loginRoute = require('./routes/login');
app.use('/login', loginRoute);
app.use('/', loginRoute);
const signupRoute = require('./routes/signup');
app.use('/signup', signupRoute);
const dashboardRoute = require('./routes/dashboard');
app.use('/dashboard', dashboardRoute);
const logoutRoute = require('./routes/logout');
app.use('/logout', logoutRoute);
const uploadRoute = require('./routes/upload');
app.use('/upload', uploadRoute);
const folderRoute = require('./routes/folders');
app.use('/folder', folderRoute);
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
