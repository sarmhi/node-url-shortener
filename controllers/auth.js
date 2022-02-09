const CryptoJS = require("crypto-js");
const { validationResult } = require('express-validator');

const User = require('../models/users');


exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        pageTitle: 'Sign Up',
        errorMessage: message,
        validationErrors: [],
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        },
    })
};

exports.postSignup = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('auth/signup', {
            pageTitle: 'Sign up',
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            oldInput: {
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword
            },
        })
    }

    const hashedPw = CryptoJS.AES.encrypt(password, 'somethingSecret').toString();
    const user = new User({
        email: email,
        password: hashedPw,
        urls: []
    })
        await user.save();
    res.redirect('/login');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
    



};

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        errorMessage: message,
        validationErrors: [],
        oldInput: {
            email: '',
            password: ''
        },
    })
};

exports.postLogin = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            return res.render('auth/login', {
                pageTitle: 'Login',
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array(),
                oldInput: {
                    email: email,
                    password: password
                },
            })
        }
    
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.render('auth/login', {
                pageTitle: 'Login',
                errorMessage: 'Invalid email.',
                validationErrors: [{param: 'email'}],
                oldInput: {
                    email: email,
                    password: password
                },
            })
        }
    
        const bytes = CryptoJS.AES.decrypt(user.password, 'somethingSecret');
        const savedPassword = bytes.toString(CryptoJS.enc.Utf8);
    
        if (password !== savedPassword) {
            return res.render('auth/login', {
                pageTitle: 'Login',
                errorMessage: "Inputed password is incorrect",
                validationErrors: [{param: 'password'}],
                oldInput: {
                    email: email,
                    password: password
                },
            })
        }
    
        req.session.isLoggedIn = true;
        req.session.user = user;
        await req.session.save()
        res.redirect("/url");
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode= 500;
        return next(error);
    }

};

exports.postLogout = (req, res, next) => {
    try {
        req.session.destroy();
        res.redirect("/url");
    } catch (err) {
        const error =  new Error(err);
        error.httpStatusCode= 500;
        return next(error);
    }
}