const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const authControllers = require('../controllers/auth');
const User = require('../models/users');

router.get('/signup', authControllers.getSignup);

router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom(value=> {
            return User.findOne({email: value}).then(userDoc=> {
                if (userDoc){
                    return Promise.reject(
                        'E-Mail exists already, please pick a different one.'
                        );
                }
            })
        })
        .normalizeEmail(),
    body('password', 'Please enter a password with only numbers and text and at least 5 characters.')
        .isLength({min: 5})
        .isAlphanumeric()
        .trim(),
    body('confirmPassword')
        .trim()
        .custom((value, {req})=>{
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
              }
              return true;
        })
], authControllers.postSignup);

router.get('/login', authControllers.getLogin);

router.post('/login',[
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .normalizeEmail(),
    body('password', 'Please enter a password with only numbers and text and at least 5 characters.')
        .isLength({min: 5})
        .isAlphanumeric()
        .trim(),
], authControllers.postLogin);

router.post('/logout', authControllers.postLogout);



module.exports = router;