const { validationResult } = require('express-validator');

const urlServices = require('../services/urls');
const Url = require('../models/urls');

exports.getUrl = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('urls/index', {
        pageTitle: 'Url Shortener',
        shortened: false,
        url: null,
        domain: null,
        errorMessage: message,
        validationErrors: []
    })
}

exports.postUrl = async (req, res, next) => {
    try {
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('urls/index', {
            pageTitle: 'Url Shortener',
            shortened: false,
            url: null,
            domain: null,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        })
    }
    const long_url = req.body.long_url;
    const short_url = await urlServices.generateString();

    const existingUrl = await Url.findOne({ long_url: long_url });
    if (existingUrl) {
        return res.render('urls/index', {
            pageTitle: 'Url Shortener',
            shortened: true,
            url: existingUrl,
            domain: req.header('host'),
            errorMessage: null,
            validationErrors: []
        })
    }

    const url = new Url({
        long_url: long_url,
        short_url: short_url
    })
    const savedUrl = await url.save();
    res.render('urls/index', {
        pageTitle: 'Url Shortener',
        shortened: true,
        url: savedUrl,
        domain: req.header('host'),
        errorMessage: null,
        validationErrors: []
    })
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}

exports.getSite = async (req, res, next) => {
    const genString = req.params.short;
    try {
        const url = await Url.findOne({ short_url: genString });
        if (!url) {
            return res.render('urls/index', {
                pageTitle: 'Url Shortener',
                shortened: false,
                url: null,
                domain: null,
                errorMessage: null,
                validationErrors: []
            })
        }
        res.redirect(url.long_url);
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

}

exports.getUrlList = async (req, res, next) => {
    try {
        const urls = await Url.find();
        
        res.render('urls/url-list', {
            pageTitle: 'Url List',
            shortened: false,
            url: null,
            domain: req.header('host'),
            errorMessage: null,
            validationErrors: [],
            urls: urls
        })
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}

