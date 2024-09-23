require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const initialize = require('./config/passport-config');
const flash = require('express-flash');

const app = express();
initialize(passport);

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(flash());
app.use((req, res, next) => {
	res.locals.messages = req.flash();
	next();
});

// Session setup
app.use(
	session({
		secret: process.env.SESSION_SECRET || 'secret_key_lmao',
		resave: false,
		saveUninitialized: false,
	})
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Routes

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
