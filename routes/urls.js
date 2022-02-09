const express = require('express');
const { body } = require('express-validator');

const urlController = require('../controllers/urls');
const isAuth = require('../middlewares/is-auth');

const router =  express.Router();


router.get('/', urlController.getUrl);

router.get('/url-list', isAuth, urlController.getUrlList);

router.post('/shortened',[
    body('long_url', 'Must be a valid Url')
        .isURL()
        .trim()
],  urlController.postUrl);

router.get('/:short', urlController.getSite);

module.exports = router;