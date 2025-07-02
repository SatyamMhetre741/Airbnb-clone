const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res) => {
    res.render("auth/login", {
        pageTitle: "Login",
        errorMessage: null,
        isLoggedIn: false
    });
}

exports.postLogin = (req, res) => {
    const { email, password } = req.body;
    
    User.findByEmail(email)
        .then(user => {
            if (!user) {
                return res.render('auth/login', {
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password',
                    isLoggedIn: false
                });
            }
            
            // bcrypt.compare returns a promise, so we need to handle it
            return user.checkPassword(password)
                .then(isMatch => {
                    if (!isMatch) {
                        return res.render('auth/login', {
                            pageTitle: 'Login',
                            errorMessage: 'Invalid email or password',
                            isLoggedIn: false
                        });
                    }
                    
                    // Set up the session
                    req.session.isLoggedIn = true;
                    req.session.user = { 
                        email: user.email,
                        userId: user._id,
                        userType: user.userType
                    };
                    
                    // Save the session before redirecting
                    return req.session.save(err => {
                        if (err) {
                            console.error(err);
                        }
                        if(user.userType === 'Business') {
                            return res.redirect('/host/host-home-list');
                        } else {
                            return res.redirect('/');
                        }
                    });
                });
        })
        .catch(err => {
            console.error(err);
            res.render('auth/login', {
                pageTitle: 'Login',
                errorMessage: 'An error occurred. Please try again.',
                isLoggedIn: false
            });
        });
}

exports.postLogout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
        }
        res.redirect('/');
    });
}

// Add a GET version of logout that calls the same function
exports.getLogout = exports.postLogout;

// Registration functionality
exports.getSignup = (req, res) => {
    res.render("auth/signup", {
        pageTitle: "Sign Up",
        errorMessage: null,
        isLoggedIn: false,
        oldInput: { email: '', password: '', confirmPassword: '' }
    });
};

exports.postSignup = (req, res) => {
    const { email, password, confirmPassword, userType } = req.body;
    
    // Validate inputs
    if (!email || !email.includes('@') || !password || password.length < 5) {
        return res.render('auth/signup', {
            pageTitle: 'Sign Up',
            errorMessage: 'Please enter a valid email and password (at least 5 characters)',
            isLoggedIn: false,
            oldInput: { email, password, confirmPassword }
        });
    }
    
    if (password !== confirmPassword) {
        return res.render('auth/signup', {
            pageTitle: 'Sign Up',
            errorMessage: 'Passwords do not match',
            isLoggedIn: false,
            oldInput: { email, password, confirmPassword }
        });
    }
    
    // Check if user already exists
    User.findByEmail(email)
        .then(existingUser => {
            if (existingUser) {
                return res.render('auth/signup', {
                    pageTitle: 'Sign Up',
                    errorMessage: 'Email already exists, please use a different one or login',
                    isLoggedIn: false,
                    oldInput: { email, password, confirmPassword }
                });
            }
            
            // Create new user
            // encrypting the password
            bcrypt.hash(password, 10)
                .then(hashedPassword => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        userType: userType,
                        favorites: [],
                        listings: []
                    });
                    return user.save();
                })
                .then(result => {
                    res.redirect('/login');
                })
                .catch(err => {
                    console.error(err);
                    res.render('auth/signup', {
                        pageTitle: 'Sign Up',
                        errorMessage: 'An error occurred. Please try again.',
                        isLoggedIn: false,
                        oldInput: { email, password, confirmPassword, userType }
                    });
                });
        });
};