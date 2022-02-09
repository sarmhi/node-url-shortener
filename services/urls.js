const randomstring = require("randomstring");

const Url = require('../models/urls');

exports.generateString = async () => {
    let genString = randomstring.generate(7);
    try {
        let url = await Url.findOne({ short_url: genString });
        while (url) {
            genString = randomstring.generate(7);
            url = await Url.findOne({ short_url: genString });
        }
        return genString;
    } catch (error) {
        console.log(error)
    }    
}
