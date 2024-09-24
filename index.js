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
// Session setup
app.use(
	session({
		secret: process.env.SESSION_SECRET || 'secret_key_lmao',
		resave: false,
		saveUninitialized: false,
		cookie: { secure: false },
	})
);
app.use(flash());
app.use((req, res, next) => {
	res.locals.messages = req.flash();
	next();
});

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Routes
const homeRoute = require('./routes/home');
app.use('/', homeRoute);
const signupRoute = require('./routes/signup');
app.use('/signup', signupRoute);
const loginRoute = require('./routes/login');
app.use('/login', loginRoute);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
